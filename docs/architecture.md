# Scout Architecture & Engineering Deep-Dive

Scout is a **generalized self-learning workflow radar engine**. It converts recurring browser monitoring tasks into **learned, reusable, autonomous commands** using webcmd's explore-once/reuse-forever paradigm.

---

## 1. Pipeline Graph

```
                         ┌─────────────────────┐
                         │   User Intent Input │
                         │ ("watch X", "find Y")│
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │       PLANNER       │
                         │ intent → categories,│
                         │ keywords, schema    │
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │  SOURCE DISCOVERY   │
                         │ curated seeds + web │
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │    WEBCMD LAYER     │
                         │ explore → compile → │
                         │ reusable command    │
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │     NORMALIZER      │
                         │ raw data → common   │
                         │ schema              │
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │   MATCH / RANK      │
                         │ score vs user profile│
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │   CHANGE DETECTOR   │
                         │ diff vs last run    │
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │    APPROVAL GATE    │
                         │ human confirms any  │
                         │ write/action        │
                         └───────────┬─────────┘
                                     ▼
                         ┌─────────────────────┐
                         │  STORAGE + DASHBOARD│
                         └─────────────────────┘
```

---

## 2. Module Specifications

### 2.1 Planner (`core/planner/planner.py`)
- Accepts a natural-language intent string.
- Decomposes the intent into `PlanConfig` using Claude Haiku with **prompt caching** (`cache_control: {"type": "ephemeral"}`) and a strict `max_tokens=1024` budget.
- Falls back to heuristic keywords when offline or unconfigured.

### 2.2 Source Discovery (`core/discovery/source_discovery.py`)
- Loads curated seeds from `verticals/<vertical>/seed_sources.json`.
- Filters candidates based on categories extracted by the Planner.

### 2.3 webcmd Adapter Layer (`core/webcmd_adapter/`)
- **Base Class (`base.py`)**: Implements exponential backoff retry via `tenacity` (3 attempts, 1s→2s→4s), custom timeouts (`explore=60s`, `execute=30s`), and error wrapping.
- **Circuit Breaker (`execute.py`)**: If a source fails 3 consecutive runs, it is automatically marked `needs_review` and skipped to prevent infinite error loops.
- **Registry (`registry.py`)**: Persists learned commands across runs so known domains are never re-explored needlessly.
- **Mode Toggle (`WEBCMD_MODE`)**: Seamless switch between `mock` and `real` SDK.

### 2.4 Normalizer (`core/normalizer/normalizer.py`)
- Normalizes disparate raw page extractions into canonical `Opportunity` structures with typed fields (`deadline`, `location`, `tags`, `raw_fields`).

### 2.5 Matcher & Ranker (`core/matcher/matcher.py`)
- Multi-factor scoring model:
  - Tag Overlap (40%)
  - Deadline Urgency (15%)
  - Location Match (15%)
  - Type & Vertical Alignment (15%)
  - Budget / Constraints (15%)
  - Optional Claude Haiku batched semantic boost (max_tokens=512)

### 2.6 Change Detector (`core/change_detector/change_detector.py`)
- Diffs each pipeline execution against the last snapshot stored in `storage/snapshots/<vertical>_last.json`.
- Identifies:
  - `new`: newly discovered
  - `updated`: modified deadline, location, or price
  - `closing_soon`: deadline <= 7 days
  - `unchanged`: duplicate content
  - `removed`: vanished from target site

### 2.7 Approval Gate (`core/approval_gate/approval_gate.py`)
- **Hard non-bypassable node in the architecture.**
- Required for any write action (`apply`, `submit`, `payment`, `message`, `delete`).
- Physically halts execution asynchronously until human consent is provided via dashboard.
- Includes a configurable timeout (default 300s, auto-reject on expiry) and a demo mode (10s auto-approve for rehearsals).
