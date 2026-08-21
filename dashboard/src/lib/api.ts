import {
  Opportunity,
  OpportunitiesListResponse,
  StatsResponse,
  PipelineRun,
  LearnedWorkflow,
  ApprovalDecision,
  UserProfile,
  OpportunityStatus,
} from "./types";

const BASE_URL = ""; // Relative path uses Next.js rewrites to proxy to http://localhost:8000

export async function fetchOpportunities(params?: {
  vertical?: string;
  status?: string;
  change_type?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<OpportunitiesListResponse> {
  const query = new URLSearchParams();
  if (params?.vertical) query.append("vertical", params.vertical);
  if (params?.status) query.append("status", params.status);
  if (params?.change_type) query.append("change_type", params.change_type);
  if (params?.tag) query.append("tag", params.tag);
  if (params?.search) query.append("search", params.search);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.offset) query.append("offset", params.offset.toString());

  const res = await fetch(`${BASE_URL}/api/opportunities?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${BASE_URL}/api/opportunities/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${BASE_URL}/api/opportunities/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function triggerPipelineRun(
  vertical: string,
  intent: string = ""
): Promise<{ message: string; run_id: string; vertical: string }> {
  const res = await fetch(`${BASE_URL}/api/pipeline/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vertical, intent }),
  });
  if (!res.ok) throw new Error("Failed to trigger pipeline");
  return res.json();
}

export async function fetchPipelineRuns(limit = 10): Promise<{ total: number; items: PipelineRun[] }> {
  const res = await fetch(`${BASE_URL}/api/pipeline/runs?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch pipeline runs");
  return res.json();
}

export async function fetchSources(): Promise<{ total: number; items: LearnedWorkflow[] }> {
  const res = await fetch(`${BASE_URL}/api/sources`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch sources");
  return res.json();
}

export async function learnSource(
  url: string,
  vertical: string,
  name?: string
): Promise<{ message?: string; workflow?: LearnedWorkflow; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/sources/learn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, vertical, name }),
  });
  return res.json();
}

export async function removeSource(domain: string): Promise<{ message?: string; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/sources/${domain}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchApprovals(pendingOnly = false): Promise<{ total: number; items: ApprovalDecision[] }> {
  const res = await fetch(`${BASE_URL}/api/approvals?pending_only=${pendingOnly}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch approvals");
  return res.json();
}

export async function approveAction(id: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/approvals/${id}/approve`, {
    method: "POST",
  });
  return res.json();
}

export async function rejectAction(id: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/approvals/${id}/reject`, {
    method: "POST",
  });
  return res.json();
}

export async function simulateApprovalAction(
  action: string,
  description: string,
  target_url: string
): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/approvals/simulate?action=${encodeURIComponent(action)}&description=${encodeURIComponent(description)}&target_url=${encodeURIComponent(target_url)}`, {
    method: "POST",
  });
  return res.json();
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(profile: Partial<UserProfile>): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return res.json();
}

export async function fetchVerticals(): Promise<{ items: import("./types").VerticalInfo[] }> {
  const res = await fetch(`${BASE_URL}/api/verticals`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch verticals");
  return res.json();
}

export async function createVertical(data: {
  name: string;
  description: string;
  seed_urls?: string[];
  categories?: string[];
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/verticals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create vertical");
  }
  return res.json();
}

export async function fillForm(data: {
  form_url: string;
  user_data?: Record<string, any>;
  auto_submit?: boolean;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/approvals/fill-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
