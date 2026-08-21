"use client";

import { useState } from "react";
import { 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  DollarSign,
  Building,
  ShieldCheck
} from "lucide-react";
import { Opportunity, OpportunityStatus } from "../lib/types";
import MatchScoreRing from "./MatchScoreRing";
import ChangeTypeBadge from "./ChangeTypeBadge";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStatusChange?: (id: string, newStatus: OpportunityStatus) => Promise<void>;
}

export default function OpportunityCard({
  opportunity,
  onStatusChange,
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions: { label: string; value: OpportunityStatus; color: string }[] = [
    { label: "Discovered", value: "discovered", color: "text-slate-400" },
    { label: "Interested", value: "interested", color: "text-indigo-400" },
    { label: "Applying", value: "applying", color: "text-amber-400" },
    { label: "Applied", value: "applied", color: "text-cyan-400" },
    { label: "Selected", value: "selected", color: "text-emerald-400" },
    { label: "Closed", value: "closed", color: "text-rose-400" },
  ];

  const handleStatusChange = async (newStatus: OpportunityStatus) => {
    if (!onStatusChange || isUpdating) return;
    setIsUpdating(true);
    try {
      await onStatusChange(opportunity.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const deadlineFormatted = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No set deadline";

  const isHotel = opportunity.vertical === "hotel_price_monitor";
  const raw = opportunity.raw_fields || {};

  return (
    <div className="glass-panel glass-panel-interactive rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ChangeTypeBadge type={opportunity.change_type} />
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
              {opportunity.type || (isHotel ? "hotel" : "opportunity")}
            </span>
            {raw.organization && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Building className="w-3 h-3 text-slate-500" />
                {raw.organization}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-lg font-bold text-white tracking-tight hover:text-indigo-300 transition-colors">
            {opportunity.title}
          </h4>

          {/* Key Attributes Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
            {opportunity.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400/80" />
                <span>{opportunity.location}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400/80" />
              <span>{isHotel ? `Check-in: ${raw.check_in || "Available"}` : `Deadline: ${deadlineFormatted}`}</span>
            </div>

            {/* Compensation / Price */}
            {(raw.stipend || raw.prize || raw.price_per_night) && (
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                <span>
                  {isHotel
                    ? `₹${raw.price_per_night} / night`
                    : raw.stipend || raw.prize}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Match Score Indicator */}
        <div className="flex flex-col items-center">
          <MatchScoreRing score={opportunity.match_score} size="md" />
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
            Fit Score
          </span>
        </div>
      </div>

      {/* Tags List */}
      {opportunity.tags && opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {opportunity.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg text-[11px] bg-white/[0.04] text-slate-300 border border-white/5 flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 text-slate-500" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description Snippet */}
      {raw.description && (
        <p className="text-xs text-slate-400/90 mt-3 line-clamp-2 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/[0.03]">
          {raw.description}
        </p>
      )}

      {/* Expandable Raw Fields Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Raw Extracted Metadata (webcmd Normalizer)
          </p>
          <pre className="text-[11px] font-mono text-indigo-200/80 bg-black/40 p-3 rounded-xl overflow-x-auto border border-white/5">
            {JSON.stringify(opportunity.raw_fields, null, 2)}
          </pre>
        </div>
      )}

      {/* Card Footer Actions & Lifecycle Control */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Lifecycle:</span>
          <select
            value={opportunity.status}
            onChange={(e) => handleStatusChange(e.target.value as OpportunityStatus)}
            disabled={isUpdating}
            className="bg-[#121422] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle raw details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide Meta</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Inspect Meta</span>
              </>
            )}
          </button>

          {/* External Source Link */}
          <a
            href={opportunity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
          >
            <span>Visit Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
