"""Source Discovery — finds candidate URLs for a given plan.

Combines curated seed sources from vertical config with optional search-based
discovery (stretch goal for hackathon).
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from urllib.parse import urlparse

from core.models import PlanConfig, SourceCandidate

logger = logging.getLogger(__name__)

_VERTICALS_DIR = Path(__file__).resolve().parent.parent.parent / "verticals"


async def find_sources(plan: PlanConfig) -> list[SourceCandidate]:
    """Return source candidates from seed lists matching the plan's vertical and categories."""

    seeds_file = _VERTICALS_DIR / plan.vertical / "seed_sources.json"
    if not seeds_file.exists():
        logger.warning("No seed_sources.json for vertical %s", plan.vertical)
        return []

    with open(seeds_file) as f:
        seeds = json.load(f)

    candidates: list[SourceCandidate] = []
    
    # Helper to create candidate
    def _make_candidate(entry: dict) -> SourceCandidate:
        url = entry["url"]
        entry_cats = entry.get("categories", [])
        return SourceCandidate(
            url=url,
            domain=urlparse(url).netloc,
            vertical=plan.vertical,
            category=entry_cats[0] if entry_cats else "",
            name=entry.get("name", urlparse(url).netloc),
        )

    # First attempt: category overlap
    if plan.categories:
        plan_cats = [c.lower().replace(" ", "_") for c in plan.categories]
        for entry in seeds:
            entry_cats = [c.lower().replace(" ", "_") for c in entry.get("categories", [])]
            if any(pc in ec or ec in pc for pc in plan_cats for ec in entry_cats):
                candidates.append(_make_candidate(entry))

    # Fallback: if no category match or no categories, include all seed sources
    if not candidates:
        for entry in seeds:
            candidates.append(_make_candidate(entry))

    logger.info("Found %d seed sources for vertical=%s", len(candidates), plan.vertical)
    return candidates
