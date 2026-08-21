"""Scout API Server — FastAPI application with CORS and route registration."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import opportunities, pipeline, sources, approvals, profile

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    from storage.db import init_db
    init_db()
    logging.getLogger("scout").info("🔭 Scout API starting up with SQLite persistence...")
    yield
    logging.getLogger("scout").info("Scout API shutting down.")


app = FastAPI(
    title="Scout API",
    description="Self-Learning Opportunity & Workflow Radar",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS — allow dashboard origin ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routes ────────────────────────────────────────────────────
app.include_router(opportunities.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(sources.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "scout"}
