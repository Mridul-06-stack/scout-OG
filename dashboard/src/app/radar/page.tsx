"use client";

import { useEffect, useState } from "react";
import { 
  Compass, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  GraduationCap, 
  Hotel, 
  Globe2, 
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Search,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import OpportunityCard from "@/components/OpportunityCard";
import PipelineRunButton from "@/components/PipelineRunButton";
import LearnSourceModal from "@/components/LearnSourceModal";
import { fetchOpportunities, fetchStats, fetchPipelineRuns, updateOpportunityStatus } from "@/lib/api";
import type { Opportunity, StatsResponse, PipelineRun, OpportunityStatus } from "@/lib/types";

export default function RadarPage() {
  const [vertical, setVertical] = useState<string>("student_opportunities");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, oppsData, runsData] = await Promise.all([
        fetchStats(),
        fetchOpportunities({ vertical, limit: 12 }),
        fetchPipelineRuns(5),
      ]);
      setStats(statsData);
      setOpportunities(oppsData.items);
      setRecentRuns(runsData.items);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vertical]);

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    await updateOpportunityStatus(id, newStatus);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    fetchStats().then(setStats);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Header & Vertical Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse" />
              LIVE RADAR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              webcmd Autonomous Radar Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Opportunity & Workflow Control Center
          </h1>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vertical Toggle Pills */}
          <div className="bg-[#0b0d17] p-1 rounded-2xl border border-white/10 flex flex-wrap items-center gap-1 shadow-inner">
            <button
              onClick={() => setVertical("student_opportunities")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                vertical === "student_opportunities"
                  ? "bg-gradient-to-r from-[#00f5d4] to-[#00bbf9] text-black font-black shadow-lg shadow-[#00f5d4]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Radar</span>
            </button>
            <button
              onClick={() => setVertical("hotel_price_monitor")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                vertical === "hotel_price_monitor"
                  ? "bg-gradient-to-r from-[#00f5d4] to-[#00bbf9] text-black font-black shadow-lg shadow-[#00f5d4]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />
              <span>Hotel Monitor</span>
            </button>
            <button
              onClick={() => setVertical("github_issues_grants")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                vertical === "github_issues_grants"
                  ? "bg-gradient-to-r from-[#00f5d4] to-[#00bbf9] text-black font-black shadow-lg shadow-[#00f5d4]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GitHub & Grants</span>
            </button>
          </div>

          {/* Learn New Source CTA */}
          <button
            onClick={() => setIsLearnModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#00f5d4]" />
            <span>Teach Source</span>
          </button>

          {/* Trigger Pipeline Run Button */}
          <PipelineRunButton
            currentVertical={vertical}
            onRunStarted={() => {
              setTimeout(loadData, 2000);
            }}
          />
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Monitored"
          value={stats?.total || 0}
          subtitle="Across 3 live verticals"
          icon={Compass}
          gradient="bg-gradient-to-br from-[#00f5d4] to-[#00bbf9]"
          iconColor="text-[#00f5d4]"
        />
        <StatsCard
          title="Discovered Today"
          value={stats?.new_today || 0}
          subtitle="New items from latest scan"
          icon={Sparkles}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Closing Soon"
          value={stats?.closing_soon || 0}
          subtitle="Deadlines within 7 days"
          icon={Clock}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          iconColor="text-rose-400"
        />
        <StatsCard
          title="Tracked Applications"
          value={stats?.applied || 0}
          subtitle="Across all lifecycle stages"
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          iconColor="text-purple-400"
        />
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Top Ranked Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00f5d4]" />
              <h2 className="text-base font-bold text-white tracking-tight capitalize">
                {vertical.replace(/_/g, " ")} Feed ({opportunities.length} Loaded)
              </h2>
            </div>
            <button
              onClick={loadData}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors border border-white/5"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00f5d4]" : ""}`} />
            </button>
          </div>

          {opportunities.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 space-y-4">
              <Compass className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">No Opportunities Discovered Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hit &ldquo;Run Radar Now&rdquo; above to let the webcmd pipeline explore seed sources and populate your radar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Execution Timeline & Architecture */}
        <div className="space-y-6">
          {/* Architecture Banner */}
          <div className="glass-panel rounded-3xl p-5 border border-[#00f5d4]/20 bg-gradient-to-br from-[#00f5d4]/5 via-transparent to-purple-900/10 space-y-3">
            <div className="flex items-center gap-2 text-[#00f5d4] font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Zero-Pipeline-Code Engine</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All 3 verticals run on the <strong>exact same autonomous pipeline</strong>:
              <span className="block font-mono text-[10px] text-cyan-200 mt-2 bg-black/60 p-2.5 rounded-xl border border-white/5">
                Intent → Plan → webcmd Explore → Normalize → Match → Diff → Gate
              </span>
            </p>
          </div>

          {/* Recent Runs Timeline */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00f5d4]" />
                Radar Execution History
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">SQLite Persistent</span>
            </div>

            {recentRuns.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No runs executed yet</p>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white capitalize">
                        {run.vertical.replace(/_/g, " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        run.status === "success"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : run.status === "running"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}>
                        {run.status}
                      </span>
                    </div>

                    {run.intent && (
                      <p className="text-[11px] text-slate-400 italic truncate">
                        &ldquo;{run.intent}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>{run.records_found} items ({run.new_records} new)</span>
                      <span>{new Date(run.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learn Source Modal */}
      <LearnSourceModal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        onSuccess={() => {
          setIsLearnModalOpen(false);
          loadData();
        }}
        defaultVertical={vertical}
      />
    </div>
  );
}
