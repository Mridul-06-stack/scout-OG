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
        <div className="absolute right-0 top-14 z-50 w-84 bento-card p-5 border border-slate-200 shadow-2xl bg-white animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Scout AI Intent Decomposition
            </span>
            <button
              onClick={() => setShowIntentInput(false)}
              className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-0.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
            Specify targeted constraints. OpenAI <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono font-bold">gpt-4o-mini</code> will plan categories and domain filters.
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
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-sans shadow-inner font-medium"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
      <div className="inline-flex rounded-2xl shadow-md shadow-indigo-600/20 p-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-2.5 rounded-l-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wide flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer font-mono"
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
          className="px-3 py-2.5 rounded-r-xl bg-indigo-700 hover:bg-indigo-800 text-white transition-colors border-l border-white/20 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
