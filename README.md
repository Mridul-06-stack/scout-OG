# Scout — Self-Learning Opportunity & Workflow Radar

> Built for the **SLAB (Self-Learning Agent Browser) Hackathon** hosted by **webcmd**

Scout is a **generalized self-learning workflow radar engine**. It converts recurring browser workflows (*"watch this, find that, monitor this site"*) into **learned, reusable, autonomous commands** powered by webcmd's explore-once/reuse-forever infrastructure.

---

## 🎯 Key Proof-of-Concept Verticals

1. **Student Opportunity Scout**: Hunts hackathons, internships, open-source programs (GSoC, LFX, Outreachy), scholarships, and grants.
2. **Hotel Price Scout**: Monitors hotel prices and availability in Manali against user-defined price thresholds.
3. **GitHub Issue & Dev Grant Radar**: Monitors good-first-issues (Rust, Python, React), developer bounties, and Web3/Gitcoin open-source grants.

All three run on the **exact same underlying engine**. Adding a 4th vertical requires **zero new pipeline code** — only a JSON config and matching schema.

---

## 🏗️ Architecture Pipeline

```
Intent → Plan (Claude) → Source Discovery → webcmd Explore & Compile →
Normalize → Match & Rank → Change Detection → Approval Gate (Safety Checkpoint) → Dashboard
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** & npm

### 2. Start Backend (FastAPI on `:8000`)
```bash
cd backend
# Create and activate virtualenv
uv venv .venv --python 3.12
source .venv/bin/activate
uv pip install -e ".[dev]"

# Optional: Add Claude API key in backend/.env for live LLM planning & semantic ranking
# (Fallback heuristic plan is automatically used if no key is provided)
cp .env.example .env

# Run FastAPI Server
uvicorn api.server:app --reload --port 8000
```

### 3. Start Frontend Dashboard (Next.js 15 on `:3000`)
```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 CLI Tools & Scripts

### Run Pipeline from CLI:
```bash
cd backend
source .venv/bin/activate

# Run student opportunities vertical
python scripts/run_pipeline.py -v student_opportunities

# Run hotel monitor with custom intent
python scripts/run_pipeline.py -v hotel_price_monitor -i "Find budget stays in Manali under ₹2500"
```

### Seed Demo Data:
```bash
cd backend
source .venv/bin/activate
python scripts/seed_demo_data.py
```

### Run Test Suite:
```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

---

## 🛡️ Responsible Build & Safety Guarantee

Scout enforces an **Approval Gate** as a required architectural node:
- No automated action that **applies, submits, pays, messages, or deletes** anything ever executes without explicit human confirmation.
- Execution physically suspends until approved via the dashboard or timeout threshold.

---

## 📚 Documentation
- [Architecture & Module Breakdown](docs/architecture.md)
- [Canonical Data Schemas](docs/data-schema.md)
- [3-Scene Demo Script](docs/demo-script.md)
- [Judging Alignment Matrix](docs/judging-alignment.md)
