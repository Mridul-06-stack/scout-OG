"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Compass, 
  Activity, 
  Layers, 
  Globe2,
  RefreshCw,
  GraduationCap,
  Hotel,
  GitBranch,
  Radio,
  Search,
  Zap,
  ArrowRight
} from "lucide-react";
import { Opportunity, OpportunityStatus, PipelineRun, StatsResponse } from "@/lib/types";
import { fetchOpportunities, fetchPipelineRuns, fetchStats, updateOpportunityStatus } from "@/lib/api";
import OpportunityCard from "@/components/OpportunityCard";
import StatsCard from "@/components/StatsCard";
import PipelineRunButton from "@/components/PipelineRunButton";
import LearnSourceModal from "@/components/LearnSourceModal";
import Link from "next/link";

export default function OverviewPage() {
  const [vertical, setVertical] = useState<string>("student_opportunities");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, oppsData, runsData] = await Promise.all([
        fetchStats(),
        fetchOpportunities({ vertical, limit: 8, search: searchQuery || undefined }),
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
  }, [vertical, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    await updateOpportunityStatus(id, newStatus);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    fetchStats().then(setStats);
  };

  const getVerticalTitle = () => {
    if (vertical === "hotel_price_monitor") return "Hotel & Stay Monitor";
    if (vertical === "github_issues_grants") return "GitHub Issues & Grants Radar";
    return "Student Hackathon & Internship Radar";
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Top Hero Bento Bar ── */}
      <div className="bento-card p-6 sm:p-8 bg-gradient-to-r from-[#111328]/90 via-[#151834]/80 to-[#1e1438]/90 border border-white/[0.09] shadow-2xl relative overflow-hidden">
        {/* Ambient Gradient Mesh Spheres */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-gradient-to-bl from-indigo-500/20 via-purple-500/15 to-pink-500/0 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Autonomous Radar Live</span>
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>webcmd Explore-Once Architecture</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Opportunity & Workflow Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Discovers, evaluates with OpenAI <code className="text-indigo-300 font-mono">gpt-4o-mini</code>, and executes browser actions with human approval.
            </p>
          </div>

          {/* Action & Vertical Switcher Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Teach Source Button */}
            <button
              onClick={() => setIsLearnModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02]"
            >
              <Globe2 className="w-4 h-4 text-indigo-400" />
              <span>Teach Source</span>
            </button>

            {/* Run Radar Action Button */}
            <PipelineRunButton
              currentVertical={vertical}
              onRunStarted={() => {
                setTimeout(loadData, 1500);
              }}
            />
          </div>
        </div>

        {/* Vertical Switcher Pill Tabs */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Active Vertical:
          </span>

          <div className="bg-[#0b0d1a]/80 p-1 rounded-2xl border border-white/[0.08] flex flex-wrap items-center gap-1.5 shadow-inner">
            <button
              onClick={() => setVertical("student_opportunities")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                vertical === "student_opportunities"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Radar</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-black/30 font-mono">
                {stats?.by_vertical?.student_opportunities || 0}
              </span>
            </button>

            <button
              onClick={() => setVertical("hotel_price_monitor")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                vertical === "hotel_price_monitor"
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Hotel Monitor</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-black/30 font-mono">
                {stats?.by_vertical?.hotel_price_monitor || 0}
              </span>
            </button>

            <button
              onClick={() => setVertical("github_issues_grants")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                vertical === "github_issues_grants"
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>GitHub & Grants</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-black/30 font-mono">
                {stats?.by_vertical?.github_issues_grants || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Bento Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Monitored Items"
          value={stats?.total || 0}
          subtitle="Opportunities stored across learned sources"
          icon={Compass}
          gradient="bg-indigo-500"
          iconColor="text-indigo-400"
          trend="Multi-Source"
        />
        <StatsCard
          title="Discovered Today"
          value={stats?.new_today || 0}
          subtitle="New items extracted from latest scan"
          icon={Sparkles}
          gradient="bg-emerald-500"
          iconColor="text-emerald-400"
          trend="New"
        />
        <StatsCard
          title="Closing Soon"
          value={stats?.closing_soon || 0}
          subtitle="Deadlines within 7 days"
          icon={Clock}
          gradient="bg-rose-500"
          iconColor="text-rose-400"
          trend="Urgent"
        />
        <StatsCard
          title="Lifecycle Tracked"
          value={stats?.applied || 0}
          subtitle="Active applications & bookings"
          icon={CheckCircle2}
          gradient="bg-purple-500"
          iconColor="text-purple-400"
          trend="Kanban"
        />
      </div>

      {/* ── Main Two-Column Bento Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Top Ranked Opportunities Feed Bento */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {getVerticalTitle()}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Ranked by personalized match score & AI relevance
                </p>
              </div>
            </div>

            {/* Quick Search & Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#121526] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans shadow-inner w-36 sm:w-48"
                />
              </div>

              <button
                onClick={loadData}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                title="Refresh Feed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="bento-card p-14 text-center border border-white/[0.08] space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Compass className="w-8 h-8 text-indigo-400 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-white">No Opportunities Discovered Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                  Hit <strong className="text-indigo-300">&ldquo;Run Radar Now&rdquo;</strong> above to execute the real webcmd extraction pipeline on live seed sources.
                </p>
              </div>
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

          {/* View All CTA Link */}
          {opportunities.length > 0 && (
            <div className="pt-2 text-center">
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-indigo-300 hover:text-white text-xs font-bold border border-white/[0.08] transition-all hover:scale-105"
              >
                <span>View Full Kanban Lifecycle Board</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right 1 Col: Engine Telemetry & History Bento */}
        <div className="space-y-6">
          {/* Architecture Callout Bento */}
          <div className="bento-card p-6 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#0e1022] border border-indigo-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Unified Generalized Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              All 3 verticals execute on the exact same zero-pipeline-code core:
            </p>
            <div className="font-mono text-[10px] text-indigo-200 bg-[#080914] p-3 rounded-2xl border border-white/[0.08] space-y-1 shadow-inner">
              <div className="text-emerald-400">1. Intent → gpt-4o-mini Plan</div>
              <div className="text-indigo-300">2. webcmd Stealth Exploration</div>
              <div className="text-purple-300">3. Schema Normalizer & Diff</div>
              <div className="text-cyan-300">4. Semantic Matcher & Ranker</div>
              <div className="text-rose-300">5. Human Approval Gate</div>
            </div>
          </div>

          {/* Real-time Pipeline Execution Telemetry Bento */}
          <div className="bento-card p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Pipeline Execution History
              </h4>
              <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Live
              </span>
            </div>

            {recentRuns.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-medium">
                No runs recorded yet in SQLite database
              </p>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-white capitalize">
                        {run.vertical.replace(/_/g, " ")}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
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
                      <p className="text-[11px] text-slate-400 italic truncate font-medium">
                        &ldquo;{run.intent}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-white/[0.04]">
                      <span className="text-indigo-300 font-semibold">{run.records_found} items ({run.new_records} new)</span>
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
