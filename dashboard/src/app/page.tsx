"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  Radar, 
  BrainCircuit, 
  Globe2, 
  Layers, 
  GraduationCap, 
  Hotel, 
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import StorylineScrubber from "@/components/StorylineScrubber";

export default function HomePage() {
  const scrollToStoryline = () => {
    const el = document.getElementById("storyline-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-100 selection:bg-[#00f5d4] selection:text-black">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 py-20 overflow-hidden">
        {/* Glow ambient background rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#00f5d4]/10 via-[#9d4edd]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/30 shadow-lg shadow-[#00f5d4]/10">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AGENTIC RADAR ENGINE POWERED BY @AGENTRHQ/WEBCMD</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Turn Recurring Web Browsing into <span className="bg-gradient-to-r from-[#00f5d4] via-[#00bbf9] to-[#9d4edd] bg-clip-text text-transparent">Self-Learning Radar.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Declare high-level intent in plain English. Scout explores live web applications, learns navigational workflows once, continuously scores new opportunities with OpenAI, and holds write actions at a secure human approval gate.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/radar"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00f5d4] via-[#00bbf9] to-[#00f5d4] bg-[length:200%_auto] hover:bg-right text-black font-black text-sm shadow-xl shadow-[#00f5d4]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Launch Live Radar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToStoryline}
              className="px-6 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 hover:border-white/20"
            >
              <span>Experience Storyline</span>
              <ChevronDown className="w-4 h-4 text-[#00f5d4]" />
            </button>
          </div>

          {/* Telemetry Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-white/5">
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xl sm:text-2xl font-black text-white font-mono">236+</div>
              <div className="text-[11px] uppercase font-mono text-slate-400">Live Monitored</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xl sm:text-2xl font-black text-[#00f5d4] font-mono">3 Verticals</div>
              <div className="text-[11px] uppercase font-mono text-slate-400">Zero Extra Code</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xl sm:text-2xl font-black text-[#00bbf9] font-mono">gpt-4o-mini</div>
              <div className="text-[11px] uppercase font-mono text-slate-400">Semantic Matching</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">100% Safe</div>
              <div className="text-[11px] uppercase font-mono text-slate-400">Human Approval Gate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Scroll-Driven Storyline Engine ── */}
      <section id="storyline-section" className="relative w-full border-t border-white/5">
        <StorylineScrubber />
      </section>

      {/* ── 3. Multi-Vertical Showcase ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            PROVEN EXTENSIBILITY
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            One Generalized Engine. Infinite Verticals.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Scout has zero hardcoded pipeline code. Any vertical is defined purely through JSON config schemas, seed sources, and profile templates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vertical 1 */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-[#00f5d4]/40 transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-[#00f5d4]/10 border border-[#00f5d4]/30 flex items-center justify-center text-[#00f5d4]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Student Opportunities</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors Devfolio hackathons, MLH seasons, Unstop competitions, Outreachy fellowships, MITACS, and Smart India Hackathon.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Hackathons</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">GSoC</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Internships</span>
            </div>
          </div>

          {/* Vertical 2 */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-[#00bbf9]/40 transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-[#00bbf9]/10 border border-[#00bbf9]/30 flex items-center justify-center text-[#00bbf9]">
              <Hotel className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Hotel Price Monitor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracks real-time rates and room availability across Zostel properties, Booking.com, and MakeMyTrip with price drop alerts.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Live Rates</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Price Drops</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Hostels</span>
            </div>
          </div>

          {/* Vertical 3 */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-purple-500/40 transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">GitHub Issues & Grants</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scours Rust compiler repositories for good first issues, Web3 developer grants on Gitcoin, and developer bounties.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Good First Issue</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Gitcoin Grants</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">Bounties</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Bottom Launch CTA ── */}
      <section className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-[#080a14] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Experience the Autonomous Radar?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Scan live hackathons, monitor hotel prices, score matching opportunities, and test the human approval gate in real time.
          </p>
          <div className="pt-2">
            <Link
              href="/radar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00f5d4] via-[#00bbf9] to-[#00f5d4] text-black font-black text-sm shadow-xl shadow-[#00f5d4]/20 hover:scale-105 transition-all"
            >
              <span>Launch Scout Live Control Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
