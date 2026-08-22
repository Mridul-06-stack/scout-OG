"""Learned sources registry — tracks which sites have been explored and compiled.

Persists to a JSON file so workflows survive server restarts.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from datetime import datetime

from core.models import LearnedWorkflow

logger = logging.getLogger(__name__)

_REGISTRY_FILE = Path(__file__).resolve().parent.parent.parent / "storage" / "learned_sources_registry.json"


def _load() -> dict[str, dict]:
    if _REGISTRY_FILE.exists():
        with open(_REGISTRY_FILE) as f:
            return json.load(f)
    return {}


def _save(data: dict[str, dict]) -> None:
    _REGISTRY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_REGISTRY_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)


def is_learned(domain: str) -> bool:
    """Check if a domain has already been explored and learned."""
    return domain in _load()


def register(workflow: LearnedWorkflow) -> None:
    """Add a newly learned workflow to the registry."""
    data = _load()
    data[workflow.source_domain] = workflow.model_dump(mode="json")
    _save(data)
    logger.info("Registered learned source: %s", workflow.source_domain)


def get_workflow(domain: str) -> LearnedWorkflow | None:
    """Retrieve a stored workflow by domain."""
    data = _load()
    entry = data.get(domain)
    if entry:
        return LearnedWorkflow(**entry)
    return None


def get_all_workflows() -> list[LearnedWorkflow]:
    """Return all registered workflows."""
    data = _load()
    return [LearnedWorkflow(**v) for v in data.values()]


def remove(domain: str) -> bool:
    """Remove a learned source from the registry."""
    data = _load()
    if domain in data:
        del data[domain]
        _save(data)
        logger.info("Removed learned source: %s", domain)
        return True
    return False


def update_run_status(domain: str, status: str, failures: int = 0) -> None:
    """Update the last run status and failure count for a source."""
    data = _load()
    if domain in data:
        data[domain]["last_run_at"] = datetime.utcnow().isoformat()
        data[domain]["last_run_status"] = status
        data[domain]["consecutive_failures"] = failures
        _save(data)
