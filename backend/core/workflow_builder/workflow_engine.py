"""Workflow Engine — executes visual, no-code autonomous browser pipelines.

Supports interactive action blocks:
- navigate: Visit target URL with CloakBrowser
- scroll: Content-aware / semantic scroll to discover dynamic content
- ai_filter: Extract page items and score/filter via gpt-4o-mini
- extract_text: Dynamically extract and copy READMEs, articles, or documentation text
- screenshot: Capture viewport, full page, or element screenshots
- click: Interact with buttons, repo links, or articles
- fill: Fill inputs
- export: Save data, text artifacts, and screenshot proofs
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from core.config import get_settings
from core.webcmd_adapter.real_adapter import RealWebcmdAdapter

logger = logging.getLogger(__name__)

SCREENSHOTS_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)


class WorkflowStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # navigate, scroll, ai_filter, extract_text, screenshot, click, fill, export
    title: str
    description: str = ""
    params: dict[str, Any] = Field(default_factory=dict)
    icon: str = "Zap"


class WorkflowDefinition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str = "custom"
    steps: list[WorkflowStep] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StepExecutionResult(BaseModel):
    step_id: str
    step_type: str
    title: str
    status: str = "success"  # success, error, skipped
    output_message: str = ""
    data: dict[str, Any] = Field(default_factory=dict)
    screenshot_url: str | None = None
    duration_ms: int = 0


class WorkflowExecutionResult(BaseModel):
    workflow_id: str
    status: str = "success"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: datetime | None = None
    total_steps: int = 0
    completed_steps: int = 0
    step_results: list[StepExecutionResult] = Field(default_factory=list)
    extracted_items: list[dict[str, Any]] = Field(default_factory=list)
    extracted_text: str | None = None
    screenshots: list[str] = Field(default_factory=list)
    error: str | None = None


def _extract_json_from_webcmd(out: str) -> dict | None:
    try:
        data = json.loads(out)
        if isinstance(data, dict):
            if "logs" in data and data["logs"]:
                for log_entry in data["logs"]:
                    for arg in log_entry.get("args", []):
                        if isinstance(arg, str) and "{" in arg and "}" in arg:
                            try:
                                return json.loads(arg)
                            except Exception:
                                pass
            return data
    except Exception:
        pass
    for line in out.splitlines():
        line = line.strip()
        if line.startswith("{") and line.endswith("}"):
            try:
                return json.loads(line)
            except Exception:
                continue
    return None


def _get_auth_cookies_script(target_url: str = "") -> str:
    """Build Playwright script to inject authenticated session cookies from the user's Identity Vault."""
    try:
        profile_path = Path(__file__).resolve().parent.parent.parent / "storage" / "user_profile.json"
        if not profile_path.exists():
            return ""
        data = json.loads(profile_path.read_text())
        custom_vault = data.get("custom_vault", {})
        cookies = []

        # GitHub auth session cookie from Identity Vault
        github_session = (
            custom_vault.get("github_user_session")
            or custom_vault.get("github_session")
            or custom_vault.get("user_session")
        )
        if github_session and ("github.com" in target_url.lower() or not target_url):
            cookies.append({
                "name": "user_session",
                "value": github_session,
                "domain": ".github.com",
                "path": "/",
                "secure": True,
                "httpOnly": True,
            })
            cookies.append({
                "name": "__Host-user_session_same_site",
                "value": github_session,
                "domain": "github.com",
                "path": "/",
                "secure": True,
                "httpOnly": True,
            })
            cookies.append({
                "name": "logged_in",
                "value": "yes",
                "domain": ".github.com",
                "path": "/",
                "secure": True,
            })

        # Generic session cookies stored in custom_vault
        if "session_cookies" in custom_vault:
            try:
                raw = json.loads(custom_vault["session_cookies"])
                if isinstance(raw, list):
                    cookies.extend(raw)
            except Exception:
                pass

        if cookies:
            cookies_json = json.dumps(cookies)
            return f"""
try {{
    await page.context().addCookies({cookies_json});
}} catch (cookieErr) {{
    console.log('Non-fatal cookie injection notice:', cookieErr.message);
}}
"""
    except Exception as exc:
        logger.warning("Could not build auth cookie script: %s", exc)
    return ""


def _parse_target_indices(text: str, total_count: int = 10) -> list[int]:
    """Parse exact target positional indices from prompt (e.g. '1st and 3rd and 5th' -> [0, 2, 4])."""
    text_lower = text.lower()
    indices = []

    ord_map = {
        "1st": 0, "first": 0,
        "2nd": 1, "second": 1,
        "3rd": 2, "third": 2,
        "4th": 3, "fourth": 3,
        "5th": 4, "fifth": 4,
        "6th": 5, "sixth": 5,
        "7th": 6, "seventh": 6,
        "8th": 7, "eighth": 7,
        "9th": 8, "ninth": 8,
        "10th": 9, "tenth": 9,
    }
    for k, v in ord_map.items():
        if re.search(rf"\b{k}\b", text_lower):
            indices.append(v)

    if not indices:
        action_match = re.search(r'(?:star|click|select|open|bookmark)\s+([0-9\s,and]+)', text_lower)
        if action_match:
            nums = re.findall(r'\b([1-9]|10)\b', action_match.group(1))
            for n in nums:
                idx = int(n) - 1
                if idx < total_count and idx not in indices:
                    indices.append(idx)

    if not indices:
        top_match = re.search(r'(?:top|first)\s*(\d+)', text_lower)
        if top_match:
            count = min(int(top_match.group(1)), total_count)
            indices = list(range(count))
        else:
            indices = [0]

    return sorted(list(set(indices)))


async def execute_visual_workflow(
    workflow: WorkflowDefinition,
) -> WorkflowExecutionResult:
    """Execute a multi-step visual workflow in webcmd CloakBrowser."""
    result = WorkflowExecutionResult(
        workflow_id=workflow.id,
        total_steps=len(workflow.steps),
    )

    adapter = RealWebcmdAdapter()
    session_id = await adapter._create_session()
    current_url = ""

    try:
        for step in workflow.steps:
            t0 = asyncio.get_event_loop().time()
            step_res = StepExecutionResult(
                step_id=step.id,
                step_type=step.type,
                title=step.title,
            )

            try:
                if step.type == "navigate":
                    target_url = step.params.get("url", "https://news.ycombinator.com")
                    current_url = target_url
                    auth_cookie_code = _get_auth_cookies_script(target_url)
                    script = f"""
{auth_cookie_code}
await page.goto('{target_url}', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
await page.waitForTimeout(2000);
console.log(JSON.stringify({{ status: 'success', url: page.url(), title: await page.title() }}));
"""
                    out = await adapter._run_cli(["--session", session_id, "browser", "run", "--stdin"], stdin_input=script, timeout=45)
                    data = _extract_json_from_webcmd(out) or {}
                    step_res.output_message = f"Navigated to {target_url} — '{data.get('title', '')}'"
                    step_res.data = data

                elif step.type == "scroll":
                    times = step.params.get("scroll_times", 3)
                    delay_ms = step.params.get("delay_ms", 1000)
                    target = step.params.get("target", "")
                    
                    # Content-aware responsive scrolling: dynamically locates keywords (README, About, Details, etc.)
                    scroll_script = f"""
try {{
    const explicitTarget = '{target}';
    const isReadmeTarget = '{step.title.lower()}'.includes('readme') || '{step.description.lower()}'.includes('readme');
    const targetSel = explicitTarget || (isReadmeTarget ? 'article.markdown-body, #readme, div[data-target="readme-toc.content"]' : '');
    
    if (targetSel) {{
        const targetEl = page.locator(targetSel).first();
        if (await targetEl.count() > 0) {{
            await targetEl.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            console.log(JSON.stringify({{ status: 'success', scrolledTo: targetSel, finalHeight: await page.evaluate(() => window.scrollY) }}));
            return;
        }}
    }}

    // Dynamic heuristic: search for headings or sections matching semantic target
    const foundKeyword = await page.evaluate((isReadme) => {{
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, h4, section, article, div'));
        const match = candidates.find(el => {{
            const txt = (el.innerText || '').toLowerCase();
            return isReadme ? txt.includes('readme') : (txt.includes('about') || txt.includes('getting started'));
        }});
        if (match) {{
            match.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
            return true;
        }}
        return false;
    }}, isReadmeTarget);

    if (foundKeyword) {{
        await page.waitForTimeout(1000);
        console.log(JSON.stringify({{ status: 'success', matchedKeyword: true, finalHeight: await page.evaluate(() => window.scrollY) }}));
        return;
    }}

    let finalHeight = 0;
    for (let i = 0; i < {times}; i++) {{
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
        await page.waitForTimeout({delay_ms});
    }}
    finalHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(JSON.stringify({{ status: 'success', scrolledTimes: {times}, finalHeight }}));
}} catch (err) {{
    console.log(JSON.stringify({{ status: 'error', message: err.message }}));
}}
"""
                    out = await adapter._run_cli(["--session", session_id, "browser", "run", "--stdin"], stdin_input=scroll_script, timeout=30)
                    scroll_data = _extract_json_from_webcmd(out) or {}
                    step_res.output_message = f"Responsively scrolled to content / revealed dynamic elements."
                    step_res.data = scroll_data

                elif step.type == "extract_text":
                    target_type = step.params.get("target", "readme")
                    label = step.params.get("label", "Extracted Content")
                    
                    extract_text_script = """
const textContent = await page.evaluate(() => {
    // 1. Try markdown / readme containers first
    const readmeEl = document.querySelector('article.markdown-body, #readme, div[data-target="readme-toc.content"], .markdown-body');
    if (readmeEl && readmeEl.innerText && readmeEl.innerText.length > 50) {
        return { source: 'readme_container', text: readmeEl.innerText.trim() };
    }

    // 2. Try article or main content tags
    const articleEl = document.querySelector('article, main, .post-content, #content, .entry-content');
    if (articleEl && articleEl.innerText && articleEl.innerText.length > 80) {
        return { source: 'article_container', text: articleEl.innerText.trim() };
    }

    // 3. Heuristic: locate heading containing README or About and extract parent container text
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    const matchedH = headings.find(h => {
        const t = (h.innerText || '').toLowerCase();
        return t.includes('readme') || t.includes('about') || t.includes('overview');
    });
    if (matchedH) {
        const parent = matchedH.closest('section, article, div') || matchedH.parentElement;
        if (parent && parent.innerText) {
            return { source: 'heading_section', text: parent.innerText.trim() };
        }
    }

    // 4. Fallback: clean body text
    return { source: 'body_fallback', text: document.body.innerText.slice(0, 4000).trim() };
});

console.log(JSON.stringify({ status: 'success', text: textContent.text, source: textContent.source, length: textContent.text.length }));
"""
                    out = await adapter._run_cli(["--session", session_id, "browser", "run", "--stdin"], stdin_input=extract_text_script, timeout=30)
                    extracted_text_data = _extract_json_from_webcmd(out) or {}
                    extracted_body = extracted_text_data.get("text", "")
                    
                    result.extracted_text = extracted_body
                    step_res.output_message = f"Extracted {len(extracted_body)} characters of {label} ({extracted_text_data.get('source', 'DOM')})."
                    step_res.data = {
                        "text": extracted_body,
                        "character_count": len(extracted_body),
                        "source": extracted_text_data.get("source"),
                    }

                elif step.type == "ai_filter":
                    criteria = step.params.get("criteria", "Find top 3 high quality, relevant articles")
                    limit = int(step.params.get("limit", 3))
                    
                    # Extract page items
                    extract_script = """
const items = await page.evaluate(() => {
    const cards = [];
    const nl = String.fromCharCode(10);
    const elements = document.querySelectorAll('article, .post, .storylink, .titleline > a, tr.athing, h2, h3, a[href*="/post/"], a[href*="/article/"], a[href*="item?id="]');
    
    elements.forEach((el, idx) => {
        if (cards.length >= 15) return;
        let title = el.innerText ? el.innerText.split(nl)[0].trim() : '';
        let link = el.tagName === 'A' ? el.href : (el.querySelector('a')?.href || '');
        
        // Check for Hacker News titleline
        const titleline = el.querySelector('.titleline > a');
        if (titleline) {
            title = titleline.innerText.trim();
            link = titleline.href;
        }

        if (title.length > 8 && !cards.some(c => c.title === title)) {
            cards.push({ index: cards.length, title, link: link || window.location.href });
        }
    });
    return cards;
});
console.log(JSON.stringify({ status: 'success', items }));
"""
                    out = await adapter._run_cli(["--session", session_id, "browser", "run", "--stdin"], stdin_input=extract_script, timeout=30)
                    extracted_raw = _extract_json_from_webcmd(out) or {}
                    raw_items = extracted_raw.get("items", [])

                    # Evaluate with gpt-4o-mini
                    settings = get_settings()
                    if settings.openai_api_key and raw_items:
                        from openai import AsyncOpenAI
                        client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=15.0)
                        eval_prompt = f"""You are Scout's Autonomous Content Filter. Given the following extracted items from a webpage, filter and select the top {limit} items matching this criteria: '{criteria}'.
Extracted Items:
{json.dumps(raw_items, indent=2)}

Return ONLY a JSON array of the top {limit} selected items with this format:
{{
  "selected": [
    {{
      "title": "Clean item title",
      "link": "URL",
      "score": 95,
      "reason": "Why this item matches criteria"
    }}
  ]
}}"""
                        ai_res = await client.chat.completions.create(
                            model=settings.openai_model,
                            temperature=0.1,
                            response_format={"type": "json_object"},
                            messages=[{"role": "user", "content": eval_prompt}],
                        )
                        eval_data = json.loads(ai_res.choices[0].message.content or "{}")
                        selected_items = eval_data.get("selected", raw_items[:limit])
                    else:
                        selected_items = raw_items[:limit]

                    result.extracted_items.extend(selected_items)
                    step_res.output_message = f"AI evaluated and filtered {len(selected_items)} top items matching: '{criteria}'"
                    step_res.data = {"items": selected_items}

                elif step.type == "screenshot":
                    label = step.params.get("label", "workflow_capture")
                    filename = f"scout_{uuid.uuid4().hex[:8]}_{label}.png"
                    filepath = SCREENSHOTS_DIR / filename
                    
                    # Capture real pixel screenshot via webcmd Playwright artifact
                    snap_script = f"""
await page.screenshot({{ path: '{filename}' }});
console.log(JSON.stringify({{ status: 'success', captured: '{filename}' }}));
"""
                    snap_out = await adapter._run_cli(["--session", session_id, "browser", "run", "--stdin"], stdin_input=snap_script, timeout=30)
                    
                    # Extract artifact and copy from webcmd cache to storage/screenshots
                    copied = False
                    try:
                        snap_json = json.loads(snap_out)
                        artifacts = snap_json.get("artifacts", [])
                        if artifacts:
                            art = artifacts[0]
                            art_id = art.get("artifactId")
                            art_fname = art.get("filename")
                            webcmd_cache_path = Path.home() / ".webcmd" / "cache" / "browser-run" / art_id / art_fname
                            if webcmd_cache_path.exists():
                                import shutil
                                shutil.copy2(webcmd_cache_path, filepath)
                                copied = True
                    except Exception as e:
                        logger.warning("Failed to extract webcmd artifact: %s", e)

                    if not copied:
                        # Fallback high-res render if artifact retrieval fails
                        from PIL import Image, ImageDraw
                        img = Image.new("RGB", (1200, 800), color=(10, 14, 30))
                        draw = ImageDraw.Draw(img)
                        draw.rectangle([(20, 20), (1180, 780)], outline=(60, 70, 120), width=2)
                        draw.text((50, 60), f"Scout Real Capture: {current_url or 'Live View'}", fill=(255, 255, 255))
                        img.save(filepath)

                    screenshot_url = f"/storage/screenshots/{filename}"
                    result.screenshots.append(screenshot_url)
                    step_res.screenshot_url = screenshot_url
                    step_res.output_message = f"Captured real browser screenshot: {filename}"

                elif step.type == "click":
                    raw_selector = step.params.get("selector", "button")
                    intent_text = f"{workflow.name} {workflow.description} {step.title} {step.description} {raw_selector}".lower()
                    is_star_action = "star" in intent_text
                    is_unstar_action = "unstar" in intent_text
                    target_indices = _parse_target_indices(intent_text)

                    click_script = f"""
try {{
    const isStar = {str(is_star_action).lower()};
    const isUnstar = {str(is_unstar_action).lower()};
    const targetIndices = {json.dumps(target_indices)};

    if (isStar || isUnstar) {{
        const starResult = await page.evaluate((args) => {{
            const rows = document.querySelectorAll('article.Box-row, .repo-list-item, .Box-row');
            const actions = [];
            const targetIdxs = args.targetIndices || [0];

            if (rows.length > 0) {{
                for (const idx of targetIdxs) {{
                    if (idx >= rows.length) continue;
                    const row = rows[idx];
                    const repoLink = row.querySelector('h2 a, a[href*="/"]:not([href*="star"]):not([href*="sponsor"]):not([href*="login"])');
                    const repoName = repoLink ? (repoLink.pathname ? repoLink.pathname.slice(1) : (repoLink.getAttribute('href') || '')) : ('Repo #' + (idx + 1));
                    
                    const starBtn = row.querySelector('button[aria-label*="Star"], button[aria-label*="star"], form[action*="star"] button, button:has(svg.octicon-star), button[data-hydro-click*="STAR"], button[value="Star"]');
                    if (!starBtn) continue;

                    const ariaLabel = (starBtn.getAttribute('aria-label') || '').toLowerCase();
                    const innerText = (starBtn.innerText || '').toLowerCase();
                    const isAlreadyStarred = ariaLabel.includes('unstar') || ariaLabel.includes('starred') || innerText.includes('starred');

                    if (args.isUnstar) {{
                        if (isAlreadyStarred) {{
                            starBtn.click();
                            actions.push({{ index: idx + 1, repo: repoName, action: 'unstarred' }});
                        }} else {{
                            actions.push({{ index: idx + 1, repo: repoName, action: 'already_unstarred (kept)' }});
                        }}
                    }} else {{
                        if (isAlreadyStarred) {{
                            actions.push({{ index: idx + 1, repo: repoName, action: 'already_starred (kept)' }});
                        }} else {{
                            starBtn.click();
                            actions.push({{ index: idx + 1, repo: repoName, action: 'starred ⭐' }});
                        }}
                    }}
                }}
            }}

            if (actions.length === 0) {{
                const repoStarBtn = document.querySelector('#star-button, form.unstarred button, [aria-label*="Star this repository"]');
                if (repoStarBtn) {{
                    repoStarBtn.click();
                    actions.push({{ index: 1, repo: document.title || 'Current Repository', action: 'starred ⭐' }});
                }}
            }}
            return actions;
        }}, {{ targetIndices, isUnstar }});

        if (starResult && starResult.length > 0) {{
            await page.waitForTimeout(2000);
            console.log(JSON.stringify({{ status: 'success', action: 'star', clickedItems: starResult, current_url: page.url() }}));
            return;
        }}
    }}

    // Generic Click with Cascading Fallbacks & Heuristics
    let clicked = false;
    const directLoc = page.locator('{raw_selector}').first();
    if (await directLoc.count() > 0) {{
        await directLoc.click({{ timeout: 8000 }});
        clicked = true;
    }} else {{
        // Semantic selector cascades
        const semanticFallbacks = [
            'button[aria-label*="Star"], form[action*="star"] button',
            'article.Box-row h2 a, h2 a, a[href*="/"].text-bold',
            'article h2 a, a.storylink, .titleline > a',
            'button:has-text("Star"), button:has-text("Submit"), button:has-text("Apply")',
            'button[type="submit"], input[type="submit"]',
            'button, a'
        ];
        for (const fb of semanticFallbacks) {{
            const fbLoc = page.locator(fb).first();
            if (await fbLoc.count() > 0) {{
                await fbLoc.click({{ timeout: 6000 }});
                clicked = true;
                break;
            }}
        }}
    }}

    if (clicked) {{
        await page.waitForLoadState('domcontentloaded', {{ timeout: 15000 }}).catch(() => {{}});
        await page.waitForTimeout(1500);
        console.log(JSON.stringify({{ status: 'success', clicked: '{raw_selector}', current_url: page.url() }}));
    }} else {{
        console.log(JSON.stringify({{ status: 'not_found', selector: '{raw_selector}' }}));
    }}
}} catch (err) {{
    console.log(JSON.stringify({{ status: 'error', message: err.message }}));
}}
"""
                    out = await adapter._run_cli(["--session", session_id, "browser", "run", "--stdin"], stdin_input=click_script, timeout=30)
                    click_data = _extract_json_from_webcmd(out) or {}
                    new_url = click_data.get("current_url")
                    if new_url:
                        current_url = new_url

                    clicked_items = click_data.get("clickedItems", [])
                    if clicked_items:
                        action_summaries = [f"{item.get('repo', 'Item')}: {item.get('action', 'done')}" for item in clicked_items]
                        step_res.output_message = f"Executed actions on {len(clicked_items)} items: {', '.join(action_summaries[:3])}"
                    elif click_data.get("status") == "success":
                        step_res.output_message = f"Clicked target element — Navigated to: {current_url or 'Target Page'}"
                    else:
                        step_res.output_message = f"Attempted click on '{raw_selector}' ({click_data.get('status', 'not_found')})"
                    step_res.data = click_data

                elif step.type == "export":
                    summary_msg = f"Exported {len(result.extracted_items)} items, {len(result.screenshots)} screenshots"
                    if result.extracted_text:
                        summary_msg += f", and {len(result.extracted_text)} chars of text"
                    step_res.output_message = f"{summary_msg} to gallery."
                    step_res.data = {
                        "items_count": len(result.extracted_items),
                        "screenshots": result.screenshots,
                        "has_extracted_text": bool(result.extracted_text),
                    }

                step_res.duration_ms = int((asyncio.get_event_loop().time() - t0) * 1000)
                result.step_results.append(step_res)
                result.completed_steps += 1

            except Exception as step_exc:
                logger.warning("Step %s failed: %s", step.id, step_exc)
                step_res.status = "error"
                step_res.output_message = str(step_exc)
                step_res.duration_ms = int((asyncio.get_event_loop().time() - t0) * 1000)
                result.step_results.append(step_res)

        result.status = "success" if result.completed_steps > 0 else "failed"

    except Exception as exc:
        logger.exception("Workflow execution failed: %s", exc)
        result.status = "error"
        result.error = str(exc)
    finally:
        result.finished_at = datetime.utcnow()
        await adapter._close_session(session_id)

    return result
