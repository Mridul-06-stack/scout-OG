"""Scheduler — orchestrates the full Scout pipeline end-to-end.

Each vertical run follows:
  plan → discover → explore/execute → normalize → match → diff → store
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

from core.config import get_settings
from core.models import (
    Opportunity,
    UserProfile,
    PipelineRunInfo,
    RunStatus,
)
from core.planner.planner import plan
from core.discovery.source_discovery import find_sources
from core.webcmd_adapter.execute import explore_source, execute_workflow
from core.webcmd_adapter.registry import (
    is_learned, register, get_workflow, update_run_status,
)
from core.webcmd_adapter.base import CircuitBreakerOpen
from core.normalizer.normalizer import normalize
from core.matcher.matcher import score
from core.change_detector.change_detector import diff

logger = logging.getLogger(__name__)

_VERTICALS_DIR = Path(__file__).resolve().parent.parent.parent / "verticals"

# ── In-memory storage (replaced by DB layer at api level) ──────────────
pipeline_runs: list[PipelineRunInfo] = []
all_opportunities: list[Opportunity] = []


def _load_profile(vertical: str) -> UserProfile:
    """Load the user profile template for a vertical."""
    profile_file = _VERTICALS_DIR / vertical / "profile_template.json"
    if profile_file.exists():
        with open(profile_file) as f:
            return UserProfile(**json.load(f))
    return UserProfile(vertical_interests=[vertical])


async def run_vertical(vertical: str, intent: str = "") -> PipelineRunInfo:
    """Execute the full Scout pipeline for a single vertical.

    This is the main orchestration function that chains all pipeline stages.
    """
    run = PipelineRunInfo(vertical=vertical, intent=intent)
    pipeline_runs.append(run)

    logger.info("━" * 60)
    logger.info("Pipeline START: vertical=%s intent='%s'", vertical, intent)
    logger.info("━" * 60)

    try:
        # ── 1. PLAN ──
        if not intent:
            intent = f"Find all {vertical.replace('_', ' ')}"
        plan_config = await plan(intent)
        logger.info("Plan: vertical=%s categories=%s", plan_config.vertical, plan_config.categories)

        # ── 2. DISCOVER SOURCES ──
        sources = await find_sources(plan_config)
        run.sources_processed = len(sources)
        if not sources:
            logger.warning("No sources found for vertical=%s", vertical)
            run.status = RunStatus.SUCCESS
            run.finished_at = datetime.utcnow()
            return run

        # ── 3. EXPLORE & EXECUTE ──
        all_raw = []
        for src in sources:
            try:
                # Check if already learned
                if is_learned(src.domain):
                    workflow = get_workflow(src.domain)
                else:
                    workflow = await explore_source(src)
                    register(workflow)

                records = await execute_workflow(workflow)
                all_raw.extend(records)
                update_run_status(src.domain, "success", 0)

            except CircuitBreakerOpen as exc:
                run.errors.append(f"Circuit breaker: {src.domain} — {exc}")
                logger.error(str(exc))
            except Exception as exc:
                run.errors.append(f"Source {src.domain} failed: {exc}")
                logger.error("Source %s failed: %s", src.domain, exc)

        # ── 4. NORMALIZE ──
        normalized = await normalize(all_raw, vertical)

        # ── 5. MATCH / SCORE ──
        profile = _load_profile(vertical)
        scored = await score(normalized, profile)

        # ── 6. CHANGE DETECTION ──
        annotated = await diff(scored, vertical)

        # ── 7. STORE ──
        # Deduplicate by title (keep highest scored version)
        seen_titles: dict[str, Opportunity] = {}
        for opp in annotated:
            key = opp.title.lower().strip()
            if key not in seen_titles or opp.match_score > seen_titles[key].match_score:
                seen_titles[key] = opp

        deduped = list(seen_titles.values())

        # Update global store
        existing_titles = {o.title.lower().strip() for o in all_opportunities if o.vertical == vertical}
        for opp in deduped:
            if opp.title.lower().strip() in existing_titles:
                # Update existing
                all_opportunities[:] = [
                    opp if o.title.lower().strip() == opp.title.lower().strip() and o.vertical == vertical
                    else o
                    for o in all_opportunities
                ]
            else:
                all_opportunities.append(opp)

        run.records_found = len(deduped)
        run.new_records = sum(1 for o in deduped if o.change_type.value == "new")
        run.updated_records = sum(1 for o in deduped if o.change_type.value == "updated")
        run.status = RunStatus.SUCCESS

    except Exception as exc:
        run.status = RunStatus.FAILED
        run.errors.append(f"Pipeline error: {exc}")
        logger.exception("Pipeline FAILED for vertical=%s", vertical)

    finally:
        run.finished_at = datetime.utcnow()
        try:
            from storage.db import save_opportunities, save_pipeline_run
            save_opportunities([o.model_dump(mode="json") for o in all_opportunities])
            save_pipeline_run(run.model_dump(mode="json"))
        except Exception as db_exc:
            logger.warning("Could not persist to SQLite: %s", db_exc)

        logger.info(
            "Pipeline END: vertical=%s status=%s records=%d new=%d updated=%d errors=%d",
            vertical, run.status.value, run.records_found,
            run.new_records, run.updated_records, len(run.errors),
        )
        logger.info("━" * 60)

    return run
