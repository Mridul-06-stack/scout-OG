<div align="center">

# 🔭 Scout — Self-Learning Web Workflow Engine

**Describe the task. Scout learns the web.**

*Flagship application: Autonomous Opportunity & Workflow Radar*

[![Built with webcmd](https://img.shields.io/badge/Built%20with-webcmd%20CloakBrowser-6366f1?style=for-the-badge)](https://github.com/agentrhq/webcmd)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20Turbopack-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%26%20SQLite-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI gpt-4o-mini](https://img.shields.io/badge/AI%20Engine-gpt--4o--mini-10a37f?style=for-the-badge&logo=openai)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

</div>

---

## ⭐ The Core Innovation

> **Scout doesn't just execute web workflows. It creates them.**

```
         USER
          │
          │  "Monitor X"
          ▼
    ┌───────────┐
    │   SCOUT   │
    └─────┬─────┘
          │
          ▼
    DISCOVER SOURCES
          │
          ▼
     EXPLORE ONCE
          │
          ▼
     LEARN WORKFLOW
          │
          ▼
    COMPILE WITH
       WEBCMD
          │
          ▼
   PERSIST CAPABILITY
          │
          ▼
    RUN / MONITOR
          │
          ▼
   LEARN FROM FAILURE
```

> **Scout transforms one-time browser exploration into a reusable capability.**

---

## The Problem

Browser agents are powerful at completing individual tasks, but recurring web workflows repeatedly pay the cost of discovery: finding the right sources, understanding page structure, navigating authentication, discovering hidden APIs, and reconstructing the same workflow on every run.

Traditional automation solves this by manually writing brittle integrations for every website.

**Scout attacks the missing layer between the user's intent and browser automation: automatic workflow creation.**

---

## The Insight

> **The valuable artifact isn't the answer produced by the agent. It's the workflow the agent learned while producing it.**

Scout captures that workflow, compiles it into a reusable command via webcmd, and re-executes it autonomously — without ever re-exploring the same website.

---

## Scout in 60 Seconds

1. User describes a recurring web task in natural language.
2. Scout converts the request into a structured workflow specification.
3. Scout discovers relevant sources automatically.
4. Webcmd explores unknown websites.
5. The learned workflow becomes a **reusable compiled command**.
6. Scout executes the cheapest reliable strategy on future runs.
7. Results are normalized into a common schema.
8. Temporal diffs detect meaningful changes (`NEW` → `UPDATED` → `CLOSING_SOON`).
9. Failed workflows trigger circuit breakers and can be re-learned.
10. Sensitive actions stop at a **non-bypassable human approval gate**.

> **The first run teaches Scout. Every later run benefits from what it learned.**

---

## Why Webcmd Is Essential

Without webcmd, Scout would be another browser agent. Webcmd is what allows Scout to turn exploration into reusable infrastructure.

```
    TRADITIONAL AGENT              SCOUT + WEBCMD

    Task                           Task
     ↓                              ↓
    Browser                        Explore
     ↓                              ↓
    Reason                         Learn
     ↓                              ↓
    Answer                         Compile
     ↓                              ↓
    ┌──────────────┐               Reusable Capability
    │ Repeat       │                ↓
    │ everything   │               Cheap Execution
    │ next time    │                ↓
    └──────────────┘               Monitor & Diff
                                    ↓
                                   Repair / Relearn
```

Traditional agents discard everything they learned during a task. Scout persists the learned workflow so future executions bypass exploration entirely.

**webcmd provides the compile step** — turning a browser exploration session into a deterministic, reusable command. Without that compilation, every run is a full re-exploration.

### First Run vs. Repeated Run

| Metric | First Execution | Repeated Execution |
|:---|:---|:---|
| Browser exploration | ✅ Full DOM exploration | ❌ Skipped |
| Agent reasoning | Full LLM planning + schema synthesis | Cached workflow lookup |
| Workflow discovery | ✅ New workflow created | ❌ Reused from registry |
| Execution strategy | Learned (UI / INTERCEPT / PUBLIC) | Compiled command |
| Reused workflow | No | ✅ Yes |

> **FIRST RUN: LEARN. SUBSEQUENT RUNS: EXECUTE.**

---

## What Is Novel About Scout?

### 1. Workflow Generation, Not Workflow Execution

Existing browser agents execute tasks. Scout generates the **reusable workflow** required to execute recurring tasks.

### 2. Domain-Independent Workflow Creation

Scout doesn't contain a separate hardcoded agent for hotels, jobs, cybersecurity, scholarships, or hackathons. The **same engine generates all of them** from natural language.

### 3. Exploration Becomes Infrastructure

The first browser execution isn't discarded. It produces:

```
site knowledge + workflow + schema + execution strategy + fallback
```

which becomes **persistent, reusable state** in the learned source registry.

### 4. Temporal Intelligence

Scout doesn't merely extract information. It understands state transitions:

- `NEW` — first discovery
- `UPDATED` — changed deadline, location, or price
- `CLOSING_SOON` — deadline ≤ 7 days
- `UNCHANGED` — duplicate content
- `REMOVED` — vanished from source

### 5. Human-Controlled Autonomy

Scout automates discovery and preparation while requiring **explicit human approval** for sensitive actions (`apply`, `submit`, `payment`, `message`, `delete`). The approval gate is a non-bypassable architectural node.

---

## What Happens When I Type One Sentence?

### Example 1: `"Find hackathons matching my profile."`

```
USER INTENT
     ↓
Intent extraction (Claude Haiku → PlanConfig)
     ↓
Source discovery (curated seeds + web search)
     ↓
Schema generation (opportunity_schema.json)
     ↓
Webcmd exploration (learn unstop.com, devfolio.co, ...)
     ↓
Workflow compilation (compiled command per source)
     ↓
Normalization (raw HTML → canonical Opportunity)
     ↓
Match scoring (tags 40% + deadline 15% + location 15% + ...)
     ↓
Temporal diffing (snapshot N vs N-1)
     ↓
Dashboard (live feed with match scores + change badges)
```

### Example 2: `"Monitor Manali hotel prices below ₹3,000."`

Same pipeline. Different vertical config. Zero new code.

### Example 3: `"Monitor Rust security vulnerabilities affecting my stack."`

Same pipeline. New radar synthesized on the fly. Zero new code.

> **Three domains. One engine. No domain-specific workflow code.**

---

## Architecture

### Simplified View

```
          NATURAL LANGUAGE
                │
                ▼
          ┌───────────┐
          │ SCOUT CORE│
          └─────┬─────┘
                │
   ┌────────────┼────────────┐
   ▼            ▼            ▼
DISCOVER     COMPILE      SCHEDULE
   │            │            │
   └────────────┼────────────┘
                ▼
             WEBCMD
                │
   ┌────────────┼────────────┐
   ▼            ▼            ▼
 PUBLIC     INTERCEPT        UI
                │
                ▼
       REUSABLE WORKFLOW
                │
                ▼
        DIFF / MONITOR
                │
                ▼
          DASHBOARD
```

### Full Pipeline

```
                    SCOUT CORE
                        │
           ┌────────────┴────────────┐
           │                         │
      Workflow Creation        Workflow Runtime
           │                         │
       Intent → Plan              Execute
       Source Discovery           Monitor
       Schema Synthesis           Diff
       Webcmd Learning            Recover
       Compilation                Approve
           │                         │
           └────────────┬────────────┘
                        │
                 APPLICATIONS
           ┌────────────┼────────────┐
           ↓            ↓            ↓
       Opportunities  Security    Travel
       (hackathons,   (CVEs,      (hotel
        internships,   advisories)  prices)
        grants)
```

### Module Specifications

| Module | Location | What It Does |
|:---|:---|:---|
| **Planner** | `core/planner/` | Natural language → `PlanConfig` via Claude Haiku with prompt caching (`cache_control: ephemeral`) and `max_tokens=1024` budget |
| **Source Discovery** | `core/discovery/` | Loads curated seeds from `verticals/<vertical>/seed_sources.json`, filters by planner categories |
| **webcmd Adapter** | `core/webcmd_adapter/` | Abstract base with `tenacity` exponential backoff (3 attempts, 1s→2s→4s), circuit breaker (3 failures → `needs_review`), mode toggle (`mock`/`real`) |
| **Normalizer** | `core/normalizer/` | Raw page extractions → canonical `Opportunity` schema with typed fields |
| **Matcher** | `core/matcher/` | Multi-factor scoring: tag overlap (40%) + deadline urgency (15%) + location (15%) + type alignment (15%) + constraints (15%) |
| **Change Detector** | `core/change_detector/` | Snapshot N vs N-1 → `NEW` / `UPDATED` / `CLOSING_SOON` / `UNCHANGED` / `REMOVED` |
| **Approval Gate** | `core/approval_gate/` | Non-bypassable halt for write actions. Configurable timeout (300s default, auto-reject on expiry) |
| **Workflow Builder** | `core/workflow_builder/` | Visual action graph compiler: natural language → 4–6 node executable webcmd action graph |
| **Scheduler** | `core/scheduler/` | APScheduler for recurring pipeline runs per vertical |

---

## Feature Map

```
SCOUT CORE
│
├── 🧠 Intent → Workflow Compiler
│      Natural language → structured 4–6 node workflow → executable webcmd action graph
│
├── 🔭 Dynamic Radar Engine
│      Zero-code radar generation for arbitrary domains from a single sentence
│
├── 🌐 Webcmd Learned Browser Runtime
│      Explore-once, compile, persist, re-execute — never re-explore the same site
│
├── 🧩 Composable Workflow Graph
│      Drag-and-drop action nodes: Navigate, Click, Scroll, Extract, AI Filter, Sub-Routines
│
├── 🕐 Temporal State Engine
│      Snapshot N vs Snapshot N-1 → NEW / UPDATED / CLOSING_SOON / UNCHANGED
│
├── 🛡️ Human Approval Layer
│      Hard-blocking consent gate for apply, submit, payment, message, delete
│
├── 🔐 Identity Vault
│      Encrypted profile: academic, professional, custom credentials → AI form reasoning
│
└── 📊 Execution Telemetry
       Per-step logs, screenshot proofs, failure tracking, circuit breaker state

APPLICATIONS
│
├── 💼 Opportunities (hackathons, internships, grants, scholarships)
├── 🏨 Travel (hotel price monitoring)
├── 🧑‍💻 Open Source (GitHub issues, good-first-issues)
├── 📈 Finance (stock radar, crypto airdrops)
├── 🏛️ Government (tenders, RFPs)
└── 🌎 Custom (any domain from natural language)
```

---

## We Deliberately Don't Build...

### Why Scout isn't another scraper
Scout does not rely on a fixed collection of website-specific scrapers. It learns how to extract from any website via webcmd exploration.

### Why Scout isn't another browser agent
Scout's goal isn't merely to complete a task. It **persists the learned workflow** so future executions can bypass exploration entirely.

### Why Scout isn't Zapier
Scout does not require every website to have a predefined integration. It creates the integration by exploring the site.

### Why Scout isn't an opportunity aggregator
Opportunities are one application of Scout's workflow-generation engine, not the core product. The same engine generates hotel monitors, security radars, and stock trackers.

---

## Capability Matrix

| Capability | Implemented | Demonstrated |
|:---|:---:|:---:|
| Natural-language workflow creation | ✅ | ✅ |
| Dynamic radar generation from one sentence | ✅ | ✅ |
| webcmd explore → compile → execute lifecycle | ✅ | ✅ |
| Workflow persistence & reuse (learned source registry) | ✅ | ✅ |
| Temporal state diffing (NEW / UPDATED / CLOSING_SOON) | ✅ | ✅ |
| Authenticated browser sessions (cookie injection) | ✅ | ✅ |
| Human approval gate (non-bypassable) | ✅ | ✅ |
| Composable workflow graph (sub-routines) | ✅ | ✅ |
| AI form reasoning (math, logic, identity vault) | ✅ | ✅ |
| Source & schema synthesis (LLM-generated) | ✅ | ✅ |
| Workflow execution telemetry & screenshots | ✅ | ✅ |
| Circuit breaker failure recovery | ✅ | ✅ |
| Multi-domain generalization (zero domain-specific code) | ✅ | ✅ |
| Automatic workflow repair / re-learning | 🟡 | 🟡 |

---

## What Is Actually Hard Here?

### Challenge 1 — Turning vague intent into executable structure
Natural language doesn't directly map to browser actions. Scout creates an intermediate workflow representation (`PlanConfig` → source list → exploration → compiled command) before execution.

### Challenge 2 — Unknown websites
The system cannot assume an API or DOM structure exists. Webcmd exploration discovers the workflow — the right selectors, scroll patterns, and extraction points — from scratch.

### Challenge 3 — Repeated execution
A workflow that works once isn't enough. Scout persists the learned workflow, execution strategy, and schema so subsequent runs are deterministic and cheap.

### Challenge 4 — Website changes
Temporal state changes and workflow failures must be distinguished from normal result changes. The change detector diffs snapshots while the circuit breaker handles structural site changes.

### Challenge 5 — Sensitive actions
Reading information and writing information have different risk profiles. Scout uses an architectural approval boundary before any sensitive operation — this gate cannot be bypassed programmatically.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Browser Execution** | `@agentrhq/webcmd` (Playwright / Chromium) | Stealth CloakBrowser: explore, compile, execute lifecycle |
| **Backend API** | FastAPI (Python 3.12) | Async REST backend, SSE execution streams, SQLite persistence |
| **Intelligence** | OpenAI `gpt-4o-mini` + Anthropic Claude Haiku | Workflow synthesis, semantic matching, form reasoning |
| **Frontend UI** | Next.js 16 (Turbopack, App Router) + React 19 | Dark-mode dashboard with glassmorphism, Kanban boards, action canvas |
| **Styling** | Tailwind CSS v4 + Lucide Icons | Double-border glassmorphism, radar sweep animations |
| **Persistence** | SQLite (async via aiosqlite + SQLAlchemy 2.0) | Opportunities, workflows, profiles, approval audit trail |
| **Reliability** | tenacity + circuit breaker | Exponential backoff retries (3 attempts, 1s→2s→4s), auto-skip after 3 failures |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/opportunities` | List normalized opportunities with vertical filtering |
| `GET` | `/api/opportunities/stats` | Aggregate metrics (total, matches, new, applying) |
| `POST` | `/api/pipeline/run` | Trigger live radar crawler for a specific vertical |
| `GET` | `/api/verticals` | List all active dynamic radars |
| `POST` | `/api/verticals` | Synthesize a new dynamic radar schema & sources from natural language |
| `GET` | `/api/approvals` | List pending and resolved human approval requests |
| `POST` | `/api/approvals/fill-form` | AI form solver: reads questions, reasons, fills DOM |
| `POST` | `/api/approvals/{id}/approve` | Approve and execute staged write action |
| `GET` | `/api/workflows` | List templates and saved user workflows |
| `POST` | `/api/workflows/synthesize` | Natural language → visual action graph |
| `POST` | `/api/workflows/run` | Execute multi-step action graph in CloakBrowser |
| `POST` | `/api/workflows/save` | Save workflow routine to SuperBrain Vault |
| `DELETE` | `/api/workflows/{id}` | Delete workflow routine |
| `GET` | `/api/workflows/history/*` | Execution logs and screenshot proofs |
| `GET/PUT` | `/api/profile` | Read / update identity vault |

---

## 🎬 3-Minute Demo Script

### 00:00–00:20 — The Problem
> *"Students and developers repeatedly perform the same workflows across fragmented websites. Existing agents rediscover those workflows every time."*

### 00:20–01:00 — Opportunity Scout
Type: `"Find AI/Web3 hackathons relevant to my profile."`
Show the generated radar. Match scores. Change badges. Kanban lifecycle.

### 01:00–01:30 — Webcmd Learning
Show first execution:
```
Exploring...    → Learning...    → Compiling...    → ✓ Workflow created
```

### 01:30–01:50 — Reuse
Run again. Show: first run used UI exploration, second run used compiled execution. No re-exploration.

### 01:50–02:20 — The Surprise
Type: `"Monitor Rust, Docker and PostgreSQL security advisories."`

No new code. New radar appears. Same engine, completely different domain.

### 02:20–02:40 — Another Domain
Type: `"Alert me when Manali hotels go below ₹3,000."`

Again, new workflow. Zero domain-specific code.

### 02:40–03:00 — Conclusion
> *"We don't build integrations for every website. Scout learns how to use them."*

---

## Security & Ethics

Scout is designed for **authorized workflows and user-controlled accounts**. Credentials and session material remain local and isolated. Sensitive write actions (`apply`, `submit`, `payment`, `message`, `delete`) are staged behind explicit human approval via a non-bypassable architectural gate. The system is not intended to bypass access controls or automate unauthorized activity.

All approval decisions are logged with timestamps, decision source (`human` / `timeout` / `demo_mode`), and full action metadata for auditability.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js 18+** & npm
- **Python 3.11+** & `uv` (recommended)
- **webcmd CLI**: `npm install -g @agentrhq/webcmd`

### Backend (`:8000`)
```bash
cd backend
uv venv .venv --python 3.12 && source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env   # Set OPENAI_API_KEY, optionally WEBCMD_MODE=real
uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload
```

### Dashboard (`:3000`)
```bash
cd dashboard
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

> `WEBCMD_MODE=mock` (default) runs without a real browser for development. Set `WEBCMD_MODE=real` for production CloakBrowser execution.

---

## Future Work

- More autonomous source discovery (web search → auto-learn)
- Cross-site workflow composition (chain workflows across domains)
- Automatic workflow repair on site structure changes
- Additional execution strategies (intercepted API, authenticated UI)
- Expanded verticals: security advisories, research papers, real estate

---

## 📜 License

MIT License — free for personal and commercial use.

---

<div align="center">

> *"We built a system that can teach itself new web workflows."*

</div>
