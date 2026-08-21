"use client";

import { Opportunity, OpportunityStatus } from "../lib/types";
import MatchScoreRing from "./MatchScoreRing";
import ChangeTypeBadge from "./ChangeTypeBadge";
import { ExternalLink, ArrowRight, ArrowLeft } from "lucide-react";

interface LifecycleBoardProps {
  opportunities: Opportunity[];
  onStatusChange: (id: string, newStatus: OpportunityStatus) => Promise<void>;
}

const COLUMNS: { id: OpportunityStatus; title: string; color: string }[] = [
  { id: "discovered", title: "Discovered", color: "border-slate-500/30 text-slate-300" },
  { id: "interested", title: "Interested", color: "border-indigo-500/30 text-indigo-300" },
  { id: "applying", title: "Applying", color: "border-amber-500/30 text-amber-300" },
  { id: "applied", title: "Applied", color: "border-cyan-500/30 text-cyan-300" },
  { id: "selected", title: "Selected", color: "border-emerald-500/30 text-emerald-300" },
];

export default function LifecycleBoard({
  opportunities,
  onStatusChange,
}: LifecycleBoardProps) {
  const getNextStatus = (current: OpportunityStatus): OpportunityStatus | null => {
    const sequence: OpportunityStatus[] = ["discovered", "interested", "applying", "applied", "selected"];
    const idx = sequence.indexOf(current);
    return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  const getPrevStatus = (current: OpportunityStatus): OpportunityStatus | null => {
    const sequence: OpportunityStatus[] = ["discovered", "interested", "applying", "applied", "selected"];
    const idx = sequence.indexOf(current);
    return idx > 0 ? sequence[idx - 1] : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colItems = opportunities.filter((o) => o.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col min-w-[260px] glass-panel rounded-2xl p-3 border border-white/5 bg-[#0e101c]/70"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${col.color}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                {col.title}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-white">
                {colItems.length}
              </span>
            </div>

            {/* Column Items */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {colItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-600 font-medium">
                  No items in {col.title.toLowerCase()}
                </div>
              ) : (
                colItems.map((opp) => {
                  const next = getNextStatus(opp.status);
                  const prev = getPrevStatus(opp.status);

                  return (
                    <div
                      key={opp.id}
                      className="glass-panel p-3.5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all bg-[#121422]/90 space-y-2.5 group"
                    >
                      {/* Change badge + match score */}
                      <div className="flex items-center justify-between">
                        <ChangeTypeBadge type={opp.change_type} />
                        <MatchScoreRing score={opp.match_score} size="sm" />
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {opp.title}
                      </h5>

                      {/* Location / Org */}
                      <div className="text-[11px] text-slate-400 truncate">
                        {opp.location || opp.raw_fields?.organization || opp.type}
                      </div>

                      {/* Quick Move Navigation */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                        {prev ? (
                          <button
                            onClick={() => onStatusChange(opp.id, prev)}
                            title={`Move back to ${prev}`}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] flex items-center gap-0.5"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        ) : <div />}

                        <a
                          href={opp.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>

                        {next && (
                          <button
                            onClick={() => onStatusChange(opp.id, next)}
                            title={`Promote to ${next}`}
                            className="p-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-[10px] flex items-center gap-0.5 font-semibold"
                          >
                            <span>Move</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
