"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Kanban, 
  RefreshCw, 
  GraduationCap, 
  Hotel,
  Tag
} from "lucide-react";
import OpportunityCard from "@/components/OpportunityCard";
import LifecycleBoard from "@/components/LifecycleBoard";
import { fetchOpportunities, updateOpportunityStatus } from "@/lib/api";
import { Opportunity, OpportunityStatus, ChangeType } from "@/lib/types";

export default function OpportunitiesPage() {
  const [vertical, setVertical] = useState<string>("student_opportunities");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChangeType, setSelectedChangeType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Opportunity Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Normalized across webcmd workflows · Ranked by user fit
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Vertical Toggle */}
          <div className="bg-[#121422] p-1 rounded-2xl border border-white/10 flex flex-wrap items-center gap-1">
            <button
              onClick={() => setVertical("student_opportunities")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                vertical === "student_opportunities"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
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
              <span>Hotels</span>
            </button>
            <button
              onClick={() => setVertical("github_issues_grants")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                vertical === "github_issues_grants"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🐙 GitHub & Grants</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="bg-[#121422] p-1 rounded-2xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Feed View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "board"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, location, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Change Type Filter */}
          <select
            value={selectedChangeType}
            onChange={(e) => setSelectedChangeType(e.target.value)}
            className="bg-[#141624] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 font-medium"
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
            className="bg-[#141624] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Lifecycle Stages</option>
            <option value="discovered">Discovered</option>
            <option value="interested">Interested</option>
            <option value="applying">Applying</option>
            <option value="applied">Applied</option>
            <option value="selected">Selected</option>
          </select>

          <button
            onClick={loadOpportunities}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content: Card List or Kanban Board */}
      {viewMode === "board" ? (
        <LifecycleBoard
          opportunities={opportunities}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white">No Matching Opportunities</p>
              <p className="text-xs text-slate-500">
                Try adjusting your search query or change type filter.
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
    </div>
  );
}
