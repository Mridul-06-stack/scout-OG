"use client";

import { useState } from "react";
import { Play, Loader2, Sparkles, SlidersHorizontal } from "lucide-react";
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
        <div className="absolute right-0 top-12 z-30 w-80 glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl bg-[#0d0f1c] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Scout Intent Prompt
            </span>
            <button
              onClick={() => setShowIntentInput(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Give Scout a specific goal to decompose via Claude Planner.
          </p>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder={
              currentVertical === "student_opportunities"
                ? "e.g. Find remote AI hackathons and winter internships for 2nd year students in India"
                : "e.g. Find budget hotels in Old Manali with mountain view under ₹2500"
            }
            rows={3}
            className="w-full bg-[#131522] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Execute Custom Intent</span>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="inline-flex rounded-xl shadow-lg shadow-indigo-600/25 p-0.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-2 rounded-l-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
          <span>Run Radar Now</span>
        </button>

        <button
          onClick={() => setShowIntentInput(!showIntentInput)}
          title="Customize Planner Intent"
          className="px-2.5 py-2 rounded-r-lg bg-indigo-700/80 hover:bg-indigo-600 text-white transition-colors border-l border-white/10"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
