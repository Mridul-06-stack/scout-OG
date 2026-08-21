"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  LayoutGrid, 
  Kanban, 
  RefreshCw, 
  GraduationCap, 
  Hotel,
  GitBranch,
  TrendingUp,
  Filter,
  Sparkles,
  Plus
} from "lucide-react";
import OpportunityCard from "@/components/OpportunityCard";
import LifecycleBoard from "@/components/LifecycleBoard";
import CreateVerticalModal from "@/components/CreateVerticalModal";
import { fetchOpportunities, fetchVerticals, updateOpportunityStatus } from "@/lib/api";
import { Opportunity, OpportunityStatus, VerticalInfo } from "@/lib/types";

export default function OpportunitiesPage() {
  const [verticals, setVerticals] = useState<VerticalInfo[]>([]);
  const [vertical, setVertical] = useState<string>("student_opportunities");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChangeType, setSelectedChangeType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadVerticalsList = async () => {
    try {
      const data = await fetchVerticals();
      setVerticals(data.items);
    } catch (err) {
      console.error("Failed to load verticals:", err);
    }
  };

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await fetchOpportunities({
        vertical,
        search: search || undefined,
        change_type: selectedChangeType || undefined,
        status: selectedStatus || undefined,
        limit: 100,
      });
      setOpportunities(data.items);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerticalsList();
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [vertical, selectedChangeType, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOpportunities();
  };

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    await updateOpportunityStatus(id, newStatus);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const renderVerticalIcon = (vertId: string) => {
    if (vertId === "student_opportunities") return <GraduationCap className="w-3.5 h-3.5" />;
    if (vertId === "hotel_price_monitor") return <Hotel className="w-3.5 h-3.5" />;
    if (vertId === "github_issues_grants") return <GitBranch className="w-3.5 h-3.5" />;
    return <TrendingUp className="w-3.5 h-3.5" />;
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      {/* ── Top Bento Header ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.09] bg-gradient-to-r from-[#111326] via-[#141834] to-[#1a1236] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Explorer & Pipeline
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {opportunities.length} Listings Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Opportunity Explorer
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Normalized across real webcmd workflows · Ranked by personal fit score
          </p>
        </div>

        {/* Top Controls: Verticals & View Switcher */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {/* Dynamic Vertical Toggle Pills */}
          <div className="bg-[#0b0d1a]/90 p-1 rounded-2xl border border-white/[0.08] flex flex-wrap items-center gap-1 shadow-inner">
            {verticals.length > 0 ? (
              verticals.map((v) => {
                const isActive = vertical === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVertical(v.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {renderVerticalIcon(v.id)}
                    <span>{v.name}</span>
                  </button>
                );
              })
            ) : (
              <>
                <button
                  onClick={() => setVertical("student_opportunities")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    vertical === "student_opportunities"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  onClick={() => setVertical("hotel_price_monitor")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    vertical === "hotel_price_monitor"
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Hotel className="w-3.5 h-3.5" />
                  <span>Hotels</span>
                </button>
                <button
                  onClick={() => setVertical("github_issues_grants")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    vertical === "github_issues_grants"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitHub & Grants</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-pink-300 hover:text-white hover:bg-pink-500/20 border border-dashed border-pink-500/30 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="bg-[#0b0d1a]/90 p-1 rounded-2xl border border-white/[0.08] flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Feed View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "board"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar Bento ── */}
      <div className="bento-card p-4 border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, location, skill, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner font-sans"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Change Type Filter */}
          <select
            value={selectedChangeType}
            onChange={(e) => setSelectedChangeType(e.target.value)}
            className="bg-[#121526] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-bold shadow-inner"
          >
            <option value="">All Change Types</option>
            <option value="new">✨ New Today</option>
            <option value="closing_soon">⏰ Closing Soon</option>
            <option value="updated">🔄 Updated</option>
            <option value="unchanged">✓ Unchanged</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#121526] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-bold shadow-inner"
          >
            <option value="">All Stages</option>
            <option value="discovered">Discovered</option>
            <option value="interested">Interested</option>
            <option value="applying">Applying</option>
            <option value="applied">Applied</option>
            <option value="selected">Selected</option>
          </select>

          <button
            onClick={loadOpportunities}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Main Content: Card List or Kanban Board ── */}
      {viewMode === "board" ? (
        <LifecycleBoard
          opportunities={opportunities}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="bento-card p-14 text-center border border-white/[0.08] space-y-3">
              <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-base font-bold text-white">No Matching Listings</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                Try adjusting your search query, change type filter, or select another vertical.
              </p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      )}

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
