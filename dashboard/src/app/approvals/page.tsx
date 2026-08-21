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
  ShieldCheck
} from "lucide-react";
import ApprovalCard from "@/components/ApprovalCard";
import { fetchApprovals, simulateApprovalAction } from "@/lib/api";
import { ApprovalDecision } from "@/lib/types";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

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
    // Auto-poll approvals every 3s to reflect live status transitions
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

  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.09] bg-gradient-to-r from-[#170e1c] via-[#1c122c] to-[#121428] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Safety Node Active
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Mandatory Human Gate
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Approval & Safety Gate
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Guarantees zero unauthorized writes · Blocks execution until explicit human confirmation
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={loadApprovals}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
            title="Refresh Approvals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Hard Guarantee Architecture Callout ── */}
      <div className="bento-card p-6 border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-[#181124]/90 to-[#121428] flex flex-col sm:flex-row items-start gap-5 shadow-xl">
        <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-extrabold text-white">
            Non-Bypassable Safety Architecture
          </h4>
          <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
            No autonomous action that <strong>applies, submits, pays, books, or mutates data</strong> is ever executed without explicit human consent. 
            The pipeline physically suspends at <code className="text-rose-300 font-mono text-[11px] bg-black/50 px-2 py-0.5 rounded-lg border border-white/[0.08]">approval_gate.request()</code> until resolved in this UI.
          </p>
        </div>
      </div>

      {/* ── Demo Simulation Controls Bento ── */}
      <div className="bento-card p-6 sm:p-7 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-purple-950/20 to-[#0e1124] space-y-4 shadow-xl">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Live Demo Trigger: Test Human Safety Gate
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Click any action below to dispatch a sensitive workflow and watch Scout hold until you click Approve.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          <button
            onClick={() =>
              handleSimulate(
                "apply",
                "Submit Application to Google Summer of Code 2025 (Project #492)",
                "https://summerofcode.withgoogle.com/apply"
              )
            }
            disabled={simulating}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-indigo-600/20 border border-white/[0.08] hover:border-indigo-500/50 text-left transition-all hover:scale-[1.02] group shadow-sm"
          >
            <span className="text-xs font-black text-white group-hover:text-indigo-200 block">
              1. Simulate GSoC Auto-Apply
            </span>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
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
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-amber-600/20 border border-white/[0.08] hover:border-amber-500/50 text-left transition-all hover:scale-[1.02] group shadow-sm"
          >
            <span className="text-xs font-black text-white group-hover:text-amber-200 block">
              2. Simulate Hotel Room Booking
            </span>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
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
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-purple-600/20 border border-white/[0.08] hover:border-purple-500/50 text-left transition-all hover:scale-[1.02] group shadow-sm"
          >
            <span className="text-xs font-black text-white group-hover:text-purple-200 block">
              3. Simulate SIH Submission
            </span>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
              action: submit · target: Government Portal
            </span>
          </button>
        </div>
      </div>

      {/* ── Pending Approvals Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Pending Action Queue ({pending.length})
          </h3>
        </div>

        {pending.length === 0 ? (
          <div className="bento-card p-12 text-center border border-white/[0.08] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">Queue Clear & Safe</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              No write actions are currently awaiting authorization. Use the simulation buttons above to trigger a test.
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
        <div className="space-y-4 pt-6 border-t border-white/[0.08]">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Resolved Audit Trail</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] font-mono">
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
