"""Pipeline routes — trigger pipeline runs and view run history."""

from __future__ import annotations

import asyncio
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from core.scheduler.scheduler import run_vertical, pipeline_runs

router = APIRouter(tags=["pipeline"])


class PipelineRunRequest(BaseModel):
    vertical: str = "student_opportunities"
    intent: str = ""


@router.post("/pipeline/run")
async def trigger_pipeline(body: PipelineRunRequest, background_tasks: BackgroundTasks):
    """Trigger a full pipeline run for a vertical.

    Runs in background so the API returns immediately.
    """
    # Create a task that runs the pipeline
    task = asyncio.create_task(run_vertical(body.vertical, body.intent))

    # Return the run ID immediately — client can poll /pipeline/runs
    # Wait just a moment for the run to register
    await asyncio.sleep(0.1)

    latest = pipeline_runs[-1] if pipeline_runs else None
    return {
        "message": f"Pipeline started for {body.vertical}",
        "run_id": latest.id if latest else None,
        "vertical": body.vertical,
    }


@router.get("/pipeline/runs")
async def list_runs(limit: int = 20):
    """List recent pipeline runs."""
    from storage.db import load_pipeline_runs

    if pipeline_runs:
        runs = [r.model_dump(mode="json") for r in sorted(pipeline_runs, key=lambda r: r.started_at, reverse=True)[:limit]]
    else:
        runs = load_pipeline_runs(limit=limit)

    return {
        "total": len(runs),
        "items": runs,
    }


@router.get("/pipeline/runs/{run_id}")
async def get_run(run_id: str):
    """Get details of a specific pipeline run."""
    for run in pipeline_runs:
        if run.id == run_id:
            return run.model_dump(mode="json")
    return {"error": "Not found"}, 404
