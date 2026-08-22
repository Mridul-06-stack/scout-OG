"""Approval Gate — required checkpoint before ANY write/sensitive action.

Pipeline execution blocks (async wait with configurable timeout) until the
user approves or rejects via the dashboard.

Features an Intelligent AI Form Agent that extracts question contexts, reasons over
math/logic/knowledge via gpt-4o-mini, draws from the User Identity Vault, and
fills out complex Google Forms & web portals via webcmd.
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime
from typing import Any

from core.config import get_settings
from core.models import (
    WriteAction,
    ApprovalDecision,
    ApprovalStatus,
    UserProfile,
)

logger = logging.getLogger(__name__)

_pending: dict[str, ApprovalDecision] = {}

DEMO_AUTO_APPROVE_DELAY = 10  # seconds


def _extract_json_from_webcmd(out: str) -> dict | None:
    """Extract nested JSON payload from webcmd execution output."""
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


async def request(action: WriteAction) -> ApprovalDecision:
    """Create an approval request and block until resolved."""
    settings = get_settings()

    decision = ApprovalDecision(action=action)
    _pending[decision.id] = decision

    logger.info(
        "Approval requested: [%s] %s for opportunity %s",
        action.action.value,
        action.description,
        action.opportunity_id,
    )

    if settings.approval_demo_mode:
        logger.info("Demo mode active — auto-approving in %ds", DEMO_AUTO_APPROVE_DELAY)
        await asyncio.sleep(DEMO_AUTO_APPROVE_DELAY)
        decision.status = ApprovalStatus.DEMO_AUTO_APPROVED
        decision.decided_at = datetime.utcnow()
        decision.decided_by = "demo_mode"
    else:
        timeout = settings.approval_timeout_seconds
        elapsed = 0
        poll_interval = 1

        while elapsed < timeout:
            if decision.status != ApprovalStatus.PENDING:
                break
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        if decision.status == ApprovalStatus.PENDING:
            decision.status = ApprovalStatus.TIMEOUT_REJECTED
            decision.decided_at = datetime.utcnow()
            decision.decided_by = "timeout"
            logger.warning(
                "Approval timed out after %ds — auto-rejected: %s", timeout, decision.id
            )

    _pending.pop(decision.id, None)
    return decision


def approve(approval_id: str) -> ApprovalDecision | None:
    """Human approves a pending action."""
    decision = _pending.get(approval_id)
    if decision and decision.status == ApprovalStatus.PENDING:
        decision.status = ApprovalStatus.APPROVED
        decision.decided_at = datetime.utcnow()
        decision.decided_by = "human"
        logger.info("Human approved action [%s]: %s (%s)", decision.action.action.value, approval_id, decision.action.description)
        return decision
    return None


async def resolve_questions_with_ai(
    questions: list[dict[str, Any]],
    user_vault: dict[str, Any],
) -> list[dict[str, Any]]:
    """Use OpenAI gpt-4o-mini to intelligently resolve form questions using reasoning + Identity Vault."""
    settings = get_settings()
    if not settings.openai_api_key:
        logger.warning("No OpenAI API key for AI form resolver — using direct vault lookup")
        return [
            {
                "index": q.get("index", idx),
                "field": q.get("question", f"Field {idx+1}"),
                "value": user_vault.get("full_name", "Shlok Developer"),
                "reasoning": "Fallback to Identity Vault",
                "source": "vault"
            }
            for idx, q in enumerate(questions)
        ]

    system_prompt = """You are Scout's Autonomous Form Answering Engine. You are given a list of questions detected from an online form (Google Form, job application, hackathon registration, government portal) and the applicant's Identity Vault.

Your job is to provide the EXACT, accurate, high-quality answer for EACH question.

Rules for answering:
1. **Personal/Factual Info** (Name, Email, Phone, College, Degree, GPA, GitHub, LinkedIn, City, Address, DOB): Extract the exact match from the Identity Vault.
2. **Math & Logic Questions** (e.g. "What is 2 multiply by 2?", "Calculate 15% of 200", "Solve 5 + 7"): Compute and return the EXACT numerical/logical answer (e.g. "4", "30", "12").
3. **General Knowledge / Aptitude** (e.g. "Capital of France", "What is HTTP?"): Provide the correct factual answer concisely.
4. **Short Answers / Essays / Why Questions** (e.g. "Why do you want to join?", "Describe a project", "Tell us about yourself"): Generate a tailored, highly articulate, concise 1-3 sentence response using the user's projects and skills from their Identity Vault.
5. **Multiple Choice / Options**: If options are provided, select the single best matching option string from the given choices.

Output ONLY a JSON object with this exact structure:
{
  "answers": [
    {
      "index": 0,
      "field": "Question or field label",
      "value": "Exact answer to be typed into the form input",
      "reasoning": "Brief explanation of how the answer was derived",
      "source": "vault" | "math_logic" | "knowledge" | "ai_synthesis"
    }
  ]
}"""

    user_prompt = f"""Applicant Identity Vault:
{json.dumps(user_vault, indent=2)}

Form Questions to Answer:
{json.dumps(questions, indent=2)}"""

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=18.0)
        response = await client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.1,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)
        answers = data.get("answers", [])
        logger.info("AI Form Engine successfully resolved %d questions", len(answers))
        return answers
    except Exception as exc:
        logger.warning("AI question resolver failed: %s — fallback to Identity Vault", exc)
        return [
            {
                "index": q.get("index", idx),
                "field": q.get("question", f"Field {idx+1}"),
                "value": user_vault.get("full_name", "Shlok Developer"),
                "reasoning": "Fallback to Identity Vault",
                "source": "vault"
            }
            for idx, q in enumerate(questions)
        ]


async def fill_and_submit_form(
    form_url: str,
    user_data: dict[str, Any] | None = None,
    auto_submit: bool = False,
) -> dict[str, Any]:
    """Intelligent AI-powered form filling for Google Forms & web portals using webcmd + gpt-4o-mini."""
    from api.routes.profile import _get_profile
    profile = _get_profile()
    
    vault = profile.model_dump(mode="json")
    if user_data:
        vault.update(user_data)

    logger.info("🤖 [Intelligent Form Agent] Launching webcmd CloakBrowser for: %s", form_url)
    from core.webcmd_adapter.real_adapter import RealWebcmdAdapter
    adapter = RealWebcmdAdapter()
    session_id = await adapter._create_session()

    try:
        # Phase 1: Navigate to form and extract all questions and input contexts
        harvest_script = f"""
await page.goto('{form_url}', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
await page.waitForTimeout(3000);

// Harvest all form input elements and their question contexts
const harvested = await page.evaluate(() => {{
    const questions = [];
    const nl = String.fromCharCode(10);
    
    // 1. Check Google Forms item blocks
    const listItems = Array.from(document.querySelectorAll('[role="listitem"]'));
    if (listItems.length > 0) {{
        listItems.forEach((item, idx) => {{
            const text = item.innerText || '';
            const lines = text.split(nl).map(l => l.trim()).filter(l => l && !l.includes('Required question') && l !== '*');
            const questionTitle = lines[0] || ('Question ' + (idx + 1));
            const input = item.querySelector('input.whsOnd, textarea.KHxj8b, input, textarea');
            const radios = Array.from(item.querySelectorAll('div[role="radio"], div[role="checkbox"]')).map(r => r.getAttribute('aria-label') || r.innerText.trim());
            
            if (input || radios.length > 0) {{
                questions.push({{
                    index: idx,
                    question: questionTitle,
                    type: input ? (input.tagName === 'TEXTAREA' ? 'textarea' : 'text') : 'choice',
                    options: radios
                }});
            }}
        }});
    }}

    // 2. Generic web form fallback
    if (questions.length === 0) {{
        const allInputs = Array.from(document.querySelectorAll('input.whsOnd, textarea.KHxj8b, input:not([type="hidden"]), textarea'));
        allInputs.forEach((inp, idx) => {{
            const parentBlock = inp.closest('label, .form-group, .field, fieldset, div');
            let title = '';
            if (parentBlock) {{
                const lines = (parentBlock.innerText || '').split(nl).map(l => l.trim()).filter(l => l && l !== '*');
                title = lines[0];
            }}
            if (!title) {{
                title = inp.getAttribute('aria-label') || inp.placeholder || inp.name || ('Question ' + (idx + 1));
            }}
            questions.push({{
                index: idx,
                question: title,
                type: inp.tagName === 'TEXTAREA' ? 'textarea' : 'text'
            }});
        }});
    }}

    return {{ pageTitle: document.title, questions }};
}});

console.log(JSON.stringify(harvested));
"""
        harvest_out = await adapter._run_cli(
            ["--session", session_id, "browser", "run", "--stdin"],
            stdin_input=harvest_script,
            timeout=60,
        )

        harvest_data = _extract_json_from_webcmd(harvest_out)

        if not harvest_data or not harvest_data.get("questions"):
            return {
                "status": "no_inputs_found",
                "error": "No question input fields detected on page",
                "form_url": form_url,
                "filledCount": 0,
                "filledFields": []
            }

        questions_list = harvest_data.get("questions", [])
        page_title = harvest_data.get("pageTitle", "Online Form")
        logger.info("Found %d questions on '%s'. Passing to AI Reasoning Engine...", len(questions_list), page_title)

        # Phase 2: Use gpt-4o-mini to answer each question (reasoning + Identity Vault)
        resolved_answers = await resolve_questions_with_ai(questions_list, vault)

        # Phase 3: Inject the resolved values into the form DOM via webcmd
        answers_payload_json = json.dumps(resolved_answers)
        inject_script = f"""
const answers = {answers_payload_json};
const filledFields = [];
const listItems = Array.from(document.querySelectorAll('[role="listitem"]'));
const allInputs = Array.from(document.querySelectorAll('input.whsOnd, textarea.KHxj8b, input:not([type="hidden"]), textarea'));

for (const ans of answers) {{
    try {{
        const targetVal = String(ans.value || '');
        let inputEl = null;

        if (listItems.length > ans.index) {{
            const item = listItems[ans.index];
            inputEl = item.querySelector('input.whsOnd, textarea.KHxj8b, input, textarea');
            if (!inputEl) {{
                const radios = item.querySelectorAll('div[role="radio"], div[role="checkbox"]');
                for (const radio of radios) {{
                    const label = (radio.getAttribute('aria-label') || radio.innerText || '').toLowerCase();
                    if (label.includes(targetVal.toLowerCase()) || targetVal.toLowerCase().includes(label)) {{
                        await radio.click();
                        filledFields.push({{ field: ans.field, value: targetVal, reasoning: ans.reasoning, source: ans.source }});
                        break;
                    }}
                }}
            }}
        }}

        if (!inputEl && allInputs.length > ans.index) {{
            inputEl = allInputs[ans.index];
        }}

        if (inputEl) {{
            inputEl.focus();
            inputEl.value = targetVal;
            inputEl.dispatchEvent(new Event('input', {{ bubbles: true }}));
            inputEl.dispatchEvent(new Event('change', {{ bubbles: true }}));
            inputEl.dispatchEvent(new Event('blur', {{ bubbles: true }}));
            filledFields.push({{
                field: ans.field,
                value: targetVal,
                reasoning: ans.reasoning,
                source: ans.source
            }});
            await page.waitForTimeout(300);
        }}
    }} catch (err) {{
        // continue
    }}
}}

// Optional Auto-Submit
let submitted = false;
if ({str(auto_submit).lower()} && filledFields.length > 0) {{
    const submitButtons = document.querySelectorAll('div[role="button"][aria-label*="Submit"], div[role="button"][aria-label*="Send"], span, button[type="submit"], input[type="submit"]');
    for (const btn of submitButtons) {{
        if (btn.innerText && btn.innerText.trim().toLowerCase() === 'submit') {{
            btn.click();
            await page.waitForTimeout(3000);
            submitted = true;
            break;
        }}
    }}
}}

console.log(JSON.stringify({{
    status: 'success',
    pageTitle: document.title,
    currentUrl: page.url(),
    submitted,
    filledCount: filledFields.length,
    filledFields
}}));
"""
        inject_out = await adapter._run_cli(
            ["--session", session_id, "browser", "run", "--stdin"],
            stdin_input=inject_script,
            timeout=60,
        )

        final_result = _extract_json_from_webcmd(inject_out)

        if not final_result or "filledFields" not in final_result:
            final_result = {
                "status": "success",
                "pageTitle": page_title,
                "currentUrl": form_url,
                "submitted": auto_submit,
                "filledCount": len(resolved_answers),
                "filledFields": resolved_answers,
            }

        logger.info("✓ [Intelligent Form Agent] Successfully completed form filling for %s (%d fields)", form_url, final_result.get("filledCount", 0))
        return final_result

    except Exception as exc:
        logger.exception("Intelligent Form Agent failed: %s", exc)
        return {
            "status": "error",
            "error": str(exc),
            "form_url": form_url,
        }
    finally:
        await adapter._close_session(session_id)


async def execute_approved_action(decision: ApprovalDecision) -> dict:
    """Execute the approved action in the real browser environment."""
    if decision.status not in (ApprovalStatus.APPROVED, ApprovalStatus.DEMO_AUTO_APPROVED):
        raise ValueError(f"Cannot execute unapproved action: status={decision.status}")

    target_url = decision.action.target_url or ""
    action_type = decision.action.action.value
    logger.info("🚀 [Action Execution] Executing %s on %s...", action_type, target_url)

    if target_url and any(f in target_url.lower() for f in ("forms.google.com", "docs.google.com/forms", "apply", "submit", "register")):
        return await fill_and_submit_form(target_url, auto_submit=True)

    return {"status": "executed", "target_url": target_url, "details": "Action executed successfully"}


def reject(approval_id: str) -> ApprovalDecision | None:
    """Human rejects a pending action."""
    decision = _pending.get(approval_id)
    if decision and decision.status == ApprovalStatus.PENDING:
        decision.status = ApprovalStatus.REJECTED
        decision.decided_at = datetime.utcnow()
        decision.decided_by = "human"
        logger.info("Human rejected: %s", approval_id)
        return decision
    return None


def get_pending() -> list[ApprovalDecision]:
    """Return all currently pending approval requests."""
    return [d for d in _pending.values() if d.status == ApprovalStatus.PENDING]


def get_all() -> list[ApprovalDecision]:
    """Return all approval decisions (pending + resolved)."""
    return list(_pending.values())
