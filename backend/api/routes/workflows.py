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
    p = prompt.lower().strip()

    # Spotify / Music / Audio Players
    if "spotify" in p or (any(k in p for k in ("play", "song", "music", "track", "listen")) and not any(k in p for k in ("youtube", "video", "market", "stock"))):
        # Extract song or artist query by stripping intent stopwords
        clean_track = re.sub(r'\b(open|spotify|and|play|the|song|track|music|listen|to|please|oye|for|by|in)\b', ' ', p, flags=re.IGNORECASE)
        clean_track = re.sub(r'[^\w\s]', '', clean_track).strip()
        if clean_track:
            encoded_track = urllib.parse.quote_plus(clean_track)
            return f"https://open.spotify.com/search/{encoded_track}"
        return "https://open.spotify.com"

    # YouTube / Video
    if any(k in p for k in ("youtube", "video", "trailer", "channel", "stream")):
        clean_video = re.sub(r'\b(open|youtube|and|watch|the|video|play|search|for|find)\b', ' ', p, flags=re.IGNORECASE)
        clean_video = re.sub(r'[^\w\s]', '', clean_video).strip()
        if clean_video:
            encoded_vid = urllib.parse.quote_plus(clean_video)
            return f"https://www.youtube.com/results?search_query={encoded_vid}"
        return "https://www.youtube.com"

    # Wikipedia / Research
    if any(k in p for k in ("wikipedia", "wiki", "encyclopedia")):
        clean_wiki = re.sub(r'\b(search|wikipedia|wiki|for|look|up|on|about)\b', ' ', p, flags=re.IGNORECASE).strip()
        encoded_wiki = urllib.parse.quote_plus(clean_wiki)
        return f"https://en.wikipedia.org/wiki/Special:Search?search={encoded_wiki}"

    # Reddit / Community
    if "reddit" in p:
        clean_red = re.sub(r'\b(open|reddit|and|search|for|subreddit|on)\b', ' ', p, flags=re.IGNORECASE).strip()
        if clean_red:
            return f"https://www.reddit.com/search/?q={urllib.parse.quote_plus(clean_red)}"
        return "https://www.reddit.com"

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

    # Build available sub-routines library for SuperBrain prompt
    user_workflows = _load_user_workflows()
    all_known_routines = DEFAULT_TEMPLATES + user_workflows
    routines_summary = "\n".join([
        f"- [ID: {r.id}] \"{r.name}\" ({len(r.steps)} steps): {r.description}"
        for r in all_known_routines[:10]
    ])

    system_prompt = f"""You are Scout's Autonomous SuperBrain & Workflow Compiler. Convert the user's natural language request into a sequence of executable visual action blocks.

CRITICAL PIPELINE RULES:
1. ALWAYS generate a complete 4 to 5 step end-to-end workflow pipeline. NEVER generate only 1 or 2 steps.
2. NEVER output 'example.com', 'your-site.com', or generic placeholders for the 'navigate' URL.
3. Recommended target URL: {smart_seed_url}

🧠 SUPERBRAIN SUB-ROUTINE REUSE ENGINE:
If the user's request combines or involves tasks that can be fulfilled by an existing saved routine, you CAN include a 'subroutine' action block to delegate that part of the job!
Available Saved Routines in Library:
{routines_summary}

Example of Sub-Routine usage:
{{
  "type": "subroutine",
  "title": "Execute Bounty Hunter Routine",
  "description": "Delegates repository inspection and scraping to saved bounty hunter workflow",
  "params": {{"workflow_id": "template-bounty-hunter"}},
  "icon": "Cpu"
}}

ACTION SEQUENCING PATTERNS:
- Pattern A: MEDIA & PLAYBACK (Spotify, YouTube, Podcasts, Music)
  1. 'navigate': target URL (e.g. {smart_seed_url})
  2. 'scroll': params: {{"scroll_times": 1, "delay_ms": 1000}}
  3. 'click': title: "Play Top Result Track", params: {{"selector": "button[data-testid='play-button'], [data-testid='tracklist-row'] button, button[aria-label*='Play' i], a#video-title"}}
  4. 'screenshot': params: {{"label": "playback_proof"}}
  5. 'export': params: {{"notify": true}}

- Pattern B: SUPERBRAIN MULTI-ROUTINE COMPOSITION
  1. 'navigate': target starting URL
  2. 'subroutine': params: {{"workflow_id": "<matching_routine_id>"}}
  3. 'scroll' or 'click' or 'fill'
  4. 'screenshot': params: {{"label": "master_execution_proof"}}
  5. 'export': params: {{"notify": true}}

- Pattern C: CONTENT DISCOVERY & FILTERING (Blogs, News, Repos, Portals)
  1. 'navigate': target URL
  2. 'scroll': params: {{"scroll_times": 3, "delay_ms": 1200}}
  3. 'ai_filter': params: {{"criteria": prompt, "limit": 3}}
  4. 'screenshot': params: {{"label": "feed_snapshot"}}
  5. 'export': params: {{"notify": true}}

Supported action block types:
- "navigate": {{"url": "https://..."}}
- "scroll": {{"scroll_times": 2, "delay_ms": 1000, "target": ""}}
- "click": {{"selector": "css_selector_or_tag"}}
- "extract_text": {{"target": "readme" | "article" | "auto", "label": "Description"}}
- "ai_filter": {{"criteria": "What to extract/filter", "limit": 3}}
- "screenshot": {{"label": "descriptive_name"}}
- "fill": {{"fields": {{"selector": "value"}}}}
- "subroutine": {{"workflow_id": "workflow-id-or-name"}}
- "export": {{"notify": true}}

Output ONLY valid JSON matching this schema:
{{
  "name": "Catchy Workflow Name",
  "description": "Clear 1-sentence description of what this agent does",
  "category": "Content & Media" | "Automation & Forms" | "Finance & Trading" | "SuperBrain Multi-Routine" | "Custom Agent",
  "steps": [
    {{
      "id": "step-1",
      "type": "navigate" | "scroll" | "click" | "extract_text" | "ai_filter" | "screenshot" | "fill" | "subroutine" | "export",
      "title": "Short Step Title",
      "description": "What this step performs",
      "params": {{}},
      "icon": "Globe" | "ArrowDownCircle" | "MousePointer" | "FileText" | "Brain" | "Camera" | "Cpu" | "Save"
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
                category=data.get("category", "SuperBrain Multi-Routine" if any(s.get("type") == "subroutine" for s in data.get("steps", [])) else "Custom Agent"),
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


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a saved custom workflow definition."""
    user_workflows = _load_user_workflows()
    filtered = [w for w in user_workflows if w.id != workflow_id]
    _save_user_workflows(filtered)
    return {"message": "Workflow deleted", "workflow_id": workflow_id}


@router.get("/workflows/history/executions")
async def get_workflow_executions(workflow_id: str | None = None, limit: int = 20):
    """Load workflow execution history from SQLite database."""
    from storage.db import load_workflow_executions
    executions = load_workflow_executions(workflow_id=workflow_id, limit=limit)
    return {"total": len(executions), "items": executions}


@router.get("/workflows/history/screenshots")
async def get_workflow_screenshots(workflow_id: str | None = None, limit: int = 50):
    """Load captured workflow screenshots from SQLite database."""
    from storage.db import load_workflow_screenshots
    screenshots = load_workflow_screenshots(workflow_id=workflow_id, limit=limit)
    return {"total": len(screenshots), "items": screenshots}


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get a specific workflow definition by ID."""
    all_workflows = DEFAULT_TEMPLATES + _load_user_workflows()
    for w in all_workflows:
        if w.id == workflow_id:
            return {"status": "success", "workflow": w.model_dump(mode="json")}
    return {"status": "error", "message": "Workflow not found"}

