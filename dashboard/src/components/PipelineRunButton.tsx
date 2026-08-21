"use client";

import { useState } from "react";
import { Play, Loader2, Sparkles, SlidersHorizontal, Radar } from "lucide-react";
import { triggerPipelineRun } from "../lib/api";

interface PipelineRunButtonProps {
  currentVertical: string;
  onRunStarted?: () => void;
}

export default function PipelineRunButton({
  currentVertical,
  onRunStarted,
}: PipelineRunButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showIntentInput, setShowIntentInput] = useState(false);
  const [intent, setIntent] = useState("");

  const handleRun = async () => {
    setLoading(true);
    try {
      await triggerPipelineRun(currentVertical, intent);
      setShowIntentInput(false);
      onRunStarted?.();
    } catch (err) {
      console.error("Pipeline run failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Intent Customizer Modal / Dropdown */}
      {showIntentInput && (
        <div className="absolute right-0 top-14 z-50 w-84 bento-card p-5 border border-white/15 shadow-2xl bg-[#0d0f1e] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Scout AI Intent Decomposition
            </span>
            <button
              onClick={() => setShowIntentInput(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-0.5 rounded-lg hover:bg-white/[0.06]"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Specify targeted constraints. OpenAI <code className="text-indigo-300 font-mono">gpt-4o-mini</code> will plan categories and domain filters.
          </p>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder={
              currentVertical === "student_opportunities"
                ? "e.g. Find remote AI hackathons and winter internships for 2nd year students in India"
                : currentVertical === "hotel_price_monitor"
                ? "e.g. Find budget hotels in Old Manali with mountain view under ₹2500"
                : "e.g. Find good first issues in Rust and developer grants"
            }
            rows={3}
            className="w-full bg-[#131728] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Execute AI Intent Radar</span>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="inline-flex rounded-2xl shadow-xl shadow-indigo-600/30 p-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-2.5 rounded-l-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black tracking-wide flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Radar className="w-4 h-4 text-white animate-pulse" />
          )}
          <span>Run Radar Now</span>
        </button>

        <button
          onClick={() => setShowIntentInput(!showIntentInput)}
          title="Customize Planner Intent"
          className="px-3 py-2.5 rounded-r-xl bg-purple-700/80 hover:bg-purple-600 text-white transition-colors border-l border-white/15"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
