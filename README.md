<div align="center">

# 🔭 Scout — Self-Learning Autonomous Opportunity & Workflow Radar

**Turn recurring web discovery, form filling, repository analysis, and complex browser automation into intelligent, self-learning agents.**

[![Built with webcmd](https://img.shields.io/badge/Built%20with-webcmd%20CloakBrowser-6366f1?style=for-the-badge)](https://github.com/agentrhq/webcmd)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20Turbopack-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%26%20SQLite-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI gpt-4o-mini](https://img.shields.io/badge/AI%20Engine-gpt--4o--mini-10a37f?style=for-the-badge&logo=openai)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Executive Overview

Scout is an **autonomous, self-learning web intelligence radar & browser action engine**. Powered by `@agentrhq/webcmd`, Scout breaks free from static web scraping and rigid RPA bots.

Instead of manual search or brittle scripts, Scout **learns web workflows once, caches deterministic compiled action paths, tracks real-time temporal state diffs, answers dynamic form questions with multi-step AI reasoning, interacts with authenticated web portals (e.g. GitHub, Google, Spotify), and executes browser actions with anti-bot stealth.**

```
                                      ┌─────────────────────────────────────────┐
                                      │        User Intent / SuperBrain Studio  │
                                      └────────────────────┬────────────────────┘
                                                           │
                                                           ▼
                                      ┌─────────────────────────────────────────┐
                                      │   Autonomous Source & Issue Discovery   │
                                      └────────────────────┬────────────────────┘
                                                           │
                                                           ▼
                                      ┌─────────────────────────────────────────┐
                                      │   webcmd CloakBrowser Action Compiler   │
                                      │   (Explore-Once, Stealth-Run-Forever)   │
                                      └────────────────────┬────────────────────┘
                                                           │
                                                           ▼
                                      ┌─────────────────────────────────────────┐
                                      │    Temporal State Diff & Normalizer     │
                                      └────────────────────┬────────────────────┘
                                                           │
                                                           ▼
                                      ┌─────────────────────────────────────────┐
                                      │   Multi-Factor Semantic Profile Matcher │
                                      └────────────────────┬────────────────────┘
                                                           │
                                      ┌────────────────────┴────────────────────┐
                                      │                                         │
                                      ▼                                         ▼
                       ┌──────────────────────────────┐        ┌────────────────────────────────┐
                       │  Live Opportunity Feed &     │        │    Safety Approval Gate &      │
                       │  Kanban Lifecycle Dashboard  │        │    Intelligent AI Form Agent   │
                       └──────────────────────────────┘        └────────────────────────────────┘
```

---

## 🚀 Core Moats & Key Capabilities

### 1. 🧠 SuperBrain Visual Studio & Multi-Routine Composer (`/workflows`)
- **Natural Language Workflow Compiler**: Type plain English (*"Star https://github.com/astral-sh/uv for me and fetch its README with a deep tech stack summary"*) ➔ Instantly compiles an executable 4–6 node action graph in <500ms.
- **SuperBrain Sub-Routine Orchestration**: Save standalone workflows as modular sub-routines and compose them into parent meta-agent pipelines with full context delegation.
- **Drag-and-Drop Action Canvas**: Reorder, add, duplicate, configure, and inspect live parameters on glowing action nodes:
  - 🌐 **Navigate URL**: Stealth navigation with automated session cookie injection.
  - 🖱️ **Click & Actuate**: Smart button actuation, GitHub repo starring, dropdown interaction.
  - 📜 **Smart Scroll**: Content-aware scrolling that dynamically triggers lazy-loaded containers and READMEs.
  - 📄 **Extract Text & Documentation**: Scrapes raw markdown and runs AI code intelligence.
  - 🧠 **AI Content Filter**: Evaluates and ranks articles, grants, or posts by criteria.
  - 📸 **Capture Screenshot**: Full-resolution visual proof snapshots archived to SQLite.
  - ⚡ **SuperBrain Sub-Routine**: Executes nested child pipelines.
  - 💾 **Export Artifacts**: Saves structured items, text records, and image galleries.
- **SuperBrain Vault**: Organize, search, filter, duplicate, and execute saved routines from your personal automation library.

---

### 2. ⭐ Authenticated GitHub Automation & Repo Intelligence
- **Stealth Session Injection**: Authenticates seamlessly using encrypted cookies (`user_session`, `__Host-user_session_same_site`, `logged_in`, `dotcom_user`) stored in your Identity Vault.
- **Universal Star / Unstar Actuator**: Intelligently locates star buttons on single repo pages (`button[data-testid="star-button"]`, `[aria-label*="Star"]`) and trending/search feeds (`article.Box-row`). Verifies existing state, clicks, and logs exact telemetry (*"⭐ Starred astral-sh/uv (State: Starred)"*).
- **AI-Powered README Tech Intelligence**: Extracts complete live READMEs and generates structured, developer-grade deep dives:
  - 📌 **Executive Overview & Core Mission**
  - ⚡ **Core Tech Stack, Dependencies & Architecture**
  - 🚀 **Key Features & API Capabilities**
  - 🛠️ **Quickstart / Installation Guide**
  - 💡 **Practical Takeaways & Architectural Highlights**
  - *Includes 1-click clipboard export for immediate sharing.*

---

### 3. 🛡️ Intelligent AI Form Agent & Personal Identity Vault (`/approvals` & `/profile`)
- **Context-Aware Form Intelligence**: Reads and parses every question on Google Forms, university application portals, and hackathon registrations.
- **Math & Logic Reasoning**: Computes arithmetic traps on the fly (*"What is 12 multiplied by 4?"* ➔ `48`).
- **Encrypted Identity Vault**: Securely maps verified academic data, work experience, social profiles, and custom credentials (*Student ID, Passport, LinkedIn, GitHub*) to form blanks.
- **Tailored Short-Answer Synthesis**: Uses `gpt-4o-mini` to draft personalized answers tailored to your resume and projects.
- **Anti-Bot CloakBrowser Stealth**: Simulates authentic human keystroke lifecycle events (`focus` ➔ `input` ➔ `change` ➔ `blur`) with randomized delays.
- **Zero Unapproved Writes**: Automated actions that apply, submit, or message are held at the Safety Gate for 1-click review.

---

### 4. 🔭 Dynamic Radar Studio (`/` & `/radar`)
- **Zero-Code Radar Generation**: Spin up radars for ANY domain in seconds (e.g. *Student Hackathons, Stock Market Tickers, Crypto Airdrops, Real Estate Deals, Government RFPs*).
- **On-the-Fly Schema Synthesis**: LLM dynamically generates the extraction schema, seed sources, and field normalizers.

---

### 5. ⚡ Explore-Once `webcmd` Compilation & Temporal Diffing
- **Learn Once, Run Fast**: Compiles DOM pathways into reusable commands.
- **Temporal State Diffing**: Distinguishes `NEW`, `UPDATED`, `CLOSING_SOON`, and `UNCHANGED` records with instant alerting and Kanban lifecycle tracking.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Browser Execution** | `@agentrhq/webcmd` (Playwright / Chromium) | Stealth CloakBrowser session automation & command compilation |
| **Backend API** | FastAPI (Python 3.12) | Asynchronous REST backend, SSE execution streams, SQLite DB |
| **Intelligence** | OpenAI `gpt-4o-mini` (AsyncOpenAI) | Natural language workflow synthesis, semantic matching, and form reasoning |
| **Frontend UI** | Next.js 16 (Turbopack, App Router) | Obsidian Cosmic Dark Mode, Bento cards, interactive node canvas |
| **Styling & Motion** | Vanilla CSS + Tailwind CSS + Lucide Icons | Double-border glassmorphism, radar sweeps, micro-animations |
| **Persistence** | SQLite Async + JSON Storage | Persistent local caching of opportunities, workflows, and vault |

---

## 🛠️ Quickstart Guide

### 1. Prerequisites
- **Node.js 18+** & npm
- **Python 3.11+** & `uv` (recommended)
- **webcmd CLI**: `npm install -g @agentrhq/webcmd`

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
uv venv .venv --python 3.12
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"
uv pip install pillow

# Configure Environment Variables
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY (and optional WEBCMD_MODE=real)

# Start FastAPI Backend Server
uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Frontend Dashboard Setup

```bash
cd dashboard

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/opportunities` | List normalized opportunities with vertical filtering |
| `GET` | `/api/opportunities/stats` | Aggregate metric counts (total, matches, new, applying) |
| `POST` | `/api/pipeline/run` | Trigger live radar crawler for a specific vertical |
| `GET` | `/api/verticals` | List all active dynamic radars |
| `POST` | `/api/verticals` | Synthesize a new dynamic radar schema & sources |
| `GET` | `/api/approvals` | List pending and resolved human approval requests |
| `POST` | `/api/approvals/fill-form` | **Intelligent AI Form Solver**: Reads questions, reasons, and fills DOM |
| `POST` | `/api/approvals/{id}/approve` | Approve and execute staged write action in browser |
| `GET` | `/api/workflows` | List pre-built templates and saved user visual workflows |
| `POST` | `/api/workflows/synthesize` | **Natural Language Workflow Compiler**: Prompt ➔ Visual Action Graph |
| `POST` | `/api/workflows/run` | Execute multi-step visual action graph in CloakBrowser |
| `POST` | `/api/workflows/save` | Save custom workflow routine to SuperBrain Vault |
| `DELETE` | `/api/workflows/{id}` | Delete workflow routine from Vault |
| `GET` | `/api/workflows/history/executions` | Fetch past workflow execution logs and step telemetry |
| `GET` | `/api/workflows/history/screenshots` | Fetch archived workflow screenshot proofs |
| `GET` | `/api/profile` | Get current User Profile & Identity Vault |
| `PUT` | `/api/profile` | Update Identity Vault, academic details, and custom key-values |

---

## 🧪 Testing & Verification

Run the automated test suite from the `backend/` directory:

```bash
cd backend
source .venv/bin/activate

# Run full pytest suite
pytest tests/ -v
```

---

## 📜 License

MIT License — free for personal and commercial exploration.
Built with passion for autonomous, self-learning agentic workflows.
