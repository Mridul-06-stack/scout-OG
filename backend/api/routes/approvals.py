"""Approval routes — the human checkpoint for write actions."""

from __future__ import annotations

from fastapi import APIRouter

from core.approval_gate.approval_gate import (
    get_pending, get_all, approve, reject,
)

router = APIRouter(tags=["approvals"])


@router.get("/approvals")
async def list_approvals(pending_only: bool = False):
    """List approval requests."""
    items = get_pending() if pending_only else get_all()
    return {
        "total": len(items),
        "items": [d.model_dump(mode="json") for d in items],
    }


@router.post("/approvals/{approval_id}/approve")
async def approve_action(approval_id: str):
    """Approve a pending write action and execute it."""
    import asyncio
    from core.approval_gate.approval_gate import execute_approved_action

    decision = approve(approval_id)
    if decision:
        # Trigger real post-approval execution in background
        asyncio.create_task(execute_approved_action(decision))
        return {"message": "Approved and executing action", "decision": decision.model_dump(mode="json")}
    return {"error": "Approval not found or already resolved"}


@router.post("/approvals/{approval_id}/reject")
async def reject_action(approval_id: str):
    """Reject a pending write action."""
    decision = reject(approval_id)
    if decision:
        return {"message": "Rejected", "decision": decision.model_dump(mode="json")}
    return {"error": "Approval not found or already resolved"}


@router.post("/approvals/simulate")
async def simulate_write_action(
    action: str = "apply",
    description: str = "Submit Application Form for Unstop TechSprint India",
    target_url: str = "https://unstop.com/hackathons/apply",
):
    """Trigger a simulated write action for demo verification.
    
    Creates a WriteAction and initiates the request() flow in background.
    """
    import asyncio
    from core.models import WriteAction, ApprovalAction
    from core.approval_gate.approval_gate import request

    write_act = WriteAction(
        action=ApprovalAction(action),
        opportunity_id="demo-opp-id",
        description=description,
        target_url=target_url,
    )

    task = asyncio.create_task(request(write_act))
    await asyncio.sleep(0.05)

    return {"message": "Write action initiated. Gated for human approval."}


from pydantic import BaseModel, Field


class FormFillRequest(BaseModel):
    form_url: str = Field(..., description="Target Google Form or registration URL")
    user_data: dict[str, Any] | None = Field(default=None, description="Custom field values")
    auto_submit: bool = Field(default=False, description="Whether to click submit button")


@router.post("/approvals/fill-form")
async def fill_form_endpoint(req: FormFillRequest):
    """Directly fill a Google Form or registration portal using webcmd CloakBrowser."""
    from core.approval_gate.approval_gate import fill_and_submit_form
    result = await fill_and_submit_form(
        form_url=req.form_url,
        user_data=req.user_data,
        auto_submit=req.auto_submit,
    )
    return result

