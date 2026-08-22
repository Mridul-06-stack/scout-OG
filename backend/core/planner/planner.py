"""Planner — turns natural-language intent into a structured PlanConfig.

Uses Claude Haiku with prompt caching and max_tokens cap.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from anthropic import AsyncAnthropic

from core.config import get_settings
from core.models import PlanConfig

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (Path(__file__).parent / "prompts" / "planner_system_prompt.md").read_text()

# ── Default plans (fallback when LLM is unavailable) ───────────────────

_DEFAULTS: dict[str, PlanConfig] = {
    "student_opportunities": PlanConfig(
        vertical="student_opportunities",
        categories=["hackathon", "internship", "open_source", "scholarship", "fellowship", "grant"],
        keywords=["tech", "coding", "AI", "open source", "remote"],
        search_queries=["tech hackathons 2025", "CS internships remote", "open source programs students"],
        schema_ref="opportunity_schema.json",
    ),
    "hotel_price_monitor": PlanConfig(
        vertical="hotel_price_monitor",
        categories=["hotel", "resort", "hostel"],
        keywords=["budget", "deal", "discount", "manali"],
        search_queries=["cheap hotels Manali", "budget stays Himachal"],
        schema_ref="hotel_schema.json",
    ),
    "github_issues_grants": PlanConfig(
        vertical="github_issues_grants",
        categories=["good_first_issue", "grant", "bounty", "rfp", "open_source"],
        keywords=["rust", "python", "react", "grant", "bounty", "good first issue"],
        search_queries=["good first issues rust github", "developer grants web3"],
        schema_ref="issue_grant_schema.json",
    ),
}


async def plan(intent: str, vertical: str | None = None) -> PlanConfig:
    """Parse a user intent string into a structured PlanConfig.

    Supports OpenAI and Anthropic Claude, falling back to sensible defaults.
    """
    settings = get_settings()

    # If intent is empty, return vertical default directly
    if not intent.strip() and vertical in _DEFAULTS:
        return _DEFAULTS[vertical]

    # Determine provider
    provider = settings.llm_provider
    if provider == "auto":
        if settings.openai_api_key:
            provider = "openai"
        elif settings.anthropic_api_key:
            provider = "anthropic"

    prompt_user_content = f"Target vertical: {vertical}\nUser intent: {intent}" if vertical else intent

    if provider == "openai" and settings.openai_api_key:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            response = await client.chat.completions.create(
                model=settings.openai_model,
                temperature=0.2,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_user_content},
                ],
            )
            raw = response.choices[0].message.content or "{}"
            data = json.loads(raw)
            if vertical and data.get("vertical") != vertical:
                data["vertical"] = vertical
            logger.info("Planner successfully generated plan using OpenAI (%s)", settings.openai_model)
            return PlanConfig(**data)
        except Exception as exc:
            logger.error("OpenAI planner failed: %s — using fallback", exc)
            return _guess_default(intent, vertical)

    elif provider == "anthropic" and settings.anthropic_api_key:
        try:
            client = AsyncAnthropic(api_key=settings.anthropic_api_key)
            response = await client.messages.create(
                model=settings.llm_model,
                max_tokens=1024,
                system=[
                    {
                        "type": "text",
                        "text": _SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": prompt_user_content}],
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            data = json.loads(raw)
            if vertical and data.get("vertical") != vertical:
                data["vertical"] = vertical
            logger.info("Planner successfully generated plan using Claude (%s)", settings.llm_model)
            return PlanConfig(**data)
        except Exception as exc:
            logger.error("Anthropic planner failed: %s — using fallback", exc)
            return _guess_default(intent, vertical)

    logger.warning("No OPENAI_API_KEY or ANTHROPIC_API_KEY set — using default plan for intent: %s", intent)
    return _guess_default(intent, vertical)


def _guess_default(intent: str, vertical: str | None = None) -> PlanConfig:
    """Simple keyword heuristic to pick a default plan."""
    if vertical and vertical in _DEFAULTS:
        return _DEFAULTS[vertical]
    lower = intent.lower()
    if any(kw in lower for kw in ("github", "issue", "bounty", "repo", "rust", "grant")):
        return _DEFAULTS["github_issues_grants"]
    if any(kw in lower for kw in ("hotel", "stay", "room", "price", "booking", "accommodation")):
        return _DEFAULTS["hotel_price_monitor"]
    return _DEFAULTS["student_opportunities"]
