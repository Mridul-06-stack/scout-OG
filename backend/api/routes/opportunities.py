"""Opportunities routes — CRUD + filtering for the canonical Opportunity model."""

from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel

from core.models import OpportunityStatus, ChangeType
from core.scheduler.scheduler import all_opportunities

router = APIRouter(tags=["opportunities"])


class StatusUpdate(BaseModel):
    status: OpportunityStatus


@router.get("/opportunities")
async def list_opportunities(
    vertical: str | None = None,
    status: OpportunityStatus | None = None,
    change_type: ChangeType | None = None,
    tag: str | None = None,
    search: str | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    """List opportunities with optional filters."""
    from storage.db import load_opportunities

    results = [r.model_dump(mode="json") for r in all_opportunities]
    if vertical:
        results = [r for r in results if r.get("vertical") == vertical]

    # If in-memory is empty for this vertical, load from SQLite
    if not results:
        results = load_opportunities(vertical=vertical, limit=limit + offset)
    if status:
        results = [r for r in results if r.get("status") == (status.value if hasattr(status, "value") else status)]
    if change_type:
        results = [r for r in results if r.get("change_type") == (change_type.value if hasattr(change_type, "value") else change_type)]
    if tag:
        tag_lower = tag.lower()
        results = [r for r in results if any(tag_lower in t.lower() for t in r.get("tags", []))]
    if search:
        q = search.lower()
        results = [r for r in results if q in r.get("title", "").lower() or q in (r.get("location") or "").lower()]

    # Sort by match_score descending
    results.sort(key=lambda r: r.get("match_score", 0), reverse=True)

    total = len(results)
    page = results[offset:offset + limit]

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": page,
    }


@router.get("/opportunities/stats")
async def opportunity_stats():
    """Dashboard summary statistics."""
    from storage.db import load_opportunities

    opps = [r.model_dump(mode="json") for r in all_opportunities] if all_opportunities else load_opportunities(limit=500)
    
    total = len(opps)
    new_today = sum(1 for o in opps if o.get("change_type") in (ChangeType.NEW, "new"))
    closing_soon = sum(1 for o in opps if o.get("change_type") in (ChangeType.CLOSING_SOON, "closing_soon"))
    applied = sum(1 for o in opps if o.get("status") in (OpportunityStatus.APPLIED, "applied"))
    by_vertical: dict[str, int] = {}
    for o in opps:
        v = o.get("vertical", "other")
        by_vertical[v] = by_vertical.get(v, 0) + 1

    return {
        "total": total,
        "new_today": new_today,
        "closing_soon": closing_soon,
        "applied": applied,
        "by_vertical": by_vertical,
    }


@router.get("/opportunities/{opp_id}")
async def get_opportunity(opp_id: str):
    """Get a single opportunity by ID."""
    for opp in all_opportunities:
        if opp.id == opp_id:
            return opp.model_dump(mode="json")
    return {"error": "Not found"}, 404


@router.patch("/opportunities/{opp_id}/status")
async def update_status(opp_id: str, body: StatusUpdate):
    """Update the lifecycle status of an opportunity."""
    for opp in all_opportunities:
        if opp.id == opp_id:
            opp.status = body.status
            return {"id": opp_id, "status": opp.status.value}
    return {"error": "Not found"}, 404
