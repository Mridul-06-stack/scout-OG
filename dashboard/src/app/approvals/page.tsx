"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  Zap, 
  Play, 
  CheckCircle2, 
  Layers,
  Sparkles,
  ShieldCheck,
  FileText,
  Loader2,
  ExternalLink,
  ArrowRight,
  Bot,
  Brain,
  Calculator,
  UserCheck,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import ApprovalCard from "@/components/ApprovalCard";
import { fetchApprovals, simulateApprovalAction, fillForm } from "@/lib/api";
import { ApprovalDecision } from "@/lib/types";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Form Filler Sandbox State
  const [customFormUrl, setCustomFormUrl] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [formFilling, setFormFilling] = useState(false);
  const [formFillResult, setFormFillResult] = useState<any>(null);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await fetchApprovals();
      setApprovals(data.items);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    const interval = setInterval(loadApprovals, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (action: string, desc: string, url: string) => {
    setSimulating(true);
    try {
      await simulateApprovalAction(action, desc, url);
      await loadApprovals();
    } finally {
      setSimulating(false);
    }
  };

  const handleCustomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormUrl) return;

    setFormFilling(true);
    setFormFillResult(null);

    try {
      const res = await fillForm({
        form_url: customFormUrl,
        auto_submit: autoSubmit,
      });
      setFormFillResult(res);
      loadApprovals();
    } catch (err: any) {
      setFormFillResult({ status: "error", error: err.message || "Failed to fill form" });
    } finally {
      setFormFilling(false);
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "math_logic":
        return {
          label: "🧮 Math & Logic",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
      case "knowledge":
        return {
          label: "💡 Knowledge",
          color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
      case "ai_synthesis":
        return {
          label: "✨ AI Synthesis",
          color: "bg-pink-500/15 text-pink-300 border-pink-500/30",
        };
      case "vault":
      default:
        return {
          label: "🏛️ Identity Vault",
          color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        };
    }
  };

  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-slate-200/90 bg-gradient-to-r from-white via-rose-50/40 to-indigo-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 font-mono">
              Safety Node Active
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Mandatory Human Gate
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            Approval Gate & AI Form Agent
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Intelligent reasoning form solver · Draws from your Identity Vault · Zero unapproved writes
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={loadApprovals}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-sm cursor-pointer"
            title="Refresh Approvals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Google Form & Web Form Auto-Filler Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-gradient-to-bl from-indigo-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                <Brain className="w-5 h-5 text-indigo-600" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                Intelligent AI Form Agent (Google Forms & Government Portals)
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Scout reads every question context, solves math/logic/essays via <code className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono font-bold">gpt-4o-mini</code>, and types accurate responses!
            </p>
          </div>
        </div>

        <form onSubmit={handleCustomFormSubmit} className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="url"
              placeholder="https://docs.google.com/forms/d/e/.../viewform or any application URL"
              value={customFormUrl}
              onChange={(e) => setCustomFormUrl(e.target.value)}
              required
              disabled={formFilling}
              className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-mono shadow-inner font-medium"
            />

            <button
              type="submit"
              disabled={formFilling || !customFormUrl}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 shrink-0 cursor-pointer"
            >
              {formFilling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Reasoning & Typing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Intelligently Auto-Fill Form</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => setAutoSubmit(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4"
              />
              <span>Submit Form Automatically in Browser (Uncheck to only pre-fill inputs)</span>
            </label>
          </div>
        </form>

        {/* Live Form Fill Results Telemetry */}
        {formFillResult && (
          <div className="p-5 rounded-2xl bg-white border border-indigo-200 text-xs space-y-4 animate-in fade-in duration-200 relative z-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {formFillResult.status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                )}
                <span className="font-black text-slate-900 text-sm font-display">
                  {formFillResult.status === "success" 
                    ? `Form Intelligently Filled (${formFillResult.filledCount || 0} Questions Solved)`
                    : "Form Processing Notice"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {formFillResult.pageTitle}
              </span>
            </div>

            {formFillResult.error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formFillResult.error}
              </div>
            )}

            {formFillResult.filledFields && formFillResult.filledFields.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 font-mono block">
                  Question-by-Question AI Reasoning Breakdown:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formFillResult.filledFields.map((f: any, i: number) => {
                    const badge = getSourceBadge(f.source);
                    return (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-900 font-bold text-xs leading-snug line-clamp-2">
                            {f.field}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 font-mono ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-emerald-700 shadow-inner">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Typed Answer</span>
                          <span className="break-words font-semibold">{f.value}</span>
                        </div>

                        {f.reasoning && (
                          <p className="text-[10px] text-slate-500 italic">
                            💡 {f.reasoning}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Demo Simulation Controls Bento ── */}
      <div className="bento-card p-6 sm:p-7 border border-slate-200 bg-white/95 space-y-4 shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-display">
            <Zap className="w-4 h-4 text-amber-500" />
            Simulate Staged Write Actions
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Stage a mock registration or payment to test human gate approval holding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            onClick={() =>
              handleSimulate(
                "apply",
                "Submit Application to Google Summer of Code 2025 (Project #492)",
                "https://summerofcode.withgoogle.com/apply"
              )
            }
            disabled={simulating}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all hover:scale-[1.02] group shadow-sm cursor-pointer"
          >
            <span className="text-xs font-black text-slate-900 group-hover:text-indigo-700 block">
              1. Simulate GSoC Auto-Apply
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-mono">
              action: apply · target: Google API
            </span>
          </button>

          <button
            onClick={() =>
              handleSimulate(
                "payment",
                "Book Himalayan Village Resort Manali (₹2800 Advance Hold)",
                "https://example-hotels.com/book/himalayan-village"
              )
            }
            disabled={simulating}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all hover:scale-[1.02] group shadow-sm cursor-pointer"
          >
            <span className="text-xs font-black text-slate-900 group-hover:text-amber-700 block">
              2. Simulate Hotel Booking Hold
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-mono">
              action: payment · target: Hotel Checkout
            </span>
          </button>

          <button
            onClick={() =>
              handleSimulate(
                "submit",
                "Submit SIH 2025 Problem Statement Proposal",
                "https://sih.gov.in/portal/submit"
              )
            }
            disabled={simulating}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all hover:scale-[1.02] group shadow-sm cursor-pointer"
          >
            <span className="text-xs font-black text-slate-900 group-hover:text-purple-700 block">
              3. Simulate SIH Submission
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-mono">
              action: submit · target: Government Portal
            </span>
          </button>
        </div>
      </div>

      {/* ── Pending Approvals Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-display">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Pending Action Queue ({pending.length})
          </h3>
        </div>

        {pending.length === 0 ? (
          <div className="bento-card p-12 text-center border border-slate-200 bg-white/95 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-display">Queue Clear & Safe</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              No write actions are currently awaiting authorization. Use the simulation buttons or Google Form auto-filler above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((item) => (
              <ApprovalCard
                key={item.id}
                decision={item}
                onDecisionMade={loadApprovals}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Resolved Approvals Audit History ── */}
      {resolved.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2 font-mono">
            <span>Resolved Audit Trail</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-mono">
              {resolved.length} Logged
            </span>
          </h3>
          <div className="space-y-3">
            {resolved.map((item) => (
              <ApprovalCard
                key={item.id}
                decision={item}
                onDecisionMade={loadApprovals}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
