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
  Plus
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              webcmd Registry
            </span>
            <span className="text-xs text-slate-400">
              Explore-Once · Reuse-Forever Workflows
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Learned Sources Registry
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSources}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh Sources"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsLearnModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Teach New Source</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Learned Sites</p>
            <h4 className="text-2xl font-black text-white font-mono">{sources.length}</h4>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Active & Healthy</p>
            <h4 className="text-2xl font-black text-white font-mono">
              {sources.filter((s) => s.last_run_status === "success").length}
            </h4>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Needs Review (Circuit Breaker)</p>
            <h4 className="text-2xl font-black text-white font-mono">
              {sources.filter((s) => s.last_run_status === "needs_review").length}
            </h4>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Active Extraction Workflows
        </h3>

        {sources.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No sources registered yet. Run the pipeline or click &ldquo;Teach New Source&rdquo;.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="py-4 flex flex-wrap items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-indigo-400 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {src.source_domain}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10">
                        {src.strategy}
                      </span>
                    </div>

                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>{src.source_url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                      <span>Vertical: {src.vertical}</span>
                      <span>•</span>
                      <span>Schema: {src.extraction_schema_ref}</span>
                      {src.last_run_at && (
                        <>
                          <span>•</span>
                          <span>Last run: {new Date(src.last_run_at).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
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
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
