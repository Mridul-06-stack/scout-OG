"""Source Discovery — dynamically finds and expands candidate URLs for a given plan.

Combines curated seed sources, user-taught learned workflows, and dynamic
intent-driven search exploration targets.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from urllib.parse import quote_plus, urlparse

from core.models import PlanConfig, SourceCandidate

logger = logging.getLogger(__name__)

_VERTICALS_DIR = Path(__file__).resolve().parent.parent.parent / "verticals"


async def find_sources(plan: PlanConfig) -> list[SourceCandidate]:
    """Return source candidates by combining seed sources, learned workflows, and dynamic intent search targets."""
    candidates: list[SourceCandidate] = []
    seen_urls: set[str] = set()

    def _add_candidate(url: str, name: str, category: str):
        if url and url not in seen_urls:
            seen_urls.add(url)
            candidates.append(
                SourceCandidate(
                    url=url,
                    domain=urlparse(url).netloc,
                    vertical=plan.vertical,
                    category=category,
                    name=name,
                )
            )

    # 1. Load curated seeds from vertical config
    seeds_file = _VERTICALS_DIR / plan.vertical / "seed_sources.json"
    if seeds_file.exists():
        try:
            with open(seeds_file) as f:
                seeds = json.load(f)

            plan_cats = [c.lower().replace(" ", "_") for c in plan.categories] if plan.categories else []

            for entry in seeds:
                entry_cats = [c.lower().replace(" ", "_") for c in entry.get("categories", [])]
                # If category filter matches, or if no category filter provided
                if not plan_cats or any(pc in ec or ec in pc for pc in plan_cats for ec in entry_cats):
                    _add_candidate(
                        entry["url"],
                        entry.get("name", urlparse(entry["url"]).netloc),
                        entry_cats[0] if entry_cats else plan.vertical,
                    )

            # Fallback if category match yielded 0
            if not candidates:
                for entry in seeds:
                    _add_candidate(
                        entry["url"],
                        entry.get("name", urlparse(entry["url"]).netloc),
                        plan.vertical,
                    )
        except Exception as exc:
            logger.warning("Error reading seed sources for %s: %s", plan.vertical, exc)

    # 2. Dynamic Intent-Driven Exploration Targets
    # When user provides specific keywords or search queries, synthesize dynamic search targets
    if plan.search_queries or plan.keywords:
        if plan.vertical == "github_issues_grants":
            for kw in plan.keywords[:3]:
                clean_kw = quote_plus(kw.strip())
                if clean_kw:
                    _add_candidate(
                        f"https://github.com/search?q=label%3Agood-first-issue+{clean_kw}&type=issues",
                        f"GitHub Good First Issues ({kw})",
                        "good_first_issue",
                    )
                    _add_candidate(
                        f"https://github.com/search?q={clean_kw}+bounty&type=issues",
                        f"GitHub Bounties ({kw})",
                        "bounty",
                    )
        elif plan.vertical == "hotel_price_monitor":
            for kw in plan.keywords[:2]:
                clean_kw = quote_plus(kw.strip())
                if clean_kw:
                    _add_candidate(
                        f"https://www.zostel.com/destinations/{kw.lower().replace(' ', '-')}/",
                        f"Zostel ({kw})",
                        "hostel",
                    )
        elif plan.vertical == "student_opportunities":
            for q in plan.search_queries[:2]:
                clean_q = quote_plus(q.strip())
                if clean_q:
                    _add_candidate(
                        f"https://devfolio.co/hackathons?q={clean_q}",
                        f"Devfolio Search ({q})",
                        "hackathon",
                    )

    logger.info("Discovered %d candidate sources for vertical=%s", len(candidates), plan.vertical)
    return candidates
