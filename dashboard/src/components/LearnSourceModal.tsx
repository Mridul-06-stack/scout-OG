"use client";

import { useState } from "react";
import { 
  Globe2, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Cpu,
  GraduationCap,
  Hotel,
  GitBranch
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
      setStatusStep("1. Initializing webcmd CloakBrowser session...");
      await new Promise((r) => setTimeout(r, 600));
      setStatusStep("2. Running DOM evaluation & discovering repeating entities...");
      await new Promise((r) => setTimeout(r, 800));
      setStatusStep("3. Compiling reusable extraction schema to registry...");

      const res = await learnSource(url, vertical, name);
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setResult({ message: res.message || "Source successfully learned and registered!" });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bento-card p-6 sm:p-8 border border-white/[0.12] shadow-2xl bg-[#0c0e1c] overflow-hidden">
        {/* Glowing Ambient Mesh Orb */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-bl from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Teach Scout a New Source
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                webcmd explore → compile → reusable command
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target URL to Explore
            </label>
            <input
              type="url"
              placeholder="https://example.com/hackathons or https://stays.com/manali"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Source Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Devfolio Hackathons"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Vertical
              </label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                disabled={loading}
                className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none transition-all font-bold shadow-inner"
              >
                <option value="student_opportunities">🎓 Student Opportunities</option>
                <option value="hotel_price_monitor">🏨 Hotel Price Monitor</option>
                <option value="github_issues_grants">🐙 GitHub Issues & Grants</option>
              </select>
            </div>
          </div>

          {/* Active Exploration Status */}
          {statusStep && (
            <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-200 flex items-center gap-3 animate-pulse shadow-lg shadow-indigo-500/10">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
              <span>{statusStep}</span>
            </div>
          )}

          {/* Results Feedback */}
          {result?.message && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2.5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          {result?.error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center gap-2.5 shadow-lg shadow-rose-500/10">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Learning Source...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explore & Register</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
