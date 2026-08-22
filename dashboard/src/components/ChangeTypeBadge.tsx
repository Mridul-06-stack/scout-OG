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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>New Today</span>
        </span>
      );
    case "closing_soon":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <Clock className="w-3 h-3 text-rose-600" />
          <span>Closing Soon</span>
        </span>
      );
    case "updated":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <RefreshCw className="w-3 h-3 text-amber-600" />
          <span>Updated</span>
        </span>
      );
    case "removed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">
          <Trash2 className="w-3 h-3 text-red-600" />
          <span>Archived</span>
        </span>
      );
    case "unchanged":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Check className="w-3 h-3 text-slate-500" />
          <span>Unchanged</span>
        </span>
      );
  }
}
