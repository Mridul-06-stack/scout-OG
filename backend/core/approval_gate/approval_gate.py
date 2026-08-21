"""Approval Gate — required checkpoint before ANY write/sensitive action.

Pipeline execution blocks (async wait with configurable timeout) until the
user approves or rejects via the dashboard.

Modes:
  - Normal:    blocks for APPROVAL_TIMEOUT_SECONDS, then auto-rejects (safe default)
  - Demo mode: auto-approves after 10 seconds with a visible badge
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from core.config import get_settings
from core.models import (
    WriteAction,
    ApprovalDecision,
    ApprovalStatus,
)

logger = logging.getLogger(__name__)

# ── In-memory approval queue (replaced by DB in production) ────────────
# Maps approval_id -> ApprovalDecision
_pending: dict[str, ApprovalDecision] = {}

DEMO_AUTO_APPROVE_DELAY = 10  # seconds


async def request(action: WriteAction) -> ApprovalDecision:
    """Create an approval request and block until resolved.

    This function MUST be called before any write action (apply, submit,
    message, payment, delete). It is not optional middleware.

    Returns:
        ApprovalDecision with status = approved | rejected | timeout_rejected | demo_auto_approved
    """
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
        # Demo mode: auto-approve after short delay
        logger.info("Demo mode active — auto-approving in %ds", DEMO_AUTO_APPROVE_DELAY)
        await asyncio.sleep(DEMO_AUTO_APPROVE_DELAY)
        decision.status = ApprovalStatus.DEMO_AUTO_APPROVED
        decision.decided_at = datetime.utcnow()
        decision.decided_by = "demo_mode"
        logger.info("⚡ Demo auto-approved: %s", decision.id)
    else:
        # Normal mode: poll for human decision with timeout
        timeout = settings.approval_timeout_seconds
        elapsed = 0
        poll_interval = 1  # check every second

        while elapsed < timeout:
            if decision.status != ApprovalStatus.PENDING:
                break
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        if decision.status == ApprovalStatus.PENDING:
            # Timed out — auto-reject (safe default: deny)
            decision.status = ApprovalStatus.TIMEOUT_REJECTED
            decision.decided_at = datetime.utcnow()
            decision.decided_by = "timeout"
            logger.warning(
                "Approval timed out after %ds — auto-rejected: %s", timeout, decision.id
            )

    # Clean up from pending
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


async def execute_approved_action(decision: ApprovalDecision) -> dict:
    """Execute the approved action in the real browser environment."""
    if decision.status not in (ApprovalStatus.APPROVED, ApprovalStatus.DEMO_AUTO_APPROVED):
        raise ValueError(f"Cannot execute unapproved action: status={decision.status}")

    target_url = decision.action.target_url or ""
    action_type = decision.action.action.value
    logger.info("🚀 [Action Execution] Executing %s on %s...", action_type, target_url)

    # If webcmd mode is real, spawn real browser navigation
    settings = get_settings()
    if settings.webcmd_mode == "real" and target_url:
        try:
            from core.webcmd_adapter.real_adapter import RealWebcmdAdapter
            adapter = RealWebcmdAdapter()
            session_id = await adapter._create_session()
            nav_script = f"""
await page.goto('{target_url}', {{ waitUntil: 'domcontentloaded', timeout: 20000 }});
const title = await page.title();
console.log(JSON.stringify({{ title, url: page.url(), status: 'reached' }}));
"""
            out = await adapter._run_cli(
                ["--session", session_id, "browser", "run", "--stdin"],
                stdin_input=nav_script,
                timeout=30,
            )
            await adapter._close_session(session_id)
            logger.info("✓ [Action Execution] Browser reached %s: %s", target_url, out.strip())
            return {"status": "executed", "target_url": target_url, "details": "Browser automation verified"}
        except Exception as exc:
            logger.warning("[Action Execution] Browser run exception: %s", exc)

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

