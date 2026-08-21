"""Shared Pydantic models used across the entire Scout pipeline."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────

class ChangeType(str, Enum):
    NEW = "new"
    UPDATED = "updated"
    CLOSING_SOON = "closing_soon"
    UNCHANGED = "unchanged"
    REMOVED = "removed"


class OpportunityStatus(str, Enum):
    DISCOVERED = "discovered"
    INTERESTED = "interested"
    SAVED = "saved"
    APPLYING = "applying"
    APPLIED = "applied"
    SELECTED = "selected"
    CLOSED = "closed"


class WorkflowStrategy(str, Enum):
    PUBLIC_DOM = "public_dom"
    INTERCEPTED_API = "intercepted_api"
    AUTHENTICATED_UI = "authenticated_ui"


class RunStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    NEEDS_REVIEW = "needs_review"
    RUNNING = "running"


class ApprovalAction(str, Enum):
    APPLY = "apply"
    SUBMIT = "submit"
    MESSAGE = "message"
    PAYMENT = "payment"
    DELETE = "delete"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    TIMEOUT_REJECTED = "timeout_rejected"
    DEMO_AUTO_APPROVED = "demo_auto_approved"


# ── Planner Models ──────────────────────────────────────────────────────

class PlanConfig(BaseModel):
    """Output of the planner: structured breakdown of a user intent."""
    vertical: str
    categories: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    search_queries: list[str] = Field(default_factory=list)
    schema_ref: str = "opportunity_schema.json"


# ── Source / Workflow Models ────────────────────────────────────────────

class SourceCandidate(BaseModel):
    """A URL + metadata discovered by source_discovery."""
    url: str
    domain: str = ""
    vertical: str = ""
    category: str = ""
    name: str = ""
    already_learned: bool = False


class LearnedWorkflow(BaseModel):
    """What webcmd learns about a source and stores for reuse."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_domain: str
    source_url: str
    vertical: str
    learned_at: datetime = Field(default_factory=datetime.utcnow)
    strategy: WorkflowStrategy = WorkflowStrategy.PUBLIC_DOM
    extraction_schema_ref: str = "opportunity_schema.json"
    compiled_command_ref: str = ""
    last_run_at: datetime | None = None
    last_run_status: RunStatus = RunStatus.SUCCESS
    consecutive_failures: int = 0
    requires_approval_for: list[ApprovalAction] = Field(default_factory=list)


class RawRecord(BaseModel):
    """Unstructured data extracted by webcmd from a single page/item."""
    source_url: str
    source_domain: str
    raw_fields: dict[str, Any] = Field(default_factory=dict)


# ── Canonical Opportunity ───────────────────────────────────────────────

class Opportunity(BaseModel):
    """The canonical, vertical-agnostic record after normalization."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vertical: str
    source_url: str
    title: str
    type: str = ""  # internship, hackathon, hotel, etc.
    deadline: datetime | None = None
    location: str | None = None
    tags: list[str] = Field(default_factory=list)
    raw_fields: dict[str, Any] = Field(default_factory=dict)
    match_score: float = 0.0
    status: OpportunityStatus = OpportunityStatus.DISCOVERED
    first_seen_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen_at: datetime = Field(default_factory=datetime.utcnow)
    change_type: ChangeType = ChangeType.NEW


# ── User Profile & Identity Vault ───────────────────────────────────────

class UserProfile(BaseModel):
    """User preferences used by the matcher for scoring, plus full Identity Vault for intelligent form filling."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Personal Identity
    full_name: str = "Shlok Developer"
    email: str = "shlok.dev@scout.ai"
    phone: str = "+91 9876543210"
    date_of_birth: str = "2003-05-15"
    gender: str = "Male"
    address: str = "IIT Campus, Roorkee, Uttarakhand, India"
    city: str = "Roorkee"
    state: str = "Uttarakhand"
    country: str = "India"
    zip_code: str = "247667"

    # Academic Identity
    university: str = "Indian Institute of Technology (IIT) Roorkee"
    degree: str = "Bachelor of Technology (B.Tech)"
    major: str = "Computer Science and Engineering"
    graduation_year: str = "2026"
    gpa_cgpa: str = "8.9 / 10.0"

    # Professional & Links
    headline: str = "Full-Stack AI Agent & Systems Engineer"
    bio: str = "Computer Science undergraduate passionate about building autonomous agentic workflows and distributed systems."
    github_url: str = "https://github.com/Shlok1729"
    linkedin_url: str = "https://linkedin.com/in/shlok1729"
    portfolio_url: str = "https://shlok.dev"
    skills: list[str] = Field(default_factory=lambda: ["Python", "TypeScript", "Next.js", "AI Agents", "Playwright", "FastAPI", "React", "Rust"])
    projects_summary: str = "Built Scout — Self-Learning Autonomous Opportunity Radar; high-performance webcmd browser automation engine; full-stack applications with Next.js and FastAPI."
    work_experience: str = "Software Engineering Intern at AI Labs (2025) — built headless browser pipelines and LLM evaluation architectures."

    # Custom Key-Value Identity Vault (e.g. Student ID, Passport, Aadhaar, Team Name)
    custom_vault: dict[str, str] = Field(default_factory=lambda: {
        "Student ID": "IITR2022CS104",
        "Preferred Role": "AI Engineer / Full Stack Developer",
        "Hackathon Team": "Team Scout AI",
        "Available Dates": "Immediate / Summer 2025"
    })

    # Legacy & Radar Matching Attributes
    vertical_interests: list[str] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)
    include_tags: list[str] = Field(default_factory=list)
    exclude_tags: list[str] = Field(default_factory=list)
    constraints: dict[str, Any] = Field(default_factory=dict)


# ── Approval ────────────────────────────────────────────────────────────

class WriteAction(BaseModel):
    """A proposed write action that requires human approval."""
    action: ApprovalAction
    opportunity_id: str
    description: str
    target_url: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class ApprovalDecision(BaseModel):
    """Result of an approval request."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: WriteAction
    status: ApprovalStatus = ApprovalStatus.PENDING
    decided_at: datetime | None = None
    decided_by: str = ""  # "human", "timeout", "demo_mode"


# ── Pipeline Run ────────────────────────────────────────────────────────

class PipelineRunInfo(BaseModel):
    """Metadata about a single pipeline execution."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vertical: str
    intent: str = ""
    status: RunStatus = RunStatus.RUNNING
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: datetime | None = None
    sources_processed: int = 0
    records_found: int = 0
    new_records: int = 0
    updated_records: int = 0
    errors: list[str] = Field(default_factory=list)
