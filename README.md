<div align="center">

# 🔭 Scout — Self-Learning Autonomous Opportunity & Workflow Radar

**Turn recurring web discovery, form filling, and monitoring into intelligent, autonomous browser agents.**

[![Built with webcmd](https://img.shields.io/badge/Built%20with-webcmd%20CloakBrowser-6366f1?style=for-the-badge)](https://github.com/agentrhq/webcmd)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20Turbopack-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%26%20SQLite-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI gpt-4o-mini](https://img.shields.io/badge/AI%20Engine-gpt--4o--mini-10a37f?style=for-the-badge&logo=openai)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Executive Overview

Scout is an **autonomous, self-learning web intelligence radar & browser action engine**. Powered by `@agentrhq/webcmd`, Scout breaks free from static web scraping and rigid RPA bots.

Instead of manual search or brittle scripts, Scout **learns web workflows once, caches deterministic compiled action paths, tracks real-time temporal state diffs, answers dynamic form questions with multi-step AI reasoning, and executes browser actions with anti-bot stealth.**

```
                                      ┌─────────────────────────────────────────┐
                                      │        User Intent / Dynamic Studio     │
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

## 🚀 Core Moats & Killer USPs

### 1. 🧠 Intelligent AI Form Agent & Personal Identity Vault (`/approvals` & `/profile`)
- **Beyond Blind Guessing**: Reads the full context of every question on Google Forms, university portals, and government applications.
- **Math & Logic Reasoning**: Computes arithmetic and logic traps on the fly (*"What is 2 multiplied by 2?"* ➔ `4`).
- **Identity Vault Matching**: Pulls verified personal, academic, and custom ID data (*University, CGPA, GitHub, Student ID, Passport*) from your encrypted local profile.
- **Tailored Essay Synthesis**: Uses `gpt-4o-mini` to draft crisp, articulate short answers customized to your projects and skills.
- **Anti-Bot CloakBrowser Stealth**: Dispatches authentic human keystroke lifecycle events (`focus` ➔ `input` ➔ `change` ➔ `blur`) with realistic timing delays and headless fingerprint masking.

### 2. 🎮 Visual No-Code Workflow Studio (`/workflows`)
- **Gamified Action Block Canvas**: Visually assemble and connect glowing action nodes:
  - 🌐 **Navigate URL**: Visit any web feed with stealth browser.
  - 📜 **Smart Scroll**: Scroll dynamic lazy-loaded pages (Medium, Twitter, Reddit, ProductHunt).
  - 🧠 **AI Content Filter**: Score and rank articles by topic or quality.
  - 📸 **Capture Screenshot**: Archive high-resolution visual proof snapshots.
  - 🖱️ **Click & Interact**: Trigger buttons, dropdowns, and paginations.
  - 💾 **Export Artifacts**: Save structured JSON and image galleries.
- **Natural Language Workflow Compiler**: Type plain English (*"Scroll a blog page, find the good ones and take screenshots of them and save them"*) ➔ Instantly compiles an executable 5-block action graph in <500ms.

### 3. 🔭 Dynamic Radar Studio (`/`)
- **Zero-Code Radar Creation**: Create radars for ANY domain in seconds (e.g. *Share Market Movers, Crypto Airdrops, VC Grants, Apartment Rentals*).
- **On-the-Fly Schema Synthesis**: `gpt-4o-mini` dynamically generates the extraction schema, seed URLs, and field mappings.

### 4. 🛡️ Human Approval Gate
- **Zero Unapproved Writes**: Automated actions that apply, submit, pay, or message are held at the Safety Gate.
- **Live Question-by-Question Telemetry**: Inspect the AI's step-by-step reasoning and typed values before giving 1-click execution signoff.

### 5. ⚡ Explore-Once `webcmd` Compilation & Temporal Diffing
- **Learn Once, Run Fast**: Compiles DOM pathways into reusable commands.
- **Temporal State Diffing**: Distinguishes `NEW`, `UPDATED`, `CLOSING_SOON`, and `UNCHANGED` records with instant alerting.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Browser Execution** | `@agentrhq/webcmd` (Playwright / Chromium) | Stealth CloakBrowser session automation & command compilation |
| **Backend API** | FastAPI (Python 3.12) | Asynchronous REST backend, SSE execution streams, SQLite DB |
| **Intelligence** | OpenAI `gpt-4o-mini` (AsyncOpenAI) | Natural language synthesis, semantic matching, and form reasoning |
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
