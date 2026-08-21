"""Verticals API Route — Dynamic vertical management & AI generation."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["verticals"])

_VERTICALS_DIR = Path(__file__).resolve().parent.parent.parent / "verticals"
_SCHEMAS_DIR = Path(__file__).resolve().parent.parent.parent / "core" / "normalizer" / "schemas"


class CreateVerticalRequest(BaseModel):
    name: str = Field(..., description="Name of the vertical, e.g. Share Market Analysis")
    description: str = Field(..., description="What this workflow monitors and evaluates")
    seed_urls: list[str] = Field(default_factory=list, description="Optional target URLs or platforms")
    categories: list[str] = Field(default_factory=list, description="Optional search categories")


@router.get("/verticals")
async def list_verticals():
    """List all available verticals (built-in and dynamically created)."""
    verticals = []
    if not _VERTICALS_DIR.exists():
        return {"items": []}

    for path in _VERTICALS_DIR.iterdir():
        if path.is_dir() and not path.name.startswith((".", "_")):
            config_file = path / "vertical_config.json"
            if config_file.exists():
                try:
                    with open(config_file) as f:
                        cfg = json.load(f)
                    verticals.append({
                        "id": path.name,
                        "name": cfg.get("name", path.name.replace("_", " ").title()),
                        "description": cfg.get("description", ""),
                        "icon": cfg.get("icon", "Layers"),
                        "schema_ref": cfg.get("schema_ref", ""),
                        "categories": cfg.get("categories", []),
                    })
                except Exception as exc:
                    logger.warning("Could not read config for vertical %s: %s", path.name, exc)

    return {"items": verticals}


@router.post("/verticals")
async def create_vertical(req: CreateVerticalRequest):
    """Dynamically generate and register a new radar vertical using OpenAI gpt-4o-mini."""
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=400,
            detail="OPENAI_API_KEY is required to dynamically generate custom vertical schemas."
        )

    # Prompt OpenAI to generate vertical configuration, schema, and seed sources
    system_prompt = """You are Scout's Meta-Architect. Given a user's request for a new monitoring radar vertical, you design a complete autonomous workflow configuration.

Output ONLY a JSON object with this exact structure:
{
  "slug": "snake_case_vertical_id",
  "name": "Human Readable Title",
  "description": "Short 1-sentence description",
  "icon": "TrendingUp",
  "categories": ["category1", "category2", "category3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "NormalizedRecord",
    "type": "object",
    "required": ["title"],
    "properties": {
      "title": { "type": "string" },
      "type": { "type": "string" },
      "url": { "type": "string" },
      "description": { "type": "string" },
      "tags": { "type": "array", "items": { "type": "string" } },
      "custom_field_1": { "type": "string" },
      "custom_field_2": { "type": "string" }
    }
  },
  "field_mappings": {
    "title": ["title", "name", "headline", "ticker", "symbol"],
    "description": ["description", "summary", "details", "analysis"],
    "url": ["url", "link", "source_url"]
  },
  "seed_sources": [
    {
      "url": "https://example.com/listings",
      "name": "Example Source",
      "categories": ["category1"],
      "strategy": "explore"
    }
  ],
  "profile_template": {
    "vertical_interests": ["slug"],
    "include_tags": ["keyword1", "keyword2"],
    "exclude_tags": ["spam", "unverified"],
    "attributes": {
      "preference": "high_growth"
    },
    "constraints": {}
  }
}"""

    user_prompt = f"""Create a radar vertical for:
Name: {req.name}
Description: {req.description}
Suggested Seed URLs: {req.seed_urls}
Suggested Categories: {req.categories}"""

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)

        slug = re.sub(r"[^a-z0-9_]", "", data.get("slug", req.name.lower().replace(" ", "_")))
        if not slug:
            slug = f"vertical_{len(list(_VERTICALS_DIR.iterdir())) + 1}"

        vertical_dir = _VERTICALS_DIR / slug
        vertical_dir.mkdir(parents=True, exist_ok=True)
        _SCHEMAS_DIR.mkdir(parents=True, exist_ok=True)

        schema_filename = f"{slug}_schema.json"
        schema_path = _SCHEMAS_DIR / schema_filename

        # Write schema
        with open(schema_path, "w") as f:
            json.dump(data.get("schema", {}), f, indent=2)

        # Write vertical_config.json
        config_data = {
            "name": data.get("name", req.name),
            "description": data.get("description", req.description),
            "icon": data.get("icon", "TrendingUp"),
            "schema_ref": schema_filename,
            "categories": data.get("categories", []),
            "keywords": data.get("keywords", []),
            "field_mappings": data.get("field_mappings", {}),
        }
        with open(vertical_dir / "vertical_config.json", "w") as f:
            json.dump(config_data, f, indent=2)

        # Write seed_sources.json (incorporating user's seed_urls if provided)
        seed_sources = data.get("seed_sources", [])
        if req.seed_urls:
            for url in req.seed_urls:
                if url and not any(s.get("url") == url for s in seed_sources):
                    seed_sources.insert(0, {
                        "url": url,
                        "name": url.split("//")[-1].split("/")[0],
                        "categories": data.get("categories", [])[:1],
                        "strategy": "explore",
                    })

        with open(vertical_dir / "seed_sources.json", "w") as f:
            json.dump(seed_sources, f, indent=2)

        # Write profile_template.json
        profile_data = data.get("profile_template", {
            "vertical_interests": [slug],
            "include_tags": data.get("keywords", []),
            "exclude_tags": [],
            "attributes": {},
            "constraints": {},
        })
        with open(vertical_dir / "profile_template.json", "w") as f:
            json.dump(profile_data, f, indent=2)

        logger.info("Successfully created and registered dynamic vertical: %s at %s", slug, vertical_dir)

        return {
            "status": "success",
            "slug": slug,
            "name": config_data["name"],
            "description": config_data["description"],
            "icon": config_data["icon"],
            "categories": config_data["categories"],
            "seed_sources_count": len(seed_sources),
        }

    except Exception as exc:
        logger.exception("Failed to dynamically generate vertical: %s", exc)
        raise HTTPException(status_code=500, detail=f"Failed to generate vertical: {exc}")
