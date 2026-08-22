import pytest
import asyncio
from core.approval_gate.approval_gate import request, approve, reject, get_pending
from core.models import WriteAction, ApprovalAction, ApprovalStatus


@pytest.mark.asyncio
async def test_approval_gate_human_approve():
    action = WriteAction(
        action=ApprovalAction.APPLY,
        opportunity_id="test-123",
        description="Apply to Hackathon",
    )

    async def auto_approve():
        await asyncio.sleep(0.1)
        pending = get_pending()
        assert len(pending) > 0
        approve(pending[0].id)

    # Run request and approval concurrently
    decision_task = asyncio.create_task(request(action))
    approve_task = asyncio.create_task(auto_approve())

    decision, _ = await asyncio.gather(decision_task, approve_task)
    assert decision.status == ApprovalStatus.APPROVED
    assert decision.decided_by == "human"
