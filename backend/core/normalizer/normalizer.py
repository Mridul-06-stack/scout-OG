"""Normalizer — transforms raw extracted data into canonical Opportunity objects.

Uses rule-based field mapping for known source formats, with optional LLM
fallback for fuzzy field mapping on unknown structures.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from core.models import RawRecord, Opportunity

logger = logging.getLogger(__name__)


# ── Field mapping rules per vertical ───────────────────────────────────

# Maps raw_fields keys → Opportunity fields for known source formats
_OPPORTUNITY_FIELD_MAP = {
    "title": ["title", "name", "event_name", "program_name", "opportunity_title"],
    "type": ["type", "category", "opportunity_type", "event_type"],
    "deadline": ["deadline", "end_date", "last_date", "application_deadline", "closes_at"],
    "location": ["location", "venue", "city", "place", "region"],
    "tags": ["tags", "keywords", "topics", "skills"],
}

_HOTEL_FIELD_MAP = {
    "title": ["title", "name", "hotel_name", "property_name"],
    "type": ["type", "property_type"],
    "location": ["location", "address", "city", "area"],
    "tags": ["tags", "amenities"],
}

_GITHUB_FIELD_MAP = {
    "title": ["title", "name", "issue_title", "grant_name"],
    "type": ["type", "issue_type", "category"],
    "deadline": ["deadline", "rfp_deadline", "closes_at"],
    "location": ["repository", "organization", "repo"],
    "tags": ["tags", "labels", "languages", "topics"],
}


def _extract_field(raw: dict[str, Any], candidates: list[str]) -> Any:
    """Try multiple candidate keys and return the first match."""
    for key in candidates:
        if key in raw and raw[key]:
            return raw[key]
    return None


def _parse_deadline(value: Any) -> datetime | None:
    """Best-effort deadline parsing."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
            try:
                return datetime.strptime(value.rstrip("Z"), fmt)
            except ValueError:
                continue
    return None


async def normalize(raw_records: list[RawRecord], vertical: str) -> list[Opportunity]:
    """Convert raw records into canonical Opportunity objects.

    Args:
        raw_records: Raw data from webcmd execution.
        vertical: The vertical name to determine field mapping rules.

    Returns:
        List of normalized Opportunity objects.
    """
    if vertical == "hotel_price_monitor":
        field_map = _HOTEL_FIELD_MAP
    elif vertical == "github_issues_grants":
        field_map = _GITHUB_FIELD_MAP
    else:
        field_map = _OPPORTUNITY_FIELD_MAP
    opportunities: list[Opportunity] = []

    for record in raw_records:
        raw = record.raw_fields

        title = _extract_field(raw, field_map.get("title", [])) or "Untitled"
        opp_type = _extract_field(raw, field_map.get("type", [])) or ""
        deadline_raw = _extract_field(raw, field_map.get("deadline", []))
        location = _extract_field(raw, field_map.get("location", []))
        tags = _extract_field(raw, field_map.get("tags", [])) or []

        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",")]

        opp = Opportunity(
            vertical=vertical,
            source_url=raw.get("url", record.source_url),
            title=title,
            type=opp_type,
            deadline=_parse_deadline(deadline_raw),
            location=location,
            tags=tags,
            raw_fields=raw,
        )
        opportunities.append(opp)

    logger.info("Normalized %d records for vertical=%s", len(opportunities), vertical)
    return opportunities
