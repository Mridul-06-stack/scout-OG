"""Abstract base class for the webcmd adapter layer.

Defines the explore/compile/execute interface and bakes in retry logic with
tenacity, timeouts, and a circuit-breaker pattern.
"""

from __future__ import annotations

import abc
import asyncio
import logging
from typing import Any

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from core.config import get_settings
from core.models import SourceCandidate, LearnedWorkflow, RawRecord

logger = logging.getLogger(__name__)


# ── Custom Exceptions ──────────────────────────────────────────────────

class WebcmdExplorationError(Exception):
    """Raised when webcmd fails to explore a source."""


class WebcmdExecutionError(Exception):
    """Raised when webcmd fails to execute a learned workflow."""


class WebcmdCompilationError(Exception):
    """Raised when webcmd fails to compile a workflow."""


class CircuitBreakerOpen(Exception):
    """Raised when a source has exceeded consecutive failure limit."""


# ── Retry decorator factory ───────────────────────────────────────────

def _webcmd_retry(max_attempts: int = 3):
    """Tenacity retry: 3 attempts, exponential backoff 1s→2s→4s."""
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type(
            (WebcmdExplorationError, WebcmdExecutionError, WebcmdCompilationError, asyncio.TimeoutError)
        ),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )


# ── Abstract Base ─────────────────────────────────────────────────────

class WebcmdAdapterBase(abc.ABC):
    """Contract that both mock and real webcmd adapters must satisfy."""

    @_webcmd_retry()
    async def explore(self, source: SourceCandidate) -> LearnedWorkflow:
        """Explore an unfamiliar source and learn its structure."""
        settings = get_settings()
        try:
            return await asyncio.wait_for(
                self._explore_impl(source),
                timeout=settings.webcmd_explore_timeout,
            )
        except asyncio.TimeoutError:
            raise WebcmdExplorationError(
                f"Exploration timed out after {settings.webcmd_explore_timeout}s for {source.url}"
            )

    @_webcmd_retry()
    async def compile(self, exploration_result: dict) -> str:
        """Compile exploration results into a reusable command reference."""
        try:
            return await self._compile_impl(exploration_result)
        except Exception as exc:
            raise WebcmdCompilationError(f"Compilation failed: {exc}") from exc

    @_webcmd_retry()
    async def execute(self, workflow: LearnedWorkflow) -> list[RawRecord]:
        """Run a learned/compiled command and return raw extracted data."""
        settings = get_settings()
        try:
            return await asyncio.wait_for(
                self._execute_impl(workflow),
                timeout=settings.webcmd_execute_timeout,
            )
        except asyncio.TimeoutError:
            raise WebcmdExecutionError(
                f"Execution timed out after {settings.webcmd_execute_timeout}s for {workflow.source_url}"
            )

    # ── Subclasses implement these ────────────────────────────────────

    @abc.abstractmethod
    async def _explore_impl(self, source: SourceCandidate) -> LearnedWorkflow:
        ...

    @abc.abstractmethod
    async def _compile_impl(self, exploration_result: dict) -> str:
        ...

    @abc.abstractmethod
    async def _execute_impl(self, workflow: LearnedWorkflow) -> list[RawRecord]:
        ...
