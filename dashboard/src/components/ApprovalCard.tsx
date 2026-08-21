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
    <div className={`bento-card p-6 border transition-all relative overflow-hidden ${
      isPending 
        ? "border-rose-500/50 bg-gradient-to-r from-rose-950/30 via-[#161226]/90 to-[#121428] shadow-2xl shadow-rose-950/30" 
        : "border-white/[0.08] bg-[#0e1124]/70"
    }`}>
      {/* Background Warning Glow */}
      {isPending && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl border shadow-inner shrink-0 ${
            isPending 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/20" 
              : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
          }`}>
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Action: {action.action}
              </span>
              {status === "demo_auto_approved" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  ⚡ Auto-Approved
                </span>
              )}
              {status === "timeout_rejected" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600">
                  Timeout Expired
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
              {action.description}
            </h4>

            {action.target_url && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.06] truncate max-w-lg mt-2">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{action.target_url}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/25 text-rose-200 border border-rose-500/50 animate-pulse shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Awaiting Consent
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
              status === "approved" || status === "demo_auto_approved"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/15 text-red-300 border border-red-500/30"
            }`}>
              {status === "approved" || status === "demo_auto_approved" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Approved ({decided_by || "human"})
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  Rejected ({decided_by || "human"})
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Decision Bar / Controls */}
      {isPending && (
        <div className="mt-5 pt-4 border-t border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-300/90 font-medium">
            <Clock className="w-4 h-4 text-rose-400 animate-spin" />
            <span>Blocks browser execution until you explicitly approve.</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-colors"
            >
              Reject Action
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
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
