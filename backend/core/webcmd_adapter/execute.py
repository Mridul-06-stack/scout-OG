"""Webcmd orchestration layer — delegates to mock or real adapter based on config.

Also implements circuit-breaker logic: if a source fails 3 consecutive runs,
it is marked needs_review and skipped until manually re-enabled.
"""

from __future__ import annotations

import logging

from core.config import get_settings
from core.models import SourceCandidate, LearnedWorkflow, RawRecord
from core.webcmd_adapter.base import (
    WebcmdAdapterBase,
    WebcmdExplorationError,
    WebcmdExecutionError,
    CircuitBreakerOpen,
)

logger = logging.getLogger(__name__)

_adapter_instance: WebcmdAdapterBase | None = None

MAX_CONSECUTIVE_FAILURES = 3


def get_adapter() -> WebcmdAdapterBase:
    """Return the active webcmd adapter (mock or real), cached as singleton."""
    global _adapter_instance
    if _adapter_instance is not None:
        return _adapter_instance

    settings = get_settings()
    if settings.webcmd_mode == "real":
        from core.webcmd_adapter.real_adapter import RealWebcmdAdapter
        _adapter_instance = RealWebcmdAdapter()
        logger.info("Using REAL webcmd adapter")
    else:
        from core.webcmd_adapter.mock_adapter import MockWebcmdAdapter
        _adapter_instance = MockWebcmdAdapter()
        logger.info("Using MOCK webcmd adapter")

    return _adapter_instance


async def explore_source(source: SourceCandidate) -> LearnedWorkflow:
    """Explore a new source — delegates to active adapter with error handling."""
    adapter = get_adapter()
    try:
        workflow = await adapter.explore(source)
        logger.info("Successfully explored: %s", source.url)
        return workflow
    except (WebcmdExplorationError, Exception) as exc:
        logger.error("Exploration failed for %s after retries: %s", source.url, exc)
        raise


async def execute_workflow(workflow: LearnedWorkflow) -> list[RawRecord]:
    """Execute a learned workflow with circuit-breaker check."""
    # Circuit breaker: skip sources with too many consecutive failures
    if workflow.consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
        raise CircuitBreakerOpen(
            f"Circuit breaker open for {workflow.source_domain}: "
            f"{workflow.consecutive_failures} consecutive failures. "
            "Mark as needs_review. Re-enable manually."
        )

    adapter = get_adapter()
    try:
        records = await adapter.execute(workflow)
        # Reset failure count on success
        workflow.consecutive_failures = 0
        workflow.last_run_status = "success"
        logger.info(
            "Executed workflow for %s: %d records", workflow.source_domain, len(records)
        )
        return records
    except (WebcmdExecutionError, Exception) as exc:
        workflow.consecutive_failures += 1
        workflow.last_run_status = "failed"
        if workflow.consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
            workflow.last_run_status = "needs_review"
            logger.error(
                "Circuit breaker TRIPPED for %s after %d failures",
                workflow.source_domain,
                workflow.consecutive_failures,
            )
        else:
            logger.warning(
                "Execution failed for %s (attempt %d/%d): %s",
                workflow.source_domain,
                workflow.consecutive_failures,
                MAX_CONSECUTIVE_FAILURES,
                exc,
            )
        raise
