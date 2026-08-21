"use client";

import { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  Globe2,
  Tag,
  Building,
  DollarSign
} from "lucide-react";
import { Opportunity, OpportunityStatus } from "@/lib/types";
import MatchScoreRing from "./MatchScoreRing";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStatusChange?: (id: string, status: OpportunityStatus) => void;
}

export default function OpportunityCard({
  opportunity,
  onStatusChange,
}: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getChangeBadge = () => {
    switch (opportunity.change_type) {
      case "new":
        return {
          label: "✨ New Today",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          barColor: "bg-emerald-500 shadow-emerald-500/50",
        };
      case "closing_soon":
        return {
          label: "⏰ Closing Soon",
          color: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          barColor: "bg-rose-500 shadow-rose-500/50",
        };
      case "updated":
        return {
          label: "🔄 Updated",
          color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          barColor: "bg-amber-500 shadow-amber-500/50",
        };
      default:
        return {
          label: "✓ Active",
          color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          barColor: "bg-indigo-500/50",
        };
    }
  };

  const badge = getChangeBadge();

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "web source";
    }
  };

  const domain = getDomain(opportunity.source_url);

  return (
    <div className="bento-card p-5 sm:p-6 group relative overflow-hidden transition-all duration-300 hover:border-indigo-500/40">
      {/* Left Vertical Status Bar Accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${badge.barColor} shadow-md`} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pl-2">
        {/* Main Content Area */}
        <div className="space-y-3 flex-1 min-w-0">
          {/* Top Metadata Row: Badges & Source Domain */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono ${badge.color}`}>
              {badge.label}
            </span>

            {opportunity.type && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/[0.04] text-slate-300 border border-white/[0.08] font-mono">
                {opportunity.type}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 bg-white/[0.02] border border-white/[0.05] flex items-center gap-1 font-mono">
              <Globe2 className="w-3 h-3 text-slate-400" />
              {domain}
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-200 transition-colors leading-snug font-display line-clamp-2">
              {opportunity.title}
            </h4>
            {opportunity.raw_fields?.description && (
              <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed">
                {opportunity.raw_fields.description}
              </p>
            )}
          </div>

          {/* Tags & Key Attributes */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {opportunity.tags?.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono"
              >
                #{tag}
              </span>
            ))}

            {opportunity.location && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {opportunity.location}
              </span>
            )}

            {opportunity.deadline && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium text-rose-300 flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-rose-400" />
                {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Match Score Ring & Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          {/* Match Score Ring */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                Fit Score
              </span>
              <span className="text-xs font-bold text-indigo-300">
                {opportunity.match_score >= 0.7 ? "High Match" : opportunity.match_score >= 0.4 ? "Good Fit" : "Base Fit"}
              </span>
            </div>
            <MatchScoreRing score={opportunity.match_score} size="md" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={opportunity.source_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/[0.08] transition-all hover:scale-105"
              title="Open Source Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/[0.08] transition-all"
              title="Toggle Live Telemetry"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Live Telemetry & Raw Fields Drawer */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Live Extracted Record & Schema
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {opportunity.id.slice(0, 8)}...
            </span>
          </div>

          <pre className="p-4 rounded-2xl bg-[#070914] border border-white/[0.06] text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48 shadow-inner">
            {JSON.stringify(opportunity.raw_fields, null, 2)}
          </pre>

          {/* Stage Quick Advancement Pills */}
          {onStatusChange && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono mr-1">
                Move Stage:
              </span>
              {(["discovered", "interested", "applying", "applied", "selected"] as OpportunityStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange(opportunity.id, st)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    opportunity.status === st
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.05]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
