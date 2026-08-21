"""Profile routes — manage user preferences for scoring."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from core.models import UserProfile

router = APIRouter(tags=["profile"])

_VERTICALS_DIR = Path(__file__).resolve().parent.parent.parent / "verticals"

# In-memory profile (loaded from template on first access)
_current_profile: UserProfile | None = None


def _get_profile() -> UserProfile:
    global _current_profile
    if _current_profile is None:
        # Load default from student_opportunities template
        template_file = _VERTICALS_DIR / "student_opportunities" / "profile_template.json"
        if template_file.exists():
            with open(template_file) as f:
                _current_profile = UserProfile(**json.load(f))
        else:
            _current_profile = UserProfile(vertical_interests=["student_opportunities"])
    return _current_profile


class ProfileUpdate(BaseModel):
    vertical_interests: list[str] | None = None
    attributes: dict[str, Any] | None = None
    include_tags: list[str] | None = None
    exclude_tags: list[str] | None = None
    constraints: dict[str, Any] | None = None


@router.get("/profile")
async def get_profile():
    """Get the current user profile."""
    return _get_profile().model_dump(mode="json")


@router.put("/profile")
async def update_profile(body: ProfileUpdate):
    """Update user profile preferences."""
    profile = _get_profile()
    if body.vertical_interests is not None:
        profile.vertical_interests = body.vertical_interests
    if body.attributes is not None:
        profile.attributes = body.attributes
    if body.include_tags is not None:
        profile.include_tags = body.include_tags
    if body.exclude_tags is not None:
        profile.exclude_tags = body.exclude_tags
    if body.constraints is not None:
        profile.constraints = body.constraints
    return {"message": "Profile updated", "profile": profile.model_dump(mode="json")}
