# Scout: Frontend and Backend Architecture

This document breaks down the Scout application into its core components (Frontend and Backend) and explains how they communicate to execute autonomous web tasks. 

---

## 🎨 Frontend (Next.js 16)

The frontend is a modern web application built with **Next.js 16 (App Router)** and styled using Tailwind CSS and Vanilla CSS. It provides the visual interfaces to interact with the backend AI agents.

### Core Portals
1. **Radar Dashboard (`/`)**: Displays the live feed of opportunities, metrics, and allows you to "Run Radar Now" to pull fresh data from the internet.
2. **Workflow Studio (`/workflows`)**: A visual node-based orchestrator allowing you to chain browser actions like `scroll`, `click`, `extract_text`, and `screenshot`.
3. **Approval Gate (`/approvals`)**: A human-in-the-loop safety gate where any automated "write" actions (e.g., submitting a form) wait for your 1-click confirmation before executing in the browser. 

The frontend uses standard `fetch` API methods natively bridging over to the local FastAPI backend (Next.js automatically rewrites `/api/*` to `http://localhost:8000/api/*`).

---

## ⚙️ Backend (FastAPI + Python 3.12)

The backend is built on **FastAPI** and orchestrates the heavy lifting — it manages databases, communicates with the OpenAI API, and spawns the browser processes.

### Core Modules
1. **FastAPI Routes (`/api`)**: Endpoints for handling pipelines, approvals, storing profiles, and parsing opportunities.
2. **Intelligence Engine (`gpt-4o-mini`)**: Dynamically extracts constraints from natural language workflows ("Find me cheap hotels") and synthesizes reasoning for web forms.
3. **Webcmd Subprocess Adapter**: This is the heart of the engine! To perform real-world browsing, the backend triggers the `@agentrhq/webcmd` CLI utilizing asynchronous Windows subprocesses. 
4. **SQLite Persistence Layer**: Uses `aiosqlite` and `sqlalchemy` to cache radar findings, generated AI schemas, user identity profiles, and workflows.

---

## 🔄 System Flowchart

Below is the Mermaid flowchart visualizing how data flows from your click on the frontend through the backend and into the stealth browser.

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff,font-weight:bold
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff,font-weight:bold
    classDef database fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff,font-weight:bold
    classDef browser fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff,font-weight:bold

    subgraph Frontend [Next.js Dashboard Port: 3000]
        UI[User Action / Dashboards]:::frontend
        Studio[Workflow Studio]:::frontend
        Gate[Approval Gate]:::frontend
    end

    subgraph Backend [FastAPI Server Port: 8000]
        API[REST API Endpoints]:::backend
        LLM[OpenAI GPT-4o-mini]:::backend
        Adapter[Webcmd Subprocess Adapter]:::backend
        DB[(SQLite Local DB)]:::database
    end

    subgraph Execution [Browser Engine Automation]
        Webcmd[webcmd CLI Playwright Browser]:::browser
    end

    %% Interactions
    UI -->|1. Triggers Action| API
    Studio -->|1. Synthesizes Flow| API
    Gate -->|1. Approves Action| API
    
    API -->|2. Reads/Writes Data| DB
    API <-->|3. Generates Intent/Reasoning| LLM
    
    API -->|4. Spawns Subprocess Task| Adapter
    Adapter -->|5. Executes Browser Commands| Webcmd
    
    Webcmd -->|6. Yields DOM, Screenshots & Status| Adapter
    Adapter -->|7. Stores Final Action Result| DB
    DB -->|8. Automatically Updates| UI
```

## Step-by-Step Working Example
If you click **"Run Radar Now"** on the Frontend:
1. The Next.js frontend sends a `POST /api/pipeline/run` request containing your intent to the FastAPI server.
2. The server connects to the database to evaluate existing targets via the `SQLite Local DB`.
3. The server uses `OpenAI GPT-4o-mini` to translate your intent ("Find AI hackathons") into specific, actionable browser criteria.
4. The **Webcmd Subprocess Adapter** spawns a background asyncio process that invokes the `webcmd` CLI.
5. The `webcmd CLI Playwright Browser` silently launches, navigates web pages, crawls through information, takes screenshots, and returns extracted JSON data.
6. The backend saves the extracted opportunities in the local database and the frontend updates to show you the new results!
