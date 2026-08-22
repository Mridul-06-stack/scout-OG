# Scout Canonical Data Schemas

Scout uses vertical-agnostic canonical data contracts so that any new vertical can be plugged in without changing engine code.

---

## 1. `Opportunity` (Normalized Pipeline Output)

```json
{
  "id": "3e10cb70-5920-4209-9025-0ff2d15ae40a",
  "vertical": "student_opportunities",
  "source_url": "https://unstop.com/hackathons",
  "title": "Unstop TechSprint India",
  "type": "hackathon",
  "deadline": "2026-08-26T10:12:10.132859",
  "location": "Hybrid — Delhi NCR + Online",
  "tags": ["hackathon", "AI", "India", "tech"],
  "raw_fields": {
    "organization": "Unstop",
    "prize": "₹3,00,000",
    "description": "National-level tech hackathon open to all college students."
  },
  "match_score": 0.741,
  "status": "discovered",
  "first_seen_at": "2026-08-21T10:12:16.598355",
  "last_seen_at": "2026-08-21T10:12:16.598356",
  "change_type": "closing_soon"
}
```

---

## 2. `LearnedWorkflow` (webcmd Compiled Command)

```json
{
  "id": "uuid-v4",
  "source_domain": "unstop.com",
  "source_url": "https://unstop.com/hackathons",
  "vertical": "student_opportunities",
  "learned_at": "2026-08-21T10:12:10Z",
  "strategy": "public_dom",
  "extraction_schema_ref": "opportunity_schema.json",
  "compiled_command_ref": "mock_cmd_unstop.com",
  "last_run_at": "2026-08-21T10:12:16Z",
  "last_run_status": "success",
  "consecutive_failures": 0,
  "requires_approval_for": ["apply", "submit"]
}
```

---

## 3. `UserProfile` (Scoring Weights)

```json
{
  "id": "uuid-v4",
  "vertical_interests": ["student_opportunities"],
  "attributes": {
    "year": 2,
    "field": "CSE",
    "location": "India",
    "university": "NIT Hamirpur"
  },
  "include_tags": ["AI", "machine_learning", "open_source", "hackathon", "remote", "India", "coding"],
  "exclude_tags": ["unpaid", "frontend_only"],
  "constraints": {
    "max_price": 3000
  }
}
```
