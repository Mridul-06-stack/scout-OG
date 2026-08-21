"""Sources routes — manage learned webcmd workflows."""

from __future__ import annotations

import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from urllib.parse import urlparse

from core.models import SourceCandidate
from core.webcmd_adapter.execute import explore_source
from core.webcmd_adapter.registry import (
    get_all_workflows, register, remove, get_workflow,
)

router = APIRouter(tags=["sources"])


class LearnSourceRequest(BaseModel):
    url: str
    vertical: str = "student_opportunities"
    name: str = ""


@router.get("/sources")
async def list_sources():
    """List all learned source workflows."""
    workflows = get_all_workflows()
    return {
        "total": len(workflows),
        "items": [w.model_dump(mode="json") for w in workflows],
    }


@router.post("/sources/learn")
async def learn_source(body: LearnSourceRequest):
    """Teach Scout a new source URL via webcmd explore → compile flow."""
    domain = urlparse(body.url).netloc

    # Check if already learned
    existing = get_workflow(domain)
    if existing:
        return {
            "message": f"Source {domain} is already learned",
            "workflow": existing.model_dump(mode="json"),
        }

    # Explore the new source
    source = SourceCandidate(
        url=body.url,
        domain=domain,
        vertical=body.vertical,
        name=body.name or domain,
    )

    try:
        workflow = await explore_source(source)
        register(workflow)
        return {
            "message": f"Successfully learned source: {domain}",
            "workflow": workflow.model_dump(mode="json"),
        }
    except Exception as exc:
        return {
            "error": f"Failed to learn source: {exc}",
            "url": body.url,
        }


@router.delete("/sources/{domain}")
async def remove_source(domain: str):
    """Remove a learned source."""
    if remove(domain):
        return {"message": f"Removed source: {domain}"}
    return {"error": f"Source not found: {domain}"}
