"use client";

import { Sparkles, RefreshCw, Clock, Check, Trash2 } from "lucide-react";
import { ChangeType } from "../lib/types";

interface ChangeTypeBadgeProps {
  type: ChangeType;
}

export default function ChangeTypeBadge({ type }: ChangeTypeBadgeProps) {
  switch (type) {
    case "new":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>New Today</span>
        </span>
      );
    case "closing_soon":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 pulse-urgent">
          <Clock className="w-3 h-3 text-rose-400" />
          <span>Closing Soon</span>
        </span>
      );
    case "updated":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <RefreshCw className="w-3 h-3 text-amber-400" />
          <span>Updated</span>
        </span>
      );
    case "removed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <Trash2 className="w-3 h-3" />
          <span>Archived</span>
        </span>
      );
    case "unchanged":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-slate-400 border border-white/10">
          <Check className="w-3 h-3 text-slate-500" />
          <span>Unchanged</span>
        </span>
      );
  }
}
