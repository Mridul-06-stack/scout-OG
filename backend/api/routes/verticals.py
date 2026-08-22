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

    for path in sorted(_VERTICALS_DIR.iterdir()):
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


def _fallback_generate_vertical(req: CreateVerticalRequest) -> dict[str, Any]:
    """Fast deterministic generator when LLM API times out or is slow."""
    slug = re.sub(r"[^a-z0-9_]", "", req.name.lower().replace(" ", "_").replace("&", "and"))
    if not slug:
        slug = f"custom_vertical_{len(list(_VERTICALS_DIR.iterdir())) + 1}"

    cats = req.categories if req.categories else [slug, "general", "updates"]
    keywords = [w.lower() for w in req.name.split() if len(w) > 2] + [c.lower() for c in cats]

    # Clean seed sources
    seed_sources = []
    for u in req.seed_urls:
        if u.strip():
            seed_sources.append({
                "url": u.strip(),
                "name": u.split("//")[-1].split("/")[0],
                "categories": cats[:2],
                "strategy": "explore",
            })

    if not seed_sources:
        seed_sources = [
            {
                "url": f"https://news.google.com/search?q={req.name.replace(' ', '+')}",
                "name": "Google News",
                "categories": cats[:1],
                "strategy": "explore",
            }
        ]

    return {
        "slug": slug,
        "name": req.name,
        "description": req.description,
        "icon": "TrendingUp",
        "categories": cats,
        "keywords": keywords,
        "schema": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "NormalizedRecord",
            "type": "object",
            "required": ["title"],
            "properties": {
                "title": {"type": "string"},
                "type": {"type": "string"},
                "url": {"type": "string"},
                "description": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
                "metric": {"type": "string"},
                "value": {"type": "string"},
            },
        },
        "field_mappings": {
            "title": ["title", "name", "headline", "item_name", "ticker"],
            "description": ["description", "summary", "details", "info"],
            "url": ["url", "link", "source_url"],
        },
        "seed_sources": seed_sources,
        "profile_template": {
            "vertical_interests": [slug],
            "include_tags": keywords[:5],
            "exclude_tags": ["spam", "unverified"],
            "attributes": {},
            "constraints": {},
        },
    }


@router.post("/verticals")
async def create_vertical(req: CreateVerticalRequest):
    """Dynamically generate and register a new radar vertical using OpenAI gpt-4o-mini with fast fallback."""
    settings = get_settings()
    data: dict[str, Any] | None = None

    if settings.openai_api_key:
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
      "tags": { "type": "array", "items": { "type": "string" } }
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
    "attributes": {},
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
            client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=12.0)
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
            logger.info("Successfully generated vertical with OpenAI")
        except Exception as exc:
            logger.warning("OpenAI vertical generation timed out or failed (%s) — using fast compiler fallback", exc)
            data = None

    if not data:
        data = _fallback_generate_vertical(req)

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
        "categories": data.get("categories", req.categories or [slug]),
        "keywords": data.get("keywords", []),
        "field_mappings": data.get("field_mappings", {}),
    }
    with open(vertical_dir / "vertical_config.json", "w") as f:
        json.dump(config_data, f, indent=2)

    # Write seed_sources.json (incorporating user's seed_urls)
    seed_sources = data.get("seed_sources", [])
    if req.seed_urls:
        for url in req.seed_urls:
            if url and not any(s.get("url") == url for s in seed_sources):
                seed_sources.insert(0, {
                    "url": url,
                    "name": url.split("//")[-1].split("/")[0],
                    "categories": config_data["categories"][:1],
                    "strategy": "explore",
                })

    with open(vertical_dir / "seed_sources.json", "w") as f:
        json.dump(seed_sources, f, indent=2)

    # Write profile_template.json
    profile_data = data.get("profile_template", {
        "vertical_interests": [slug],
        "include_tags": config_data["keywords"],
        "exclude_tags": [],
        "attributes": {},
        "constraints": {},
    })
    with open(vertical_dir / "profile_template.json", "w") as f:
        json.dump(profile_data, f, indent=2)

    logger.info("Successfully registered dynamic vertical: %s at %s", slug, vertical_dir)

    return {
        "status": "success",
        "slug": slug,
        "name": config_data["name"],
        "description": config_data["description"],
        "icon": config_data["icon"],
        "categories": config_data["categories"],
        "seed_sources_count": len(seed_sources),
    }
