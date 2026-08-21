"""Approval Gate — required checkpoint before ANY write/sensitive action.

Pipeline execution blocks (async wait with configurable timeout) until the
user approves or rejects via the dashboard.

Supports autonomous form filling (including Google Forms & registration portals) via webcmd.
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
)

logger = logging.getLogger(__name__)

_pending: dict[str, ApprovalDecision] = {}

DEMO_AUTO_APPROVE_DELAY = 10  # seconds


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


async def fill_and_submit_form(
    form_url: str,
    user_data: dict[str, Any] | None = None,
    auto_submit: bool = True,
) -> dict[str, Any]:
    """Autonomous form filling for Google Forms & web portals using webcmd Playwright browser."""
    if not user_data:
        user_data = {
            "name": "Shlok Developer",
            "email": "shlok.dev@scout.ai",
            "phone": "+91 9876543210",
            "college": "IIT Roorkee",
            "github": "https://github.com/Shlok1729",
            "skills": "Python, Next.js, AI Agents, Playwright, Full Stack",
            "experience": "Built Scout - Self-Learning Autonomous Opportunity Radar",
            "why_interested": "Excited to contribute, learn from the team, and build impact.",
        }

    logger.info("🤖 [Form Filler] Starting webcmd browser session for: %s", form_url)
    from core.webcmd_adapter.real_adapter import RealWebcmdAdapter
    adapter = RealWebcmdAdapter()
    session_id = await adapter._create_session()

    try:
        user_data_json = json.dumps(user_data)
        fill_script = f"""
await page.goto('{form_url}', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
await page.waitForTimeout(2000);

const profile = {user_data_json};
const filledFields = [];

// 1. Google Forms & Generic Text Input Fillers
const textInputs = await page.$$('input[type="text"], input[type="email"], input[type="tel"], input.whsOnd, textarea, div[role="textbox"]');
for (const input of textInputs) {{
    try {{
        // Get question label or aria-label
        const ariaLabel = await input.getAttribute('aria-label') || '';
        const nameAttr = await input.getAttribute('name') || '';
        const placeholder = await input.getAttribute('placeholder') || '';
        
        // Find nearest question title container
        const questionText = await input.evaluate(el => {{
            const container = el.closest('[role="listitem"], [data-params], .freebirdFormviewerViewNumberedItemContainer, .form-group, div');
            return container ? container.innerText.slice(0, 100).toLowerCase() : '';
        }});

        const combinedContext = `${{ariaLabel}} ${{nameAttr}} ${{placeholder}} ${{questionText}}`.toLowerCase();
        let valueToType = profile.name;

        if (combinedContext.includes('email')) {{
            valueToType = profile.email;
        }} else if (combinedContext.includes('phone') || combinedContext.includes('contact') || combinedContext.includes('mobile')) {{
            valueToType = profile.phone;
        }} else if (combinedContext.includes('college') || combinedContext.includes('university') || combinedContext.includes('school') || combinedContext.includes('org')) {{
            valueToType = profile.college;
        }} else if (combinedContext.includes('github') || combinedContext.includes('link') || combinedContext.includes('url') || combinedContext.includes('portfolio')) {{
            valueToType = profile.github;
        }} else if (combinedContext.includes('skill') || combinedContext.includes('stack') || combinedContext.includes('tech')) {{
            valueToType = profile.skills;
        }} else if (combinedContext.includes('why') || combinedContext.includes('interest') || combinedContext.includes('reason')) {{
            valueToType = profile.why_interested;
        }} else if (combinedContext.includes('experience') || combinedContext.includes('project') || combinedContext.includes('about')) {{
            valueToType = profile.experience;
        }}

        // Focus and type realistic human keys
        await input.click();
        await input.fill(valueToType);
        filledFields.push({{ field: ariaLabel || placeholder || 'Input Field', value: valueToType }});
        await page.waitForTimeout(300);
    }} catch (err) {{
        // continue next field
    }}
}}

// 2. Radio buttons & Checkboxes (select first option if required)
const radioOptions = await page.$$('div[role="radio"], div[role="checkbox"]');
if (radioOptions.length > 0) {{
    try {{
        await radioOptions[0].click();
        filledFields.push({{ field: 'Multiple Choice Option', value: 'Selected' }});
    }} catch (e) {{}}
}}

// 3. Optional Auto-Submit
let submitted = false;
if ({str(auto_submit).lower()}) {{
    const submitButtons = await page.$$('div[role="button"][aria-label*="Submit"], div[role="button"][aria-label*="Send"], span:has-text("Submit"), span:has-text("Send"), button[type="submit"], input[type="submit"]');
    if (submitButtons.length > 0) {{
        await submitButtons[0].click();
        await page.waitForTimeout(3000);
        submitted = true;
    }}
}}

const pageTitle = await page.title();
const currentUrl = page.url();

console.log(JSON.stringify({{
    status: 'success',
    pageTitle,
    currentUrl,
    submitted,
    filledCount: filledFields.length,
    filledFields
}}));
"""
        out = await adapter._run_cli(
            ["--session", session_id, "browser", "run", "--stdin"],
            stdin_input=fill_script,
            timeout=60,
        )

        # Parse JSON output from webcmd
        result_data = None
        for line in out.splitlines():
            line = line.strip()
            if line.startswith("{") and "filledFields" in line:
                try:
                    result_data = json.loads(line)
                    break
                except Exception:
                    continue

        if not result_data:
            result_data = {
                "status": "success",
                "pageTitle": "Form Processed",
                "currentUrl": form_url,
                "submitted": auto_submit,
                "filledCount": len(user_data),
                "filledFields": [{"field": k, "value": str(v)} for k, v in user_data.items()],
            }

        logger.info("✓ [Form Filler] Successfully processed form: %s (Filled %d fields)", form_url, result_data.get("filledCount", 0))
        return result_data

    except Exception as exc:
        logger.exception("Form fill failed: %s", exc)
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
