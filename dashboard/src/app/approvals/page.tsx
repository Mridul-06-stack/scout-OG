"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  Zap, 
  Play, 
  CheckCircle2, 
  Info,
  Layers
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Safety Checkpoint
            </span>
            <span className="text-xs text-slate-400">
              Mandatory Non-Bypassable Pipeline Node
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Human Approval Gate
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadApprovals}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh Approvals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Architectural Guarantee Alert */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-950/20 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">
            Hard Safety Architecture Rule
          </h4>
          <p className="text-xs text-rose-200/80 leading-relaxed">
            No automated action that <strong>applies, submits, pays, messages, or deletes</strong> anything ever executes without explicit human confirmation. 
            Execution physically suspends at <code className="text-rose-300 font-mono text-[11px] bg-black/40 px-1.5 py-0.5 rounded">approval_gate.request()</code> until resolved.
          </p>
        </div>
      </div>

      {/* Demo Simulation Controls */}
      <div className="glass-panel rounded-3xl p-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Live Demo Trigger: Simulate Autonomous Write Actions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click to initiate a sensitive browser action and watch the gate block execution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() =>
              handleSimulate(
                "apply",
                "Submit Application to Google Summer of Code 2025 (Project #492)",
                "https://summerofcode.withgoogle.com/apply"
              )
            }
            disabled={simulating}
            className="p-3 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
          >
            <span className="text-xs font-bold text-white group-hover:text-indigo-300 block">
              1. Simulate GSoC Auto-Apply
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Action: apply · Target: Google API
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
            className="p-3 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
          >
            <span className="text-xs font-bold text-white group-hover:text-indigo-300 block">
              2. Simulate Hotel Room Booking
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Action: payment · Target: Hotel Checkout
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
            className="p-3 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
          >
            <span className="text-xs font-bold text-white group-hover:text-indigo-300 block">
              3. Simulate SIH Submission
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Action: submit · Target: Government Portal
            </span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Pending Action Queue ({pending.length})
          </h3>
        </div>

        {pending.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-white/5 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">Queue Empty & Safe</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No write actions are currently awaiting approval. Use the simulation buttons above to test the gate.
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

      {/* Resolved Approvals History */}
      {resolved.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resolved Audit Trail ({resolved.length})
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
