import pytest
from core.matcher.matcher import score
from core.models import Opportunity, UserProfile


@pytest.mark.asyncio
async def test_matcher_tag_overlap():
    profile = UserProfile(
        vertical_interests=["student_opportunities"],
        attributes={"location": "India"},
        include_tags=["AI", "Python"],
        exclude_tags=["unpaid"],
    )

    opp_high = Opportunity(
        vertical="student_opportunities",
        source_url="https://test.com/1",
        title="AI Python Hackathon",
        tags=["AI", "Python", "hackathon"],
        location="India",
    )

    opp_excluded = Opportunity(
        vertical="student_opportunities",
        source_url="https://test.com/2",
        title="Unpaid Dev Internship",
        tags=["AI", "unpaid"],
        location="India",
    )

    scored = await score([opp_high, opp_excluded], profile)
    assert scored[0].id == opp_high.id
    assert opp_high.match_score > opp_excluded.match_score
    assert opp_excluded.match_score <= 0.1
