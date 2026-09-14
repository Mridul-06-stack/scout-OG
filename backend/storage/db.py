"""SQLite Database Store — persistent storage for opportunities, runs, and approvals."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Any
import uuid
import sqlite3

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

            CREATE TABLE IF NOT EXISTS workflow_executions (
                id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                workflow_name TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at TEXT,
                finished_at TEXT,
                total_steps INTEGER DEFAULT 0,
                completed_steps INTEGER DEFAULT 0,
                screenshots TEXT,
                extracted_items TEXT,
                extracted_text TEXT,
                step_results TEXT,
                error TEXT
            );

            CREATE TABLE IF NOT EXISTS workflow_screenshots (
                id TEXT PRIMARY KEY,
                execution_id TEXT,
                workflow_id TEXT NOT NULL,
                workflow_name TEXT,
                step_id TEXT,
                step_title TEXT,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                screenshot_url TEXT NOT NULL,
                page_url TEXT,
                captured_at TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_opp_vertical ON opportunities(vertical);
            CREATE INDEX IF NOT EXISTS idx_opp_status ON opportunities(status);
            CREATE INDEX IF NOT EXISTS idx_runs_vertical ON pipeline_runs(vertical);
            CREATE INDEX IF NOT EXISTS idx_wf_exec_id ON workflow_executions(workflow_id);
            CREATE INDEX IF NOT EXISTS idx_wf_shots_exec ON workflow_screenshots(execution_id);
            CREATE INDEX IF NOT EXISTS idx_wf_shots_wf ON workflow_screenshots(workflow_id);
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


def load_opportunity_by_id(opp_id: str) -> dict[str, Any] | None:
    """Load a single opportunity by ID from SQLite."""
    with get_connection() as conn:
        cursor = conn.execute("SELECT * FROM opportunities WHERE id = ?", (opp_id,))
        row = cursor.fetchone()
        if row:
            d = dict(row)
            d["tags"] = json.loads(d.get("tags") or "[]")
            d["raw_fields"] = json.loads(d.get("raw_fields") or "{}")
            return d
    return None


def update_opportunity_status(opp_id: str, status: str) -> bool:
    """Update status of an opportunity in SQLite."""
    with get_connection() as conn:
        cursor = conn.execute(
            "UPDATE opportunities SET status = ?, last_seen_at = ? WHERE id = ?",
            (status, datetime.utcnow().isoformat(), opp_id)
        )
        conn.commit()
        return cursor.rowcount > 0


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


def save_workflow_execution(execution: dict[str, Any]) -> None:
    """Persist a workflow execution run in SQLite."""
    with get_connection() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO workflow_executions (
                id, workflow_id, workflow_name, status, started_at,
                finished_at, total_steps, completed_steps, screenshots,
                extracted_items, extracted_text, step_results, error
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            execution.get("id") or str(uuid.uuid4()),
            execution.get("workflow_id", ""),
            execution.get("workflow_name", "Autonomous Workflow"),
            execution.get("status", "success"),
            str(execution.get("started_at", datetime.utcnow().isoformat())),
            str(execution.get("finished_at", datetime.utcnow().isoformat())) if execution.get("finished_at") else None,
            execution.get("total_steps", 0),
            execution.get("completed_steps", 0),
            json.dumps(execution.get("screenshots", [])),
            json.dumps(execution.get("extracted_items", [])),
            execution.get("extracted_text"),
            json.dumps(execution.get("step_results", [])),
            execution.get("error"),
        ))
        conn.commit()


def save_workflow_screenshot(shot: dict[str, Any]) -> None:
    """Persist a captured workflow screenshot record in SQLite."""
    with get_connection() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO workflow_screenshots (
                id, execution_id, workflow_id, workflow_name, step_id,
                step_title, filename, file_path, screenshot_url, page_url, captured_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            shot.get("id") or str(uuid.uuid4()),
            shot.get("execution_id", ""),
            shot.get("workflow_id", ""),
            shot.get("workflow_name", ""),
            shot.get("step_id", ""),
            shot.get("step_title", ""),
            shot.get("filename", ""),
            shot.get("file_path", ""),
            shot.get("screenshot_url", ""),
            shot.get("page_url", ""),
            str(shot.get("captured_at", datetime.utcnow().isoformat())),
        ))
        conn.commit()


def load_workflow_executions(workflow_id: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    """Load workflow execution history from SQLite."""
    with get_connection() as conn:
        if workflow_id:
            cursor = conn.execute(
                "SELECT * FROM workflow_executions WHERE workflow_id = ? ORDER BY started_at DESC LIMIT ?",
                (workflow_id, limit)
            )
        else:
            cursor = conn.execute(
                "SELECT * FROM workflow_executions ORDER BY started_at DESC LIMIT ?",
                (limit,)
            )
        rows = cursor.fetchall()

    results = []
    for row in rows:
        d = dict(row)
        d["screenshots"] = json.loads(d.get("screenshots") or "[]")
        d["extracted_items"] = json.loads(d.get("extracted_items") or "[]")
        d["step_results"] = json.loads(d.get("step_results") or "[]")
        results.append(d)
    return results


def load_workflow_screenshots(workflow_id: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    """Load captured workflow screenshots from SQLite."""
    with get_connection() as conn:
        if workflow_id:
            cursor = conn.execute(
                "SELECT * FROM workflow_screenshots WHERE workflow_id = ? ORDER BY captured_at DESC LIMIT ?",
                (workflow_id, limit)
            )
        else:
            cursor = conn.execute(
                "SELECT * FROM workflow_screenshots ORDER BY captured_at DESC LIMIT ?",
                (limit,)
            )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]

