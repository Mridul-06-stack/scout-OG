import pytest
from core.normalizer.normalizer import normalize
from core.models import RawRecord, Opportunity


@pytest.mark.asyncio
async def test_normalizer_student():
    records = [
        RawRecord(
            source_url="https://test.com/gsoc",
            source_domain="test.com",
            raw_fields={
                "title": "Google Summer of Code",
                "type": "open_source",
                "location": "Remote",
                "deadline": "2026-09-01T00:00:00",
                "tags": ["open_source", "python"],
            },
        )
    ]
    opps = await normalize(records, "student_opportunities")
    assert len(opps) == 1
    assert opps[0].title == "Google Summer of Code"
    assert opps[0].type == "open_source"
    assert opps[0].location == "Remote"
    assert "open_source" in opps[0].tags


@pytest.mark.asyncio
async def test_normalizer_hotel():
    records = [
        RawRecord(
            source_url="https://test.com/hotel",
            source_domain="test.com",
            raw_fields={
                "hotel_name": "Manali Grand Resort",
                "property_type": "resort",
                "city": "Manali",
                "price_per_night": 2500,
                "amenities": ["wifi", "breakfast"],
            },
        )
    ]
    opps = await normalize(records, "hotel_price_monitor")
    assert len(opps) == 1
    assert opps[0].title == "Manali Grand Resort"
    assert opps[0].type == "resort"
    assert opps[0].location == "Manali"
    assert opps[0].raw_fields["price_per_night"] == 2500
