"""Change Detector — diffs current pipeline run against stored snapshots.

Sets change_type on each Opportunity:
  - new:          never seen before
  - updated:      seen before, but fields changed
  - closing_soon: deadline within 7 days and wasn't flagged previously
  - unchanged:    identical to last snapshot
  - removed:      was in last snapshot but not in current run
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

from core.models import Opportunity, ChangeType

logger = logging.getLogger(__name__)

_SNAPSHOTS_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "snapshots"


def _snapshot_path(vertical: str) -> Path:
    _SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    return _SNAPSHOTS_DIR / f"{vertical}_last.json"


def _load_snapshot(vertical: str) -> dict[str, dict]:
    """Load last snapshot as {title_key: raw_data}."""
    path = _snapshot_path(vertical)
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}


def _save_snapshot(vertical: str, records: list[Opportunity]) -> None:
    """Save current run as the new snapshot."""
    snapshot = {}
    for r in records:
        key = _make_key(r)
        snapshot[key] = r.model_dump(mode="json")
    with open(_snapshot_path(vertical), "w") as f:
        json.dump(snapshot, f, indent=2, default=str)


def _make_key(opp: Opportunity) -> str:
    """Create a stable key for deduplication (title + source)."""
    return f"{opp.title.lower().strip()}|{opp.source_url.lower().strip()}"


def _fields_changed(current: dict, previous: dict) -> bool:
    """Check if meaningful fields have changed between runs."""
    compare_fields = ["deadline", "location", "tags", "raw_fields"]
    for field in compare_fields:
        if str(current.get(field)) != str(previous.get(field)):
            return True
    return False


async def diff(current: list[Opportunity], vertical: str) -> list[Opportunity]:
    """Compare current run against last snapshot and annotate change_type.

    Also detects records that were in the previous snapshot but are missing
    from the current run (marked as 'removed').

    Args:
        current: Opportunities from this pipeline run.
        vertical: Vertical name for snapshot storage.

    Returns:
        Annotated list including current records + removed records.
    """
    last = _load_snapshot(vertical)

    for opp in current:
        key = _make_key(opp)
        if key not in last:
            opp.change_type = ChangeType.NEW
        else:
            prev = last[key]
            if _fields_changed(opp.model_dump(mode="json"), prev):
                opp.change_type = ChangeType.UPDATED
            else:
                opp.change_type = ChangeType.UNCHANGED

        # Check for closing_soon
        if opp.deadline:
            days_left = (opp.deadline - datetime.utcnow()).days
            if 0 < days_left <= 7:
                # Only flag if wasn't already closing_soon in last snapshot
                prev_change = last.get(key, {}).get("change_type")
                if prev_change != ChangeType.CLOSING_SOON.value:
                    opp.change_type = ChangeType.CLOSING_SOON

    # Detect removed records
    current_keys = {_make_key(o) for o in current}
    removed: list[Opportunity] = []
    for key, prev_data in last.items():
        if key not in current_keys:
            try:
                removed_opp = Opportunity(**{
                    k: v for k, v in prev_data.items()
                    if k in Opportunity.model_fields
                })
                removed_opp.change_type = ChangeType.REMOVED
                removed_opp.last_seen_at = datetime.utcnow()
                removed.append(removed_opp)
            except Exception:
                pass  # skip malformed snapshot entries

    # Save current as new snapshot
    _save_snapshot(vertical, current)

    result = current + removed
    new_count = sum(1 for r in result if r.change_type == ChangeType.NEW)
    updated_count = sum(1 for r in result if r.change_type == ChangeType.UPDATED)
    closing_count = sum(1 for r in result if r.change_type == ChangeType.CLOSING_SOON)
    logger.info(
        "Change detection: %d new, %d updated, %d closing_soon, %d removed",
        new_count, updated_count, closing_count, len(removed),
    )
    return result
