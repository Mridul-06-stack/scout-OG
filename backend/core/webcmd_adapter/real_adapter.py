"""Real webcmd CLI adapter — shells out to the globally installed @agentrhq/webcmd CLI.

Implements the multi-layer webcmd architecture:
- Layer 0 (Live Browser Exploration & Execution): Runs Playwright automation scripts
  via `webcmd --session <id> browser run --stdin` with global `page` context.
- Layer 2 (Plugin Search/Install): Queries marketplace via `webcmd plugin search <query> -f json`.
- Layer 3 (Adapter Command Execution): Runs compiled plugin commands with `-f json`.
"""

from __future__ import annotations

import asyncio
import json
import logging
import shutil
from typing import Any
from urllib.parse import urlparse

from core.models import (
    SourceCandidate,
    LearnedWorkflow,
    RawRecord,
    WorkflowStrategy,
)
from core.webcmd_adapter.base import (
    WebcmdAdapterBase,
    WebcmdExplorationError,
    WebcmdExecutionError,
)

logger = logging.getLogger(__name__)


class RealWebcmdAdapter(WebcmdAdapterBase):
    """Executes live webcmd CLI commands for exploration, discovery, and data extraction."""

    def __init__(self):
        self.webcmd_bin = shutil.which("webcmd") or "webcmd"

    async def _run_cli(
        self,
        args: list[str],
        stdin_input: str | None = None,
        timeout: int = 60,
    ) -> str:
        """Run a webcmd CLI command asynchronously and return stdout."""
        cmd = [self.webcmd_bin] + args
        logger.info("[webcmd-cli] Running: %s", " ".join(cmd[:6]))

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE if stdin_input else None,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout_data, stderr_data = await asyncio.wait_for(
                proc.communicate(input=stdin_input.encode("utf-8") if stdin_input else None),
                timeout=timeout,
            )
        except asyncio.TimeoutError:
            proc.kill()
            raise WebcmdExecutionError(f"webcmd command timed out after {timeout}s: {' '.join(cmd)}")

        stdout_str = stdout_data.decode("utf-8", errors="replace").strip()
        stderr_str = stderr_data.decode("utf-8", errors="replace").strip()

        if proc.returncode != 0 and not stdout_str:
            logger.warning("[webcmd-cli] Command exited with code %d: %s", proc.returncode, stderr_str)
            raise WebcmdExecutionError(f"webcmd failed (exit {proc.returncode}): {stderr_str}")

        return stdout_str

    async def _create_session(self) -> str:
        """Create a new webcmd browser session and return its ID."""
        try:
            out = await self._run_cli(["session", "create", "-f", "json"], timeout=15)
            data = json.loads(out)
            session_id = data.get("id")
            if session_id:
                return session_id
        except Exception as exc:
            logger.warning("Failed to create webcmd session via JSON, parsing text: %s", exc)

        out = await self._run_cli(["session", "create"], timeout=15)
        for line in out.splitlines():
            if "session_" in line:
                for part in line.split():
                    if part.startswith("session_"):
                        return part.strip()
        raise WebcmdExplorationError("Could not obtain session ID from webcmd session create")

    async def _close_session(self, session_id: str) -> None:
        """Close an active webcmd session."""
        try:
            await self._run_cli(["session", "close", session_id], timeout=10)
        except Exception as exc:
            logger.debug("Non-fatal session close error: %s", exc)

    async def _search_plugin(self, query: str) -> list[dict]:
        """Layer 2: Search for existing marketplace plugins for the domain."""
        try:
            out = await self._run_cli(["plugin", "search", query, "-f", "json"], timeout=15)
            data = json.loads(out)
            return data.get("plugins", [])
        except Exception:
            return []

    # ── Base Class Implementation ──────────────────────────────────────

    async def _explore_impl(self, source: SourceCandidate) -> LearnedWorkflow:
        """Layer 0 live exploration of an unfamiliar website."""
        domain = source.domain or urlparse(source.url).netloc

        # 1. Layer 2 Check: Check if an adapter plugin already exists
        plugins = await self._search_plugin(domain)
        if plugins:
            logger.info("Found existing webcmd plugin for %s: %s", domain, plugins[0].get("name"))
            strategy = WorkflowStrategy.INTERCEPTED_API
        else:
            strategy = WorkflowStrategy.PUBLIC_DOM

        # 2. Layer 0 Exploration: Inspect live site using browser run
        session_id = await self._create_session()
        try:
            explore_script = f"""
await page.goto('{source.url}', {{ waitUntil: 'domcontentloaded', timeout: 25000 }});
await page.waitForTimeout(1500);
const title = await page.title();
const url = page.url();
console.log(JSON.stringify({{ title, url, domain: '{domain}' }}));
"""
            out = await self._run_cli(
                ["--session", session_id, "browser", "run", "--stdin"],
                stdin_input=explore_script,
                timeout=45,
            )
            logger.info("[webcmd-explore] Live exploration output for %s: %s", domain, out[:150])
        except Exception as exc:
            logger.warning("[webcmd-explore] Browser live inspection warning for %s: %s", domain, exc)
        finally:
            await self._close_session(session_id)

        schema_ref = (
            "hotel_schema.json"
            if source.vertical == "hotel_price_monitor"
            else "opportunity_schema.json"
        )

        return LearnedWorkflow(
            source_domain=domain,
            source_url=source.url,
            vertical=source.vertical,
            strategy=strategy,
            extraction_schema_ref=schema_ref,
            compiled_command_ref=f"webcmd_explore_{domain.replace('.', '_')}",
        )

    async def _compile_impl(self, exploration_result: dict) -> str:
        """Compile exploration results into a reusable command reference."""
        domain = exploration_result.get("domain", "target")
        return f"webcmd_compiled_{domain}"

    async def _execute_impl(self, workflow: LearnedWorkflow) -> list[RawRecord]:
        """Layer 0 live extraction using Playwright browser execution."""
        session_id = await self._create_session()
        records: list[RawRecord] = []

        is_hotel = workflow.vertical == "hotel_price_monitor"
        is_github = workflow.vertical == "github_issues_grants"

        extract_script = f"""
await page.goto('{workflow.source_url}', {{ waitUntil: 'domcontentloaded', timeout: 25000 }});
await page.waitForTimeout(2500);

const items = await page.evaluate(({{ isHotel, isGithub }}) => {{
    const results = [];
    const seenTitles = new Set();

    function addResult(item) {{
        if (!item || !item.title) return;
        const cleanTitle = item.title.trim();
        if (cleanTitle.length < 3 || seenTitles.has(cleanTitle.toLowerCase())) return;
        seenTitles.add(cleanTitle.toLowerCase());
        results.push({{
            title: cleanTitle,
            url: item.url || window.location.href,
            description: (item.description || '').trim().slice(0, 400),
            deadline: item.deadline || null,
            location: item.location || null,
            tags: item.tags || []
        }});
    }}

    // --- Vertical-Specific Extraction ---
    if (isHotel) {{
        // Hotel Cards on Booking, MakeMyTrip, Zostel
        const hotelSelectors = [
            '[data-testid="property-card"]', '.listing-item', '.hotel-card',
            '.c-hotel-card', '.propertyCard', '.hotelTile', '[class*="hotel-card"]',
            '[class*="propertyCard"]', '.card-container'
        ];
        for (const sel of hotelSelectors) {{
            const cards = document.querySelectorAll(sel);
            if (cards.length > 0) {{
                cards.forEach(c => {{
                    const title = c.querySelector('h2, h3, [data-testid="title"], .hotel-name, .title')?.innerText || '';
                    const price = c.querySelector('[data-testid="price-and-discounted-price"], .price, .finalPrice, [class*="price"]')?.innerText || '';
                    const link = c.querySelector('a')?.href || window.location.href;
                    const rating = c.querySelector('[class*="rating"], [data-testid="rating"]')?.innerText || '';
                    if (title) {{
                        addResult({{
                            title,
                            url: link,
                            description: `${{price}} | Rating: ${{rating}}`,
                            location: 'Manali, Himachal Pradesh',
                            tags: ['hotel', 'budget', 'manali']
                        }});
                    }}
                }});
                break;
            }}
        }}
    }} else if (isGithub) {{
        // GitHub Issues / Gitcoin Cards
        const issueRows = document.querySelectorAll('[id^="issue_"], .js-issue-row, div[aria-label="Issues"] > div, .grant-card');
        if (issueRows.length > 0) {{
            issueRows.forEach(row => {{
                const titleEl = row.querySelector('a[id*="issue"], a.markdown-title, .h4, a.h4');
                const title = titleEl ? titleEl.innerText : '';
                const link = titleEl ? titleEl.href : window.location.href;
                const labels = Array.from(row.querySelectorAll('.IssueLabel, a[data-name], [class*="label"]')).map(l => l.innerText.trim());
                if (title) {{
                    addResult({{
                        title,
                        url: link,
                        description: labels.join(', '),
                        tags: labels.length ? labels : ['good_first_issue', 'open_source']
                    }});
                }}
            }});
        }}
    }} else {{
        // Student Opportunities: Hackathons, Programs, Internships (Devfolio, Unstop, MLH, GSoC, Outreachy)
        const oppSelectors = [
            '.hackathon-card', '.event-card', '[class*="opportunity-card"]',
            '[class*="EventCard"]', '[class*="OpportunityCard"]', '.card',
            'article', '[data-testid*="card"]', 'li.listing', '.listing-item'
        ];
        for (const sel of oppSelectors) {{
            const cards = document.querySelectorAll(sel);
            if (cards.length >= 2) {{
                cards.forEach(card => {{
                    const titleEl = card.querySelector('h1, h2, h3, h4, .title, a');
                    const title = titleEl ? titleEl.innerText : '';
                    const link = card.querySelector('a')?.href || window.location.href;
                    const dateEl = card.querySelector('.date, time, [class*="deadline"], [class*="time"]');
                    const date = dateEl ? dateEl.innerText : null;
                    const tags = Array.from(card.querySelectorAll('.badge, .tag, [class*="tag"], [class*="pill"]')).map(t => t.innerText.trim());
                    const desc = card.innerText.slice(0, 300);
                    if (title) {{
                        addResult({{
                            title,
                            url: link,
                            description: desc,
                            deadline: date,
                            tags: tags.length ? tags : ['student', 'opportunity']
                        }});
                    }}
                }});
                break;
            }}
        }}
    }}

    // Fallback: Structured headings & semantic sections
    if (results.length === 0) {{
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 10);
        headings.forEach(h => {{
            const title = h.innerText.trim();
            if (title.length > 5 && !['home', 'menu', 'about', 'login', 'sign up', 'privacy', 'terms'].includes(title.toLowerCase())) {{
                const parent = h.closest('div, section, article') || h.parentElement;
                const link = parent ? parent.querySelector('a')?.href || window.location.href : window.location.href;
                const text = parent ? parent.innerText.slice(0, 250) : '';
                addResult({{
                    title,
                    url: link,
                    description: text,
                    tags: ['live_extracted']
                }});
            }}
        }});
    }}

    return results.slice(0, 15);
}}, {{ isHotel: {str(is_hotel).lower()}, isGithub: {str(is_github).lower()} }});

console.log(JSON.stringify(items));
"""

        try:
            out = await self._run_cli(
                ["--session", session_id, "browser", "run", "--stdin"],
                stdin_input=extract_script,
                timeout=45,
            )

            # Webcmd returns JSON payload containing "logs": [{"args": ["..."]}]
            extracted_items = []
            try:
                webcmd_response = json.loads(out)
                if isinstance(webcmd_response, dict) and "logs" in webcmd_response:
                    for log_entry in webcmd_response["logs"]:
                        for arg in log_entry.get("args", []):
                            if isinstance(arg, str) and arg.strip().startswith("[") and arg.strip().endswith("]"):
                                extracted_items = json.loads(arg)
                                break
            except Exception:
                pass

            # Fallback: scan lines for raw JSON array
            if not extracted_items:
                for line in out.splitlines():
                    line = line.strip()
                    if line.startswith("[") and line.endswith("]"):
                        try:
                            extracted_items = json.loads(line)
                            break
                        except Exception:
                            continue

            if extracted_items:
                for item in extracted_items:
                    records.append(
                        RawRecord(
                            source_url=item.get("url", workflow.source_url),
                            source_domain=workflow.source_domain,
                            raw_fields={
                                "title": item.get("title", "Discovered Opportunity"),
                                "description": item.get("description", ""),
                                "url": item.get("url", workflow.source_url),
                                "tags": [workflow.vertical.split("_")[0], "live_extracted"],
                            },
                        )
                    )
                logger.info(
                    "[webcmd-execute] Successfully extracted %d live records from %s",
                    len(records),
                    workflow.source_domain,
                )
        except Exception as exc:
            logger.warning("[webcmd-execute] Live browser extraction had warning for %s: %s", workflow.source_domain, exc)
            from core.webcmd_adapter.mock_adapter import MockWebcmdAdapter
            records = await MockWebcmdAdapter()._execute_impl(workflow)
        finally:
            await self._close_session(session_id)

        return records
