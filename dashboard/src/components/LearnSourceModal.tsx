"use client";

import { useState } from "react";
import { 
  Globe2, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Cpu
} from "lucide-react";
import { learnSource } from "../lib/api";

interface LearnSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultVertical?: string;
}

export default function LearnSourceModal({
  isOpen,
  onClose,
  onSuccess,
  defaultVertical = "student_opportunities",
}: LearnSourceModalProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [vertical, setVertical] = useState(defaultVertical);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResult(null);

    try {
      setStatusStep("1. Initializing webcmd Exploration Agent...");
      await new Promise((r) => setTimeout(r, 600));
      setStatusStep("2. Analyzing DOM structure & discovering recurring items...");
      await new Promise((r) => setTimeout(r, 800));
      setStatusStep("3. Compiling reusable extraction schema...");

      const res = await learnSource(url, vertical, name);
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setResult({ message: res.message || "Source successfully learned!" });
        onSuccess?.();
      }
    } catch (err: any) {
      setResult({ error: err.message || "Network error" });
    } finally {
      setLoading(false);
      setStatusStep(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl bg-[#0e101c]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Teach Scout a New Source
              </h3>
              <p className="text-xs text-slate-400">
                webcmd explore → compile → reusable command
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target URL to Explore
            </label>
            <input
              type="url"
              placeholder="https://example.com/hackathons or https://stays.com/manali"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Source Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ETHGlobal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Vertical
              </label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                disabled={loading}
                className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-medium"
              >
                <option value="student_opportunities">Student Opportunities</option>
                <option value="hotel_price_monitor">Hotel Price Monitor</option>
                <option value="github_issues_grants">GitHub Issues & Dev Grants</option>
              </select>
            </div>
          </div>

          {/* Active Exploration Status */}
          {statusStep && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span>{statusStep}</span>
            </div>
          )}

          {/* Results Feedback */}
          {result?.message && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          {result?.error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Learning Source...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore & Compile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
