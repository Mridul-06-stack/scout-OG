"""SQLite Database Store — persistent storage for opportunities, runs, and approvals."""

from __future__ import annotations

import json
import sqlite3
import logging
from pathlib import Path
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).resolve().parent / "scout.db"


def get_connection() -> sqlite3.Connection:
    """Get a SQLite connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize SQLite tables if they do not exist."""
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS opportunities (
                id TEXT PRIMARY KEY,
                vertical TEXT NOT NULL,
                source_url TEXT NOT NULL,
                title TEXT NOT NULL,
                type TEXT,
                deadline TEXT,
                location TEXT,
                tags TEXT,
                raw_fields TEXT,
                match_score REAL DEFAULT 0.0,
                status TEXT DEFAULT 'discovered',
                first_seen_at TEXT,
                last_seen_at TEXT,
                change_type TEXT DEFAULT 'unchanged'
            );

            CREATE TABLE IF NOT EXISTS pipeline_runs (
                id TEXT PRIMARY KEY,
                vertical TEXT NOT NULL,
                status TEXT NOT NULL,
                intent TEXT,
                plan TEXT,
                sources_checked INTEGER DEFAULT 0,
                records_found INTEGER DEFAULT 0,
                new_records INTEGER DEFAULT 0,
                updated_records INTEGER DEFAULT 0,
                started_at TEXT,
                completed_at TEXT,
                error_message TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_opp_vertical ON opportunities(vertical);
            CREATE INDEX IF NOT EXISTS idx_opp_status ON opportunities(status);
            CREATE INDEX IF NOT EXISTS idx_runs_vertical ON pipeline_runs(vertical);
        """)
        conn.commit()
    logger.info("SQLite database initialized at: %s", DB_PATH)


def save_opportunities(records: list[dict[str, Any]]) -> None:
    """Persist or update opportunities in SQLite."""
    if not records:
        return
    with get_connection() as conn:
        for r in records:
            conn.execute("""
                INSERT OR REPLACE INTO opportunities (
                    id, vertical, source_url, title, type, deadline,
                    location, tags, raw_fields, match_score, status,
                    first_seen_at, last_seen_at, change_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r.get("id"),
                r.get("vertical"),
                r.get("source_url"),
                r.get("title"),
                r.get("type"),
                str(r.get("deadline")) if r.get("deadline") else None,
                r.get("location"),
                json.dumps(r.get("tags", [])),
                json.dumps(r.get("raw_fields", {})),
                r.get("match_score", 0.0),
                r.get("status", "discovered"),
                str(r.get("first_seen_at", datetime.utcnow().isoformat())),
                str(r.get("last_seen_at", datetime.utcnow().isoformat())),
                r.get("change_type", "unchanged"),
            ))
        conn.commit()


def load_opportunities(vertical: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
    """Load opportunities from SQLite, sorted by match_score descending."""
    with get_connection() as conn:
        if vertical:
            cursor = conn.execute(
                "SELECT * FROM opportunities WHERE vertical = ? ORDER BY match_score DESC LIMIT ?",
                (vertical, limit)
            )
        else:
            cursor = conn.execute(
                "SELECT * FROM opportunities ORDER BY match_score DESC LIMIT ?",
                (limit,)
            )
        rows = cursor.fetchall()

    results = []
    for row in rows:
        d = dict(row)
        d["tags"] = json.loads(d.get("tags") or "[]")
        d["raw_fields"] = json.loads(d.get("raw_fields") or "{}")
        results.append(d)
    return results


def save_pipeline_run(run: dict[str, Any]) -> None:
    """Persist pipeline run in SQLite."""
    with get_connection() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO pipeline_runs (
                id, vertical, status, intent, plan, sources_checked,
                records_found, new_records, updated_records, started_at,
                completed_at, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run.get("id"),
            run.get("vertical"),
            run.get("status"),
            run.get("intent"),
            json.dumps(run.get("plan", {})),
            run.get("sources_checked", 0),
            run.get("records_found", 0),
            run.get("new_records", 0),
            run.get("updated_records", 0),
            str(run.get("started_at", datetime.utcnow().isoformat())),
            str(run.get("completed_at", datetime.utcnow().isoformat())) if run.get("completed_at") else None,
            run.get("error_message"),
        ))
        conn.commit()


def load_pipeline_runs(limit: int = 10) -> list[dict[str, Any]]:
    """Load latest pipeline runs from SQLite."""
    with get_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT ?",
            (limit,)
        )
        rows = cursor.fetchall()

    results = []
    for row in rows:
        d = dict(row)
        d["plan"] = json.loads(d.get("plan") or "{}")
        results.append(d)
    return results
