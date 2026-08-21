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
  Building
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
    <div className={`glass-panel rounded-2xl p-5 border transition-all ${
      isPending 
        ? "border-rose-500/40 bg-rose-950/10 shadow-rose-950/20 shadow-xl" 
        : "border-white/10 opacity-80"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isPending 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
              : "bg-white/5 text-slate-400 border-white/10"
          }`}>
            <Lock className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Action: {action.action}
              </span>
              {status === "demo_auto_approved" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-indigo-400" />
                  ⚡ Demo Auto-Approved
                </span>
              )}
              {status === "timeout_rejected" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
                  Timeout Denied
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white tracking-tight">
              {action.description}
            </h4>

            {action.target_url && (
              <p className="text-xs text-slate-400 font-mono mt-1 truncate max-w-md">
                Target: {action.target_url}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              Awaiting Approval
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              status === "approved" || status === "demo_auto_approved"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/15 text-red-300 border border-red-500/30"
            }`}>
              {status === "approved" || status === "demo_auto_approved" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Approved ({decided_by})
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  Rejected ({decided_by})
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Decision Bar / Controls */}
      {isPending && (
        <div className="mt-4 pt-4 border-t border-rose-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-300/80">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Hard blocking pipeline until explicit human consent is given.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
            >
              Reject Action
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve & Execute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
