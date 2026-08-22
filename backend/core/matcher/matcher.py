"""Matcher — scores and ranks opportunities against a user profile.

Hybrid approach:
1. Rule-based scoring (tag overlap, deadline proximity, location match)
2. Optional LLM-based semantic relevance boost (Claude Haiku, batched)
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta

from core.config import get_settings
from core.models import Opportunity, UserProfile

logger = logging.getLogger(__name__)


async def score(
    records: list[Opportunity],
    profile: UserProfile,
) -> list[Opportunity]:
    """Score each opportunity against the user profile and return sorted by match_score.

    Scoring components (each 0.0–1.0, then weighted):
    - Tag overlap:     0.40 weight
    - Deadline urgency: 0.15 weight
    - Location match:  0.15 weight
    - Type interest:   0.15 weight
    - LLM semantic:    0.15 weight (skipped if no API key)
    """
    if not records:
        return []

    for record in records:
        score_val = _rule_based_score(record, profile)
        record.match_score = round(min(max(score_val, 0.0), 1.0), 3)

    # Optional LLM boost — if API key is available
    settings = get_settings()
    if settings.openai_api_key or settings.anthropic_api_key:
        try:
            await _llm_boost(records, profile)
        except Exception as exc:
            logger.warning("LLM scoring failed, using rule-based only: %s", exc)

    # Sort descending by match score
    records.sort(key=lambda r: r.match_score, reverse=True)

    logger.info("Scored %d records, top score=%.3f", len(records), records[0].match_score if records else 0)
    return records


def _rule_based_score(opp: Opportunity, profile: UserProfile) -> float:
    """Pure rule-based scoring without LLM."""
    score = 0.0

    # ── Tag overlap (0.40) ──
    if profile.include_tags:
        opp_tags = set(t.lower() for t in opp.tags)
        include = set(t.lower() for t in profile.include_tags)
        exclude = set(t.lower() for t in profile.exclude_tags)

        # Penalize excluded tags heavily
        if opp_tags & exclude:
            return 0.05  # near-zero score for excluded items

        overlap = len(opp_tags & include)
        tag_score = min(overlap / max(len(include), 1), 1.0)
        score += tag_score * 0.40
    else:
        score += 0.20  # neutral baseline

    # ── Deadline urgency (0.15) — closer = higher ──
    if opp.deadline:
        days_left = (opp.deadline - datetime.utcnow()).days
        if days_left < 0:
            score += 0.0  # expired
        elif days_left <= 7:
            score += 0.15  # urgent
        elif days_left <= 30:
            score += 0.12
        elif days_left <= 90:
            score += 0.08
        else:
            score += 0.05
    else:
        score += 0.07  # no deadline = moderate

    # ── Location match (0.15) ──
    if opp.location and profile.attributes.get("location"):
        user_loc = profile.attributes["location"].lower()
        opp_loc = opp.location.lower()
        if user_loc in opp_loc or opp_loc in user_loc:
            score += 0.15
        elif "remote" in opp_loc or "online" in opp_loc:
            score += 0.12  # remote is always relevant
        else:
            score += 0.05
    else:
        score += 0.08

    # ── Type interest (0.15) ──
    if opp.type and profile.vertical_interests:
        score += 0.15 if opp.vertical in profile.vertical_interests else 0.05
    else:
        score += 0.10

    # ── Constraints check (0.15) ──
    constraints_met = True
    if profile.constraints:
        max_price = profile.constraints.get("max_price")
        if max_price and opp.raw_fields.get("price_per_night"):
            if opp.raw_fields["price_per_night"] > max_price:
                constraints_met = False

    score += 0.15 if constraints_met else 0.0

    return score


async def _llm_boost(records: list[Opportunity], profile: UserProfile) -> None:
    """Use OpenAI or Claude to add a semantic relevance boost, batched in groups of 10."""
    settings = get_settings()

    provider = settings.llm_provider
    if provider == "auto":
        if settings.openai_api_key:
            provider = "openai"
        elif settings.anthropic_api_key:
            provider = "anthropic"

    system_prompt = (
        "You are a relevance scorer. Given a user profile and a batch of opportunities, "
        "score each opportunity's semantic relevance to the user on a scale of 0.0 to 1.0. "
        "Return ONLY a JSON array of numbers in the same order as the input opportunities. "
        "Example: [0.8, 0.3, 0.95, 0.1]"
    )

    profile_summary = json.dumps({
        "interests": profile.vertical_interests,
        "tags": profile.include_tags,
        "attributes": profile.attributes,
    })

    batch_size = 10
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_data = [
            {"title": r.title, "type": r.type, "tags": r.tags, "location": r.location or ""}
            for r in batch
        ]

        try:
            scores = []
            if provider == "openai" and settings.openai_api_key:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.openai_api_key)
                response = await client.chat.completions.create(
                    model=settings.openai_model,
                    temperature=0.1,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Profile: {profile_summary}\n\nOpportunities: {json.dumps(batch_data)}"},
                    ],
                )
                raw = response.choices[0].message.content or "[]"
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                scores = json.loads(raw)

            elif provider == "anthropic" and settings.anthropic_api_key:
                from anthropic import AsyncAnthropic
                client = AsyncAnthropic(api_key=settings.anthropic_api_key)
                response = await client.messages.create(
                    model=settings.llm_model,
                    max_tokens=512,
                    system=[
                        {
                            "type": "text",
                            "text": system_prompt,
                            "cache_control": {"type": "ephemeral"},
                        }
                    ],
                    messages=[{
                        "role": "user",
                        "content": f"Profile: {profile_summary}\n\nOpportunities: {json.dumps(batch_data)}",
                    }],
                )
                raw = response.content[0].text.strip()
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                scores = json.loads(raw)

            if isinstance(scores, list):
                for j, llm_score in enumerate(scores):
                    if j < len(batch):
                        current = batch[j].match_score
                        # If heavily penalized by hard exclusion, do not boost
                        if current <= 0.05:
                            batch[j].match_score = current
                        else:
                            llm_val = max(0.0, min(float(llm_score), 1.0))
                            batch[j].match_score = round(current * 0.85 + llm_val * 0.15, 3)

        except Exception as exc:
            logger.warning("LLM batch scoring failed for batch %d: %s", i, exc)
