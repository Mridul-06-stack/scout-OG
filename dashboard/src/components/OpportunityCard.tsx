"use client";

import { useState } from "react";
import { 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Building,
  Sparkles,
  GitBranch,
  Hotel,
  GraduationCap
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

  const statusOptions: { label: string; value: OpportunityStatus; bg: string }[] = [
    { label: "Discovered", value: "discovered", bg: "bg-slate-500/20 text-slate-300" },
    { label: "Interested", value: "interested", bg: "bg-indigo-500/20 text-indigo-300" },
    { label: "Applying", value: "applying", bg: "bg-amber-500/20 text-amber-300" },
    { label: "Applied", value: "applied", bg: "bg-cyan-500/20 text-cyan-300" },
    { label: "Selected", value: "selected", bg: "bg-emerald-500/20 text-emerald-300" },
    { label: "Closed", value: "closed", bg: "bg-rose-500/20 text-rose-300" },
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
  const isGithub = opportunity.vertical === "github_issues_grants";
  const raw = opportunity.raw_fields || {};

  return (
    <div className="bento-card bento-card-interactive p-6 relative group overflow-hidden border border-white/[0.08] hover:border-indigo-500/40">
      {/* Top Ambient Glow Orb */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-indigo-500/20 transition-all duration-500" />

      <div className="flex items-start justify-between gap-5 relative z-10">
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Badges Pill Row */}
          <div className="flex flex-wrap items-center gap-2">
            <ChangeTypeBadge type={opportunity.change_type} />

            {/* Vertical Indicator Pill */}
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
              isHotel 
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30" 
                : isGithub 
                ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
            }`}>
              {isHotel && <Hotel className="w-3 h-3" />}
              {isGithub && <GitBranch className="w-3 h-3" />}
              {!isHotel && !isGithub && <GraduationCap className="w-3 h-3" />}
              <span>{opportunity.type || (isHotel ? "Hotel Stay" : isGithub ? "GitHub Issue" : "Opportunity")}</span>
            </span>

            {raw.organization && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                <Building className="w-3 h-3 text-slate-400" />
                {raw.organization}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight group-hover:text-indigo-200 transition-colors leading-snug">
            {opportunity.title}
          </h4>

          {/* Key Attributes Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
            {opportunity.location && (
              <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{opportunity.location}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isHotel ? `Check-in: ${raw.check_in || "Available"}` : `Deadline: ${deadlineFormatted}`}</span>
            </div>

            {/* Compensation / Price / Bounty */}
            {(raw.stipend || raw.prize || raw.price_per_night || raw.reward_amount) && (
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/25 font-bold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isHotel
                    ? `₹${raw.price_per_night} / night`
                    : raw.stipend || raw.prize || raw.reward_amount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Match Score Indicator */}
        <div className="flex flex-col items-center shrink-0">
          <MatchScoreRing score={opportunity.match_score} size="md" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 font-mono">
            Fit Score
          </span>
        </div>
      </div>

      {/* Tags Chips */}
      {opportunity.tags && opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {opportunity.tags.slice(0, 6).map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1 hover:bg-white/[0.08] transition-colors"
            >
              <Tag className="w-2.5 h-2.5 text-indigo-400" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description Snippet */}
      {raw.description && (
        <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed bg-[#0b0d18]/60 p-3 rounded-2xl border border-white/[0.04] font-medium">
          {raw.description}
        </p>
      )}

      {/* Expandable Raw Metadata Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Extracted Metadata Telemetry</span>
            <span className="font-mono text-indigo-400 text-[10px]">webcmd Real Adapter</span>
          </div>
          <pre className="text-[11px] font-mono text-indigo-200/90 bg-[#080914] p-3.5 rounded-2xl overflow-x-auto border border-white/[0.06] max-h-48">
            {JSON.stringify(opportunity.raw_fields, null, 2)}
          </pre>
        </div>
      )}

      {/* Card Footer Actions & Lifecycle Control */}
      <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Stage:</span>
          <select
            value={opportunity.status}
            onChange={(e) => handleStatusChange(e.target.value as OpportunityStatus)}
            disabled={isUpdating}
            className="bg-[#121526] border border-white/[0.12] rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle raw details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-white/[0.08]"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all"
          >
            <span>Visit Listing</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
