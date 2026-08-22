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
  ArrowRight,
  Plus,
  SlidersHorizontal
} from "lucide-react";
import { Opportunity, OpportunityStatus, PipelineRun, StatsResponse, VerticalInfo } from "@/lib/types";
import { fetchOpportunities, fetchPipelineRuns, fetchStats, fetchVerticals, updateOpportunityStatus } from "@/lib/api";
import OpportunityCard from "@/components/OpportunityCard";
import StatsCard from "@/components/StatsCard";
import PipelineRunButton from "@/components/PipelineRunButton";
import LearnSourceModal from "@/components/LearnSourceModal";
import CreateVerticalModal from "@/components/CreateVerticalModal";
import Link from "next/link";

export default function OverviewPage() {
  const [verticals, setVerticals] = useState<VerticalInfo[]>([]);
  const [vertical, setVertical] = useState<string>("student_opportunities");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadVerticalsList = async () => {
    try {
      const data = await fetchVerticals();
      setVerticals(data.items);
    } catch (err) {
      console.error("Failed to load verticals:", err);
    }
  };

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
    loadVerticalsList();
  }, []);

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
    const matched = verticals.find((v) => v.id === vertical);
    if (matched) return matched.name;
    if (vertical === "hotel_price_monitor") return "Hotel & Stay Monitor";
    if (vertical === "github_issues_grants") return "GitHub Issues & Grants Radar";
    return "Student Hackathon & Internship Radar";
  };

  const renderVerticalIcon = (vertId: string) => {
    if (vertId === "student_opportunities") return <GraduationCap className="w-4 h-4" />;
    if (vertId === "hotel_price_monitor") return <Hotel className="w-4 h-4" />;
    if (vertId === "github_issues_grants") return <GitBranch className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Top Hero Bento Bar ── */}
      <div className="bento-card p-6 sm:p-8 bg-gradient-to-r from-white via-indigo-50/50 to-purple-50/50 border border-slate-200/90 shadow-sm relative overflow-hidden">
        {/* Ambient Gradient Mesh Spheres */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-gradient-to-bl from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 shadow-sm font-mono">
                <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>Autonomous Radar Live</span>
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1 font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>webcmd Explore-Once Architecture</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight font-display">
              Opportunity & Workflow Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Discovers, evaluates with OpenAI <code className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono font-bold">gpt-4o-mini</code>, and executes browser actions with human approval.
            </p>
          </div>

          {/* Action & Vertical Switcher Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Create Custom Radar Studio CTA */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>+ Custom Radar</span>
            </button>

            {/* Teach Source Button */}
            <button
              onClick={() => setIsLearnModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-indigo-600" />
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

        {/* Dynamic Vertical Switcher Pill Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 font-mono">
            Active Radar:
          </span>

          <div className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1.5 shadow-inner">
            {verticals.length > 0 ? (
              verticals.map((v) => {
                const isActive = vertical === v.id;
                const count = stats?.by_vertical?.[v.id] || 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVertical(v.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                    }`}
                  >
                    {renderVerticalIcon(v.id)}
                    <span>{v.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })
            ) : (
              /* Default Fallback Pills */
              <>
                <button
                  onClick={() => setVertical("student_opportunities")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    vertical === "student_opportunities"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Radar</span>
                </button>
                <button
                  onClick={() => setVertical("hotel_price_monitor")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    vertical === "hotel_price_monitor"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Hotel className="w-4 h-4" />
                  <span>Hotel Monitor</span>
                </button>
                <button
                  onClick={() => setVertical("github_issues_grants")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    vertical === "github_issues_grants"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  <span>GitHub & Grants</span>
                </button>
              </>
            )}

            {/* Quick Add Custom Vertical Pill */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border border-dashed border-indigo-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Workflow</span>
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
          iconColor="text-indigo-600"
          trend="Multi-Source"
        />
        <StatsCard
          title="Discovered Today"
          value={stats?.new_today || 0}
          subtitle="New items extracted from latest scan"
          icon={Sparkles}
          gradient="bg-emerald-500"
          iconColor="text-emerald-600"
          trend="New"
        />
        <StatsCard
          title="Closing Soon"
          value={stats?.closing_soon || 0}
          subtitle="Deadlines within 7 days"
          icon={Clock}
          gradient="bg-rose-500"
          iconColor="text-rose-600"
          trend="Urgent"
        />
        <StatsCard
          title="Lifecycle Tracked"
          value={stats?.applied || 0}
          subtitle="Active applications & bookings"
          icon={CheckCircle2}
          gradient="bg-purple-500"
          iconColor="text-purple-600"
          trend="Kanban"
        />
      </div>

      {/* ── Main Two-Column Bento Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Top Ranked Opportunities Feed Bento */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  {getVerticalTitle()}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
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
                  className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans shadow-sm w-36 sm:w-48"
                />
              </div>

              <button
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm cursor-pointer"
                title="Refresh Feed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
              </button>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="bento-card p-14 text-center border border-slate-200 bg-white/90 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto shadow-inner">
                <Compass className="w-8 h-8 text-indigo-600 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900 font-display">No Listings Discovered Yet for this Radar</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Hit <strong className="text-indigo-600">&ldquo;Run Radar Now&rdquo;</strong> above to explore target sources and populate your custom feed.
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-slate-200 transition-all hover:scale-105 shadow-sm"
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
          <div className="bento-card p-6 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white border border-indigo-200/80 space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase tracking-wider font-mono">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Unified Generalized Engine</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every workflow executes on the exact same zero-pipeline-code core:
            </p>
            <div className="font-mono text-[11px] text-slate-800 bg-white/95 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
              <div className="text-emerald-700 font-semibold">1. Intent → gpt-4o-mini Plan</div>
              <div className="text-indigo-700 font-semibold">2. webcmd Stealth Exploration</div>
              <div className="text-purple-700 font-semibold">3. Schema Normalizer & Diff</div>
              <div className="text-sky-700 font-semibold">4. Semantic Matcher & Ranker</div>
              <div className="text-rose-700 font-semibold">5. Human Approval Gate</div>
            </div>
          </div>

          {/* Real-time Pipeline Execution Telemetry Bento */}
          <div className="bento-card p-6 border border-slate-200 bg-white/90 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-indigo-600" />
                Pipeline Execution History
              </h4>
              <span className="text-[10px] text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                Live
              </span>
            </div>

            {recentRuns.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">
                No runs recorded yet in SQLite database
              </p>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 capitalize font-display">
                        {run.vertical.replace(/_/g, " ")}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                        run.status === "success"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : run.status === "running"
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}>
                        {run.status}
                      </span>
                    </div>

                    {run.intent && (
                      <p className="text-[11px] text-slate-500 italic truncate font-medium">
                        &ldquo;{run.intent}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                      <span className="text-indigo-700 font-semibold">{run.records_found} items ({run.new_records} new)</span>
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

      {/* Dynamic Create Vertical Studio Modal */}
      <CreateVerticalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newSlug) => {
          setIsCreateModalOpen(false);
          loadVerticalsList();
          setVertical(newSlug);
        }}
      />
    </div>
  );
}
