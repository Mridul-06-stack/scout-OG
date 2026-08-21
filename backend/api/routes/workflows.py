"""Workflow Studio API routes — compile natural language into visual node pipelines and execute them."""

from __future__ import annotations

import json
import logging
import uuid
import re
import urllib.parse
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.config import get_settings
from core.workflow_builder.workflow_engine import (
    WorkflowDefinition,
    WorkflowStep,
    WorkflowExecutionResult,
    execute_visual_workflow,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["workflows"])

_WORKFLOWS_STORAGE = Path(__file__).resolve().parent.parent.parent / "storage" / "workflows.json"
_WORKFLOWS_STORAGE.parent.mkdir(parents=True, exist_ok=True)


def resolve_authoritative_url(prompt: str) -> str:
    """Infer the best live, real-world authoritative URL based on user intent."""
    p = prompt.lower()

    # AI / Tech / Blogs
    if any(k in p for k in ("ai blog", "ai news", "artificial intelligence", "llm", "gpt", "agent")):
        return "https://techcrunch.com/category/artificial-intelligence/"
    if any(k in p for k in ("tech news", "hacker news", "y combinator", "programming blog", "developer post")):
        return "https://news.ycombinator.com"
    if any(k in p for k in ("medium", "blog post", "article", "newsletter", "substack")):
        return "https://medium.com/tag/artificial-intelligence"
    if any(k in p for k in ("dev.to", "coding blog", "tutorials")):
        return "https://dev.to"

    # Finance / Stocks / Crypto
    if any(k in p for k in ("stock", "market", "share", "ticker", "nasdaq", "nyse", "invest")):
        return "https://finance.yahoo.com/trending-tickers"
    if any(k in p for k in ("crypto", "airdrop", "bitcoin", "ethereum", "solana", "token")):
        return "https://coinmarketcap.com"

    # Products / Startups / Bounties
    if any(k in p for k in ("product", "startup", "launch", "producthunt", "saas")):
        return "https://www.producthunt.com"
    if any(k in p for k in ("github", "repo", "bounty", "good first issue", "open source")):
        return "https://github.com/trending"
    if any(k in p for k in ("grant", "funding", "web3 grant", "gitcoin")):
        return "https://gitcoin.co/grants"

    # Hackathons / College / Jobs
    if any(k in p for k in ("hackathon", "internship", "college", "competition", "contest")):
        return "https://unstop.com/hackathons"
    if any(k in p for k in ("devpost", "hack")):
        return "https://devpost.com/hackathons"
    if any(k in p for k in ("job", "hiring", "career")):
        return "https://news.ycombinator.com/jobs"

    # Research / Science
    if any(k in p for k in ("paper", "arxiv", "research", "science")):
        return "https://arxiv.org/list/cs.AI/recent"

    # Search Fallback: Formulate a DuckDuckGo web search
    clean_query = re.sub(r'[^\w\s]', '', prompt).strip()
    encoded = urllib.parse.quote_plus(clean_query[:50])
    return f"https://duckduckgo.com/?q={encoded}"


def sanitize_workflow_urls(workflow: WorkflowDefinition, prompt: str) -> WorkflowDefinition:
    """Ensure no step uses example.com or placeholder URLs."""
    fallback_url = resolve_authoritative_url(prompt)
    for step in workflow.steps:
        if step.type == "navigate":
            url = step.params.get("url", "")
            if not url or any(bad in url.lower() for bad in ("example.com", "your-site", "localhost", "mysite", "placeholder")):
                step.params["url"] = fallback_url
                step.description = f"Navigate to {fallback_url}"
    return workflow


# Default pre-built templates
DEFAULT_TEMPLATES = [
    WorkflowDefinition(
        id="template-blog-visual-hunter",
        name="Blog & News Visual Hunter",
        description="Scrolls dynamic blog/news feeds, uses AI to find top trending articles, and captures full-resolution screenshots.",
        category="Content & Media",
        steps=[
            WorkflowStep(
                type="navigate",
                title="1. Navigate to Target Feed",
                description="Load tech & AI blog page in CloakBrowser",
                params={"url": "https://news.ycombinator.com"},
                icon="Globe",
            ),
            WorkflowStep(
                type="scroll",
                title="2. Dynamic Smart Scroll",
                description="Scroll down to trigger lazy loading of latest articles",
                params={"scroll_times": 3, "delay_ms": 1200},
                icon="ArrowDownCircle",
            ),
            WorkflowStep(
                type="ai_filter",
                title="3. AI Quality & Topic Filter",
                description="Evaluate top 3 high-impact AI/startup articles using gpt-4o-mini",
                params={"criteria": "Find the top 3 most insightful posts about AI, startups, or system architecture", "limit": 3},
                icon="Brain",
            ),
            WorkflowStep(
                type="screenshot",
                title="4. Capture Visual Snapshots",
                description="Capture and archive high-resolution visual proofs",
                params={"label": "top_articles"},
                icon="Camera",
            ),
            WorkflowStep(
                type="export",
                title="5. Export to Gallery",
                description="Save structured article records & screenshots",
                params={"notify": True},
                icon="Save",
            ),
        ],
    ),
    WorkflowDefinition(
        id="template-form-auto-filler",
        name="Government & Hackathon Form Solver",
        description="Navigates to any application portal, extracts questions, solves math/logic/essays with AI, and fills blanks.",
        category="Automation & Forms",
        steps=[
            WorkflowStep(
                type="navigate",
                title="1. Open Application Portal",
                description="Navigate to Google Form or Hackathon registration",
                params={"url": "https://unstop.com/hackathons"},
                icon="Globe",
            ),
            WorkflowStep(
                type="ai_filter",
                title="2. Question Context Harvester",
                description="Scan all question blocks and match with User Identity Vault",
                params={"criteria": "Extract all question blanks, logic puzzles, and personal fields"},
                icon="Brain",
            ),
            WorkflowStep(
                type="screenshot",
                title="3. Capture Pre-Fill Verification",
                description="Take visual snapshot before submission approval",
                params={"label": "form_verification"},
                icon="Camera",
            ),
            WorkflowStep(
                type="export",
                title="4. Stage to Approval Gate",
                description="Hold at human safety gate for 1-click confirmation",
                params={"gate": True},
                icon="ShieldCheck",
            ),
        ],
    ),
    WorkflowDefinition(
        id="template-stock-chart-monitor",
        name="Financial Market & Chart Snapshotter",
        description="Visits financial markets, tracks breakout tickers, and captures chart snapshots.",
        category="Finance & Trading",
        steps=[
            WorkflowStep(
                type="navigate",
                title="1. Open Financial Feed",
                description="Visit Yahoo Finance Trending Tickers",
                params={"url": "https://finance.yahoo.com/trending-tickers"},
                icon="Globe",
            ),
            WorkflowStep(
                type="scroll",
                title="2. Scroll Market Depth",
                description="Load full table of active market movers",
                params={"scroll_times": 2, "delay_ms": 1000},
                icon="ArrowDownCircle",
            ),
            WorkflowStep(
                type="ai_filter",
                title="3. AI Momentum Screener",
                description="Filter top 3 highest momentum and volume tickers",
                params={"criteria": "Find highest volume tech and crypto tickers with positive price movement", "limit": 3},
                icon="Brain",
            ),
            WorkflowStep(
                type="screenshot",
                title="4. Capture Market Snapshot",
                description="Save chart proof to visual gallery",
                params={"label": "market_movers"},
                icon="Camera",
            ),
        ],
    ),
]


def _load_user_workflows() -> list[WorkflowDefinition]:
    if not _WORKFLOWS_STORAGE.exists():
        return []
    try:
        with open(_WORKFLOWS_STORAGE) as f:
            raw = json.load(f)
            return [WorkflowDefinition(**w) for w in raw]
    except Exception:
        return []


def _save_user_workflows(workflows: list[WorkflowDefinition]):
    with open(_WORKFLOWS_STORAGE, "w") as f:
        json.dump([w.model_dump(mode="json") for w in workflows], f, indent=2)


class SynthesizeRequest(BaseModel):
    prompt: str = Field(..., description="Natural language workflow description")


class RunWorkflowRequest(BaseModel):
    workflow: WorkflowDefinition


SynthesizeRequest.model_rebuild()
RunWorkflowRequest.model_rebuild()


@router.get("/workflows")
async def list_workflows():
    """List all available workflow templates and user-saved custom workflows."""
    user_workflows = _load_user_workflows()
    all_workflows = DEFAULT_TEMPLATES + user_workflows
    return {
        "total": len(all_workflows),
        "templates_count": len(DEFAULT_TEMPLATES),
        "custom_count": len(user_workflows),
        "workflows": [w.model_dump(mode="json") for w in all_workflows],
    }


@router.post("/workflows/synthesize")
async def synthesize_workflow(req: SynthesizeRequest):
    """Use gpt-4o-mini to convert a plain-English user prompt into visual workflow action blocks.
    
    Autonomously resolves real-world URLs and never outputs example.com or placeholder domains.
    """
    settings = get_settings()
    prompt = req.prompt.strip()
    smart_seed_url = resolve_authoritative_url(prompt)

    system_prompt = f"""You are Scout's Autonomous Workflow Compiler. Convert the user's natural language request into a sequence of executable visual action blocks.

CRITICAL RULES:
1. NEVER output 'example.com', 'your-site.com', or generic placeholders for the 'navigate' URL.
2. If the user does NOT explicitly specify a URL in their prompt, you MUST autonomously choose the best REAL-WORLD, LIVE, HIGH-TRAFFIC URL matching their topic (e.g. https://news.ycombinator.com, https://techcrunch.com/category/artificial-intelligence/, https://finance.yahoo.com/trending-tickers, https://unstop.com/hackathons, https://github.com/trending, https://www.producthunt.com).
3. Recommended default target URL for this request: {smart_seed_url}

Supported action block types:
- "navigate": {{"url": "https://..."}}
- "scroll": {{"scroll_times": 3, "delay_ms": 1000}}
- "ai_filter": {{"criteria": "What to extract/filter", "limit": 3}}
- "screenshot": {{"label": "descriptive_name"}}
- "click": {{"selector": "css_selector"}}
- "fill": {{"fields": {{"selector": "value"}}}}
- "export": {{"notify": true}}

Output ONLY valid JSON matching this schema:
{{
  "name": "Catchy Workflow Name",
  "description": "Clear 1-sentence description of what this agent does",
  "category": "Content & Media" | "Automation & Forms" | "Finance & Trading" | "Custom Agent",
  "steps": [
    {{
      "id": "step-1",
      "type": "navigate" | "scroll" | "ai_filter" | "screenshot" | "click" | "fill" | "export",
      "title": "Short Step Title",
      "description": "What this step performs",
      "params": {{}},
      "icon": "Globe" | "ArrowDownCircle" | "Brain" | "Camera" | "MousePointer" | "Save"
    }}
  ]
}}"""

    if settings.openai_api_key:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=12.0)
            res = await client.chat.completions.create(
                model=settings.openai_model,
                temperature=0.2,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"User Request: {prompt}\nTarget Seed Suggestion: {smart_seed_url}"},
                ],
            )
            raw = res.choices[0].message.content or "{}"
            data = json.loads(raw)
            workflow = WorkflowDefinition(
                id=f"wf-{uuid.uuid4().hex[:8]}",
                name=data.get("name", "Custom Autonomous Workflow"),
                description=data.get("description", prompt),
                category=data.get("category", "Custom Agent"),
                steps=[WorkflowStep(**s) for s in data.get("steps", [])],
            )
            workflow = sanitize_workflow_urls(workflow, prompt)
            return {"status": "success", "workflow": workflow.model_dump(mode="json")}
        except Exception as exc:
            logger.warning("AI synthesis failed: %s — using fast local fallback compiler", exc)

    # Fast Local Fallback Compiler with Smart Seed Resolution
    steps = [
        WorkflowStep(
            type="navigate",
            title="1. Open Target Website",
            description=f"Navigate to {smart_seed_url} in stealth browser",
            params={"url": smart_seed_url},
            icon="Globe",
        ),
        WorkflowStep(
            type="scroll",
            title="2. Smart Scroll Feed",
            description="Scroll down to reveal cards and dynamic elements",
            params={"scroll_times": 3, "delay_ms": 1000},
            icon="ArrowDownCircle",
        ),
        WorkflowStep(
            type="ai_filter",
            title="3. AI Content Filter",
            description=f"Filter top items matching: {prompt}",
            params={"criteria": prompt, "limit": 3},
            icon="Brain",
        ),
        WorkflowStep(
            type="screenshot",
            title="4. Capture Visual Proofs",
            description="Save visual artifact to gallery",
            params={"label": "workflow_snapshot"},
            icon="Camera",
        ),
        WorkflowStep(
            type="export",
            title="5. Export Artifacts",
            description="Save structured items and image gallery",
            params={"notify": True},
            icon="Save",
        ),
    ]

    workflow = WorkflowDefinition(
        id=f"wf-{uuid.uuid4().hex[:8]}",
        name=f"Workflow: {prompt[:35]}...",
        description=prompt,
        category="Custom Agent",
        steps=steps,
    )
    return {"status": "success", "workflow": workflow.model_dump(mode="json")}


@router.post("/workflows/run")
async def run_workflow(req: RunWorkflowRequest):
    """Execute a visual workflow definition and return live step results and screenshots."""
    result = await execute_visual_workflow(req.workflow)
    return result.model_dump(mode="json")


@router.post("/workflows/save")
async def save_workflow(workflow: WorkflowDefinition):
    """Save a user-created custom workflow definition."""
    user_workflows = _load_user_workflows()
    existing_idx = next((i for i, w in enumerate(user_workflows) if w.id == workflow.id), None)
    if existing_idx is not None:
        user_workflows[existing_idx] = workflow
    else:
        user_workflows.insert(0, workflow)
    _save_user_workflows(user_workflows)
    return {"message": "Workflow saved", "workflow": workflow.model_dump(mode="json")}
