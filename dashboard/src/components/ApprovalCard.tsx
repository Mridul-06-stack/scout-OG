"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Zap,
  Lock,
  Loader2,
  Globe2
} from "lucide-react";
import { ApprovalDecision } from "../lib/types";
import { approveAction, rejectAction } from "../lib/api";

interface ApprovalCardProps {
  decision: ApprovalDecision;
  onDecisionMade?: () => void;
}

export default function ApprovalCard({ decision, onDecisionMade }: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const { action, status, decided_at, decided_by } = decision;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveAction(decision.id);
      onDecisionMade?.();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectAction(decision.id);
      onDecisionMade?.();
    } finally {
      setLoading(false);
    }
  };

  const isPending = status === "pending";

  return (
    <div className={`bento-card p-6 border transition-all relative overflow-hidden shadow-sm ${
      isPending 
        ? "border-rose-300 bg-rose-50/50 shadow-rose-500/10" 
        : "border-slate-200 bg-white/95"
    }`}>
      {/* Background Warning Glow */}
      {isPending && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl border shadow-sm shrink-0 ${
            isPending 
              ? "bg-rose-100 text-rose-700 border-rose-200" 
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}>
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                Action: {action.action}
              </span>
              {status === "demo_auto_approved" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3 text-indigo-600" />
                  ⚡ Auto-Approved
                </span>
              )}
              {status === "timeout_rejected" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  Timeout Expired
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug font-display">
              {action.description}
            </h4>

            {action.target_url && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 truncate max-w-lg mt-2">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{action.target_url}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse shadow-sm font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Awaiting Consent
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono ${
              status === "approved" || status === "demo_auto_approved"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {status === "approved" || status === "demo_auto_approved" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approved ({decided_by || "human"})
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  Rejected ({decided_by || "human"})
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Decision Bar / Controls */}
      {isPending && (
        <div className="mt-5 pt-4 border-t border-rose-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-800 font-medium">
            <Clock className="w-4 h-4 text-rose-600 animate-spin" />
            <span>Blocks browser execution until you explicitly approve.</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Reject Action
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Approve & Execute</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
