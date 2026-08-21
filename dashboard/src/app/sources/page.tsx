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
      <div className="bento-card p-6 sm:p-8 border border-white/[0.09] bg-gradient-to-r from-[#111326] via-[#161a34] to-[#121428] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>webcmd Registry</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Explore Once · Reuse Forever
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Learned Sources Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Active browser automation workflows cached and validated by the Scout crawler
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={loadSources}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
            title="Refresh Sources"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
          <button
            onClick={() => setIsLearnModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Teach New Source</span>
          </button>
        </div>
      </div>

      {/* ── Metric Bento Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bento-card p-6 border border-white/[0.08] bg-gradient-to-br from-indigo-950/30 to-[#0e1124] flex items-center gap-5 shadow-xl">
          <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <Globe2 className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Learned Sites</p>
            <h4 className="text-3xl font-black text-white font-mono">{sources.length}</h4>
            <p className="text-[11px] text-indigo-300/80 font-medium">Monitored persistently</p>
          </div>
        </div>

        <div className="bento-card p-6 border border-white/[0.08] bg-gradient-to-br from-emerald-950/30 to-[#0e1124] flex items-center gap-5 shadow-xl">
          <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Healthy & Active</p>
            <h4 className="text-3xl font-black text-white font-mono">
              {sources.filter((s) => s.last_run_status === "success").length}
            </h4>
            <p className="text-[11px] text-emerald-300/80 font-medium">Circuit breakers closed</p>
          </div>
        </div>

        <div className="bento-card p-6 border border-white/[0.08] bg-gradient-to-br from-amber-950/30 to-[#0e1124] flex items-center gap-5 shadow-xl">
          <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Needs Review</p>
            <h4 className="text-3xl font-black text-white font-mono">
              {sources.filter((s) => s.last_run_status === "needs_review").length}
            </h4>
            <p className="text-[11px] text-amber-300/80 font-medium">DOM changes detected</p>
          </div>
        </div>
      </div>

      {/* ── Active Workflows Bento Grid List ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>Registered Workflow Automations</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
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
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/40 transition-all hover:bg-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                    <Activity className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-extrabold text-base text-white group-hover:text-indigo-200 transition-colors">
                        {src.source_domain}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.06] text-indigo-300 border border-white/[0.08]">
                        strategy: {src.strategy}
                      </span>
                    </div>

                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span className="truncate max-w-md">{src.source_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="text-slate-300 font-semibold capitalize">Vertical: {src.vertical.replace(/_/g, " ")}</span>
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
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    src.last_run_status === "success"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : src.last_run_status === "needs_review"
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  }`}>
                    {src.last_run_status}
                  </span>

                  <button
                    onClick={() => handleRemove(src.source_domain)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
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
