"use client";

import { useEffect, useState } from "react";
import { 
  Compass, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  TrendingUp,
  Globe2,
  Activity,
  Layers,
  GraduationCap,
  Hotel
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import OpportunityCard from "@/components/OpportunityCard";
import PipelineRunButton from "@/components/PipelineRunButton";
import LearnSourceModal from "@/components/LearnSourceModal";
import { 
  fetchStats, 
  fetchOpportunities, 
  fetchPipelineRuns, 
  updateOpportunityStatus 
} from "@/lib/api";
import { Opportunity, StatsResponse, PipelineRun, OpportunityStatus } from "@/lib/types";

export default function DashboardPage() {
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
        fetchOpportunities({ vertical, limit: 6 }),
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
    // Refresh stats in background
    fetchStats().then(setStats);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome Bar & Vertical Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Autonomous Radar
            </span>
            <span className="text-xs text-slate-400">
              webcmd Explore-Once Pipeline
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Opportunity & Workflow Radar
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vertical Toggle Pills */}
          <div className="bg-[#121422] p-1 rounded-2xl border border-white/10 flex flex-wrap items-center gap-1 shadow-inner">
            <button
              onClick={() => setVertical("student_opportunities")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                vertical === "student_opportunities"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Radar</span>
            </button>
            <button
              onClick={() => setVertical("hotel_price_monitor")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                vertical === "hotel_price_monitor"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />
              <span>Hotel Monitor</span>
            </button>
            <button
              onClick={() => setVertical("github_issues_grants")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                vertical === "github_issues_grants"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GitHub & Grants</span>
            </button>
          </div>

          {/* Learn New Source CTA */}
          <button
            onClick={() => setIsLearnModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Teach Source</span>
          </button>

          {/* Trigger Pipeline Run Button */}
          <PipelineRunButton
            currentVertical={vertical}
            onRunStarted={() => {
              setTimeout(loadData, 1500);
            }}
          />
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Opportunities"
          value={stats?.total || 0}
          subtitle="Monitored across learned sources"
          icon={Compass}
          gradient="bg-indigo-500"
          iconColor="text-indigo-400"
        />
        <StatsCard
          title="Discovered Today"
          value={stats?.new_today || 0}
          subtitle="New items from latest scan"
          icon={Sparkles}
          gradient="bg-emerald-500"
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Closing Soon"
          value={stats?.closing_soon || 0}
          subtitle="Deadlines within 7 days"
          icon={Clock}
          gradient="bg-rose-500"
          iconColor="text-rose-400"
        />
        <StatsCard
          title="Applications Tracked"
          value={stats?.applied || 0}
          subtitle="Across all lifecycle stages"
          icon={CheckCircle2}
          gradient="bg-purple-500"
          iconColor="text-purple-400"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Top Ranked Opportunities Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Top Matched Opportunities ({vertical === "student_opportunities" ? "Student" : "Hotels"})
              </h3>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {opportunities.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 space-y-3">
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

        {/* Right 1 Col: Pipeline Status & Recent Runs Timeline */}
        <div className="space-y-6">
          {/* Engine Architecture Callout */}
          <div className="glass-panel rounded-3xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-transparent space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Generalized Engine Core</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Both verticals run on the <strong>exact same engine</strong>:
              <span className="block font-mono text-[10px] text-indigo-200 mt-1 bg-black/40 p-2 rounded-xl border border-white/5">
                Intent → Plan → webcmd Explore → Normalize → Match → Diff → Gate
              </span>
            </p>
          </div>

          {/* Recent Radar Runs */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Pipeline Execution History
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
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
                        {run.vertical.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        run.status === "success"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : run.status === "running"
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse"
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
