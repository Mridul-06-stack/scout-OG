"use client";

import { useState } from "react";
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Globe2,
  Plus,
  Zap,
  Layers
} from "lucide-react";
import { createVertical } from "../lib/api";

interface CreateVerticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newVerticalSlug: string) => void;
}

export default function CreateVerticalModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVerticalModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seedUrls, setSeedUrls] = useState("");
  const [categories, setCategories] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    setLoading(true);
    setResult(null);

    try {
      setStatusStep("1. Initializing OpenAI gpt-4o-mini Meta-Architect...");
      await new Promise((r) => setTimeout(r, 600));
      setStatusStep("2. Auto-generating custom JSON schema & field mappings...");
      await new Promise((r) => setTimeout(r, 800));
      setStatusStep("3. Registering seed crawler workflows & profile template...");

      const urlList = seedUrls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      const catList = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await createVertical({
        name,
        description,
        seed_urls: urlList,
        categories: catList,
      });

      if (res.status === "success") {
        setResult({ message: `Successfully created "${res.name}" radar with ${res.seed_sources_count} sources!` });
        setTimeout(() => {
          onSuccess?.(res.slug);
        }, 1200);
      }
    } catch (err: any) {
      setResult({ error: err.message || "Failed to create vertical" });
    } finally {
      setLoading(false);
      setStatusStep(null);
    }
  };

  const presetUseCases = [
    {
      name: "Share Market & Stock Radar",
      desc: "Track breakout stocks, quarterly earnings dates, P/E ratios, and market signals from financial portals",
      urls: "https://finance.yahoo.com/most-active\nhttps://www.moneycontrol.com",
      cats: "breakout_stock, earnings, dividend, valuation",
    },
    {
      name: "Crypto Airdrop & Protocol Radar",
      desc: "Monitor upcoming token airdrops, testnet incentive programs, and governance votes",
      urls: "https://airdropalert.com\nhttps://defillama.com/airdrops",
      cats: "airdrop, testnet, token_launch, retroactive",
    },
    {
      name: "Government Tender & RFP Radar",
      desc: "Discover public sector procurement tenders, state contracts, and engineering bids",
      urls: "https://etenders.gov.in\nhttps://gem.gov.in",
      cats: "tender, procurement, rfp, government_contract",
    },
  ];

  const applyPreset = (preset: typeof presetUseCases[0]) => {
    setName(preset.name);
    setDescription(preset.desc);
    setSeedUrls(preset.urls);
    setCategories(preset.cats);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bento-card p-6 sm:p-8 border border-white/[0.12] shadow-2xl bg-[#0c0e1e] overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Ambient Gradient Mesh Orb */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-gradient-to-bl from-indigo-500/25 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Dynamic Radar Workflow Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Zero Code
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Create an autonomous monitoring radar for ANY website, market, or industry
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

        {/* 1-Click Quick Presets */}
        <div className="mt-5 space-y-2 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Example Workflows:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presetUseCases.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-indigo-600/20 border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all group"
              >
                <span className="text-xs font-extrabold text-white group-hover:text-indigo-200 block truncate">
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  1-click template
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Radar Workflow Name
            </label>
            <input
              type="text"
              placeholder="e.g. Share Market Analysis, Real Estate Deals, or Crypto Airdrops"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-sans font-medium shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Goal & Extraction Intent
            </label>
            <textarea
              placeholder="Describe what data to extract (e.g. Track breakout tech stocks, earnings reports, P/E ratios, buy signals, and news sentiment)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              disabled={loading}
              className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-sans font-medium shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Seed URLs (1 per line)
              </label>
              <textarea
                placeholder="https://finance.yahoo.com/most-active&#10;https://www.moneycontrol.com"
                value={seedUrls}
                onChange={(e) => setSeedUrls(e.target.value)}
                rows={3}
                disabled={loading}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Search Categories (Comma-separated)
              </label>
              <textarea
                placeholder="breakout, earnings, dividends, valuation"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                rows={3}
                disabled={loading}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-sans font-medium shadow-inner"
              />
            </div>
          </div>

          {/* Active Compilation Status */}
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

          {/* Footer Actions */}
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
              disabled={loading || !name || !description}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling Schema & Workflow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Launch Radar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
