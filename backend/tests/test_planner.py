import pytest
from core.planner.planner import plan, _guess_default
from core.models import PlanConfig


@pytest.mark.asyncio
async def test_planner_fallback_student():
    """Test planner keyword fallback for student intents."""
    p = await plan("find hackathons in India")
    assert isinstance(p, PlanConfig)
    assert p.vertical == "student_opportunities"
    assert "hackathon" in p.categories


@pytest.mark.asyncio
async def test_planner_fallback_hotel():
    """Test planner keyword fallback for hotel intents."""
    p = await plan("check hotel prices in Manali")
    assert isinstance(p, PlanConfig)
    assert p.vertical == "hotel_price_monitor"
    assert p.schema_ref == "hotel_schema.json"
