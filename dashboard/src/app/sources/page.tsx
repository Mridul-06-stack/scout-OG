"use client";

import { useEffect, useState } from "react";
import { 
  Globe2, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  ExternalLink,
  Plus,
  ShieldCheck,
  Zap,
  Code
} from "lucide-react";
import LearnSourceModal from "@/components/LearnSourceModal";
import { fetchSources, removeSource } from "@/lib/api";
import { LearnedWorkflow } from "@/lib/types";

export default function SourcesPage() {
  const [sources, setSources] = useState<LearnedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await fetchSources();
      setSources(data.items);
    } catch (err) {
      console.error("Failed to load sources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleRemove = async (domain: string) => {
    if (!confirm(`Are you sure you want to remove ${domain} from learned sources?`)) return;
    await removeSource(domain);
    setSources((prev) => prev.filter((s) => s.source_domain !== domain));
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/50 to-purple-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 font-mono">
              <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>webcmd Registry</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Explore Once · Reuse Forever
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            Learned Sources Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Active browser automation workflows cached and validated by the Scout crawler
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={loadSources}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-sm cursor-pointer"
            title="Refresh Sources"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
          <button
            onClick={() => setIsLearnModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Teach New Source</span>
          </button>
        </div>
      </div>

      {/* ── Metric Bento Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bento-card p-6 border border-slate-200 bg-white/95 flex items-center gap-5 shadow-sm">
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm">
            <Globe2 className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Learned Sites</p>
            <h4 className="text-3xl font-black text-slate-900 font-display">{sources.length}</h4>
            <p className="text-[11px] text-indigo-700 font-medium">Monitored persistently</p>
          </div>
        </div>

        <div className="bento-card p-6 border border-slate-200 bg-white/95 flex items-center gap-5 shadow-sm">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Healthy & Active</p>
            <h4 className="text-3xl font-black text-slate-900 font-display">
              {sources.filter((s) => s.last_run_status === "success").length}
            </h4>
            <p className="text-[11px] text-emerald-700 font-medium">Circuit breakers closed</p>
          </div>
        </div>

        <div className="bento-card p-6 border border-slate-200 bg-white/95 flex items-center gap-5 shadow-sm">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Needs Review</p>
            <h4 className="text-3xl font-black text-slate-900 font-display">
              {sources.filter((s) => s.last_run_status === "needs_review").length}
            </h4>
            <p className="text-[11px] text-amber-700 font-medium">DOM changes detected</p>
          </div>
        </div>
      </div>

      {/* ── Active Workflows Bento Grid List ── */}
      <div className="bento-card p-6 sm:p-8 border border-slate-200 bg-white/95 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 font-display">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span>Registered Workflow Automations</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {sources.length} Active
          </span>
        </div>

        {sources.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500 font-medium">
            No sources registered yet. Click &ldquo;Teach New Source&rdquo; to add a live website.
          </div>
        ) : (
          <div className="space-y-3.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 transition-all hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 group-hover:scale-105 transition-transform shrink-0 mt-0.5 shadow-sm">
                    <Activity className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors font-display">
                        {src.source_domain}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        strategy: {src.strategy}
                      </span>
                    </div>

                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-indigo-600 font-mono inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span className="truncate max-w-md">{src.source_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span className="text-slate-700 font-semibold capitalize">Vertical: {src.vertical.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>Schema: {src.extraction_schema_ref}</span>
                      {src.last_run_at && (
                        <>
                          <span>•</span>
                          <span>Last scanned: {new Date(src.last_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    src.last_run_status === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : src.last_run_status === "needs_review"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}>
                    {src.last_run_status}
                  </span>

                  <button
                    onClick={() => handleRemove(src.source_domain)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                    title="Remove Source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learn Source Modal */}
      <LearnSourceModal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        onSuccess={() => {
          setIsLearnModalOpen(false);
          loadSources();
        }}
      />
    </div>
  );
}
