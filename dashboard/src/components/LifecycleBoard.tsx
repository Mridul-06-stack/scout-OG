"use client";

import { Opportunity, OpportunityStatus } from "../lib/types";
import MatchScoreRing from "./MatchScoreRing";
import ChangeTypeBadge from "./ChangeTypeBadge";
import { ExternalLink, ArrowRight, ArrowLeft, Layers } from "lucide-react";

interface LifecycleBoardProps {
  opportunities: Opportunity[];
  onStatusChange: (id: string, newStatus: OpportunityStatus) => Promise<void>;
}

const COLUMNS: { id: OpportunityStatus; title: string; color: string; bg: string; dot: string }[] = [
  { id: "discovered", title: "Discovered", color: "border-slate-500/30 text-slate-300", bg: "from-slate-900/40", dot: "bg-slate-400" },
  { id: "interested", title: "Interested", color: "border-indigo-500/30 text-indigo-300", bg: "from-indigo-950/40", dot: "bg-indigo-400" },
  { id: "applying", title: "Applying", color: "border-amber-500/30 text-amber-300", bg: "from-amber-950/40", dot: "bg-amber-400" },
  { id: "applied", title: "Applied", color: "border-cyan-500/30 text-cyan-300", bg: "from-cyan-950/40", dot: "bg-cyan-400" },
  { id: "selected", title: "Selected", color: "border-emerald-500/30 text-emerald-300", bg: "from-emerald-950/40", dot: "bg-emerald-400" },
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
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colItems = opportunities.filter((o) => o.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col min-w-[270px] bento-card p-4 border border-white/[0.08] bg-gradient-to-b ${col.bg} to-[#0b0d18]/90 shadow-xl`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3.5 mb-3 border-b ${col.color}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-sm`} />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">
                  {col.title}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.08] border border-white/[0.1] text-white">
                {colItems.length}
              </span>
            </div>

            {/* Column Items Scroll Container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {colItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 font-semibold border border-dashed border-white/[0.06] rounded-2xl p-4">
                  Drop items here
                </div>
              ) : (
                colItems.map((opp) => {
                  const next = getNextStatus(opp.status);
                  const prev = getPrevStatus(opp.status);

                  return (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl border border-white/[0.08] hover:border-indigo-500/40 transition-all bg-[#121526]/95 hover:bg-[#161a30] space-y-3 shadow-md hover:shadow-xl group"
                    >
                      {/* Change badge + match score */}
                      <div className="flex items-center justify-between">
                        <ChangeTypeBadge type={opp.change_type} />
                        <MatchScoreRing score={opp.match_score} size="sm" />
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">
                        {opp.title}
                      </h5>

                      {/* Location / Org */}
                      <div className="text-[11px] text-slate-400 font-medium truncate bg-black/30 px-2 py-1 rounded-lg border border-white/[0.04]">
                        {opp.location || opp.raw_fields?.organization || opp.type || "Listing"}
                      </div>

                      {/* Quick Move Navigation Actions */}
                      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-1.5">
                        {prev ? (
                          <button
                            onClick={() => onStatusChange(opp.id, prev)}
                            title={`Move back to ${prev}`}
                            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white text-[10px] flex items-center gap-1 transition-colors border border-white/[0.06]"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        ) : <div />}

                        <a
                          href={opp.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-indigo-300 hover:text-white flex items-center gap-1 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/20 transition-colors"
                        >
                          <span>Visit</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>

                        {next && (
                          <button
                            onClick={() => onStatusChange(opp.id, next)}
                            title={`Promote to ${next}`}
                            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 hover:text-white text-[10px] flex items-center gap-1 font-bold border border-indigo-500/30 shadow-sm transition-all"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
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
