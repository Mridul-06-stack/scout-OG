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
  { id: "discovered", title: "Discovered", color: "border-slate-300 text-slate-700", bg: "from-slate-100/80", dot: "bg-slate-500" },
  { id: "interested", title: "Interested", color: "border-indigo-300 text-indigo-800", bg: "from-indigo-50/80", dot: "bg-indigo-500" },
  { id: "applying", title: "Applying", color: "border-amber-300 text-amber-800", bg: "from-amber-50/80", dot: "bg-amber-500" },
  { id: "applied", title: "Applied", color: "border-sky-300 text-sky-800", bg: "from-sky-50/80", dot: "bg-sky-500" },
  { id: "selected", title: "Selected", color: "border-emerald-300 text-emerald-800", bg: "from-emerald-50/80", dot: "bg-emerald-500" },
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
            className={`flex flex-col min-w-[270px] bento-card p-4 border border-slate-200 bg-gradient-to-b ${col.bg} to-white shadow-sm`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3.5 mb-3 border-b ${col.color}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-sm`} />
                <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono">
                  {col.title}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700 shadow-sm">
                {colItems.length}
              </span>
            </div>

            {/* Column Items Scroll Container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {colItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl p-4">
                  Drop items here
                </div>
              ) : (
                colItems.map((opp) => {
                  const next = getNextStatus(opp.status);
                  const prev = getPrevStatus(opp.status);

                  return (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all bg-white hover:bg-slate-50/80 space-y-3 shadow-sm hover:shadow-md group"
                    >
                      {/* Change badge + match score */}
                      <div className="flex items-center justify-between">
                        <ChangeTypeBadge type={opp.change_type} />
                        <MatchScoreRing score={opp.match_score} size="sm" />
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors font-display">
                        {opp.title}
                      </h5>

                      {/* Location / Org */}
                      <div className="text-[11px] text-slate-600 font-medium truncate bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 font-mono">
                        {opp.location || opp.raw_fields?.organization || opp.type || "Listing"}
                      </div>

                      {/* Quick Move Navigation Actions */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        {prev ? (
                          <button
                            onClick={() => onStatusChange(opp.id, prev)}
                            title={`Move back to ${prev}`}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-[10px] flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        ) : <div />}

                        <a
                          href={opp.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-bold bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <span>Visit</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>

                        {next && (
                          <button
                            onClick={() => onStatusChange(opp.id, next)}
                            title={`Promote to ${next}`}
                            className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] flex items-center gap-1 font-bold border border-indigo-200 shadow-sm transition-all cursor-pointer"
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
