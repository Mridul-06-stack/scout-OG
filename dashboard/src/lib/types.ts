export type ChangeType = "new" | "updated" | "closing_soon" | "unchanged" | "removed";

export type OpportunityStatus = 
  | "discovered" 
  | "interested" 
  | "saved" 
  | "applying" 
  | "applied" 
  | "selected" 
  | "closed";

export type WorkflowStrategy = "public_dom" | "intercepted_api" | "authenticated_ui";

export type RunStatus = "success" | "failed" | "needs_review" | "running";

export type ApprovalAction = "apply" | "submit" | "message" | "payment" | "delete";

export type ApprovalStatus = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "timeout_rejected" 
  | "demo_auto_approved";

export interface Opportunity {
  id: string;
  vertical: string;
  source_url: string;
  title: string;
  type: string;
  deadline: string | null;
  location: string | null;
  tags: string[];
  raw_fields: Record<string, any>;
  match_score: number;
  status: OpportunityStatus;
  first_seen_at: string;
  last_seen_at: string;
  change_type: ChangeType;
}

export interface StatsResponse {
  total: number;
  new_today: number;
  closing_soon: number;
  applied: number;
  by_vertical: Record<string, number>;
}

export interface OpportunitiesListResponse {
  total: number;
  offset: number;
  limit: number;
  items: Opportunity[];
}

export interface PipelineRun {
  id: string;
  vertical: string;
  intent: string;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  sources_processed: number;
  records_found: number;
  new_records: number;
  updated_records: number;
  errors: string[];
}

export interface LearnedWorkflow {
  id: string;
  source_domain: string;
  source_url: string;
  vertical: string;
  learned_at: string;
  strategy: WorkflowStrategy;
  extraction_schema_ref: string;
  compiled_command_ref: string;
  last_run_at: string | null;
  last_run_status: RunStatus;
  consecutive_failures: number;
  requires_approval_for: ApprovalAction[];
}

export interface WriteAction {
  action: ApprovalAction;
  opportunity_id: string;
  description: string;
  target_url: string;
  metadata: Record<string, any>;
}

export interface ApprovalDecision {
  id: string;
  action: WriteAction;
  status: ApprovalStatus;
  decided_at: string | null;
  decided_by: string;
}

export interface UserProfile {
  id: string;
  vertical_interests: string[];
  attributes: Record<string, any>;
  include_tags: string[];
  exclude_tags: string[];
  constraints: Record<string, any>;
}
