"""Profile routes — manage user preferences for scoring and the Identity Vault for form filling."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.models import UserProfile

router = APIRouter(tags=["profile"])

_PROFILE_STORAGE = Path(__file__).resolve().parent.parent.parent / "storage" / "user_profile.json"
_current_profile: UserProfile | None = None


def _get_profile() -> UserProfile:
    global _current_profile
    if _current_profile is None:
        if _PROFILE_STORAGE.exists():
            try:
                with open(_PROFILE_STORAGE) as f:
                    _current_profile = UserProfile(**json.load(f))
            except Exception:
                _current_profile = UserProfile()
        else:
            _current_profile = UserProfile()
    return _current_profile


def _save_profile(profile: UserProfile):
    _PROFILE_STORAGE.parent.mkdir(parents=True, exist_ok=True)
    with open(_PROFILE_STORAGE, "w") as f:
        json.dump(profile.model_dump(mode="json"), f, indent=2)


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    zip_code: str | None = None

    university: str | None = None
    degree: str | None = None
    major: str | None = None
    graduation_year: str | None = None
    gpa_cgpa: str | None = None

    headline: str | None = None
    bio: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    skills: list[str] | None = None
    projects_summary: str | None = None
    work_experience: str | None = None
    custom_vault: dict[str, str] | None = None

    vertical_interests: list[str] | None = None
    attributes: dict[str, Any] | None = None
    include_tags: list[str] | None = None
    exclude_tags: list[str] | None = None
    constraints: dict[str, Any] | None = None


ProfileUpdate.model_rebuild()


@router.get("/profile")
async def get_profile():
    """Get the current user profile & Identity Vault."""
    return _get_profile().model_dump(mode="json")


@router.put("/profile")
async def update_profile(body: ProfileUpdate):
    """Update user profile preferences & Identity Vault."""
    profile = _get_profile()
    
    update_data = body.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        if hasattr(profile, field_name) and value is not None:
            setattr(profile, field_name, value)
            
    _save_profile(profile)
    return {"message": "Profile & Identity Vault updated", "profile": profile.model_dump(mode="json")}
