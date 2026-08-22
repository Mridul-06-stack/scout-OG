import pytest
from datetime import datetime, timedelta
from core.change_detector.change_detector import diff
from core.models import Opportunity, ChangeType


@pytest.mark.asyncio
async def test_change_detector_new_and_closing_soon():
    opp_urgent = Opportunity(
        vertical="test_vertical",
        source_url="https://test.com/urgent",
        title="Urgent Hackathon",
        deadline=datetime.utcnow() + timedelta(days=3),
    )

    opp_normal = Opportunity(
        vertical="test_vertical",
        source_url="https://test.com/normal",
        title="Summer Hackathon",
        deadline=datetime.utcnow() + timedelta(days=30),
    )

    annotated = await diff([opp_urgent, opp_normal], "test_vertical")
    assert len(annotated) == 2
    
    # Check that urgent item is marked closing_soon
    urgent = next(o for o in annotated if o.title == "Urgent Hackathon")
    assert urgent.change_type == ChangeType.CLOSING_SOON

    # Re-running with unchanged item marks it unchanged
    rerun = await diff([opp_normal], "test_vertical")
    normal_rerun = next(o for o in rerun if o.title == "Summer Hackathon")
    assert normal_rerun.change_type == ChangeType.UNCHANGED
