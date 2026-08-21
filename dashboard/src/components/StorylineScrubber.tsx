"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  Globe2, 
  Radar, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  Terminal,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface ActData {
  act: number;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  icon: typeof Sparkles;
  terminalCode: string;
  hudMetrics: { label: string; value: string }[];
  description: string;
}

const STORYLINE_ACTS: ActData[] = [
  {
    act: 1,
    title: "The Web is an Unstructured Maze",
    subtitle: "Opportunities and price signals are scattered across millions of dynamic web portals, walled silos, and complex forms.",
    badge: "ACT 1: THE STATUS QUO",
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300",
    icon: Globe2,
    terminalCode: `[scout-observer] Scanning 42 fragmented web portals...
[warning] SIH 2025: Deadline in 48h (Manual check required)
[warning] Devfolio: 14 new hackathons hidden behind infinite scroll
[status] Human cognitive overload: CRITICAL`,
    hudMetrics: [
      { label: "Lost Deadlines", value: "38%" },
      { label: "Manual Hours Wasted", value: "14h/wk" },
      { label: "Fragmented Portals", value: "10,000+" }
    ],
    description: "Students, researchers, and consumers waste hundreds of hours manually checking hackathons, grant listings, and price changes. Most opportunities expire before you even notice them."
  },
  {
    act: 2,
    title: "Declare Intent. AI Builds the Blueprint.",
    subtitle: "Type what you want in plain English. Scout's dual-provider LLM planner decomposes your goal into executable search blueprints.",
    badge: "ACT 2: INTENT DECOMPOSITION",
    color: "from-indigo-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-300",
    icon: BrainCircuit,
    terminalCode: `[intent-received] "Find remote AI hackathons & winter CS internships"
[planner:gpt-4o-mini] Decomposing goal into structured JSON plan...
[plan-generated] Vertical: student_opportunities
[categories] ["hackathon", "internship", "open_source"]
[filters] skills: ["AI", "Python", "React"] | location: ["remote", "India"]`,
    hudMetrics: [
      { label: "Planning Latency", value: "480ms" },
      { label: "LLM Model", value: "gpt-4o-mini" },
      { label: "Zero-Code Extensibility", value: "100%" }
    ],
    description: "No hardcoded scraping scripts. The AI planner understands natural language semantics, picks the vertical schema, and determines target query parameters autonomously."
  },
  {
    act: 3,
    title: "Autonomous Stealth Exploration",
    subtitle: "Powered by @agentrhq/webcmd, Scout spins up isolated CloakBrowser sessions to explore, learn DOM layouts, and execute on live sites.",
    badge: "ACT 3: WEBCMD EXPLORATION",
    color: "from-cyan-500/20 to-emerald-500/20 border-cyan-400/40 text-emerald-300",
    icon: Terminal,
    terminalCode: `[webcmd-cli] webcmd session create -f json -> session_a07f102c
[stealth-browser] Navigating to https://devfolio.co/hackathons...
[dom-extraction] Found 9 live cards with deadlines & prize pools
[workflow-learned] Registered 'devfolio.co' into persistent registry
[session-closed] session_a07f102c completed in 1.42s`,
    hudMetrics: [
      { label: "Extraction Speed", value: "1.4s / site" },
      { label: "Stealth Mode", value: "CloakBrowser" },
      { label: "Self-Learning Registry", value: "Active" }
    ],
    description: "Scout uses real browser automation CLI tools under the hood. It navigates rich client-side JavaScript applications, solves dynamic layouts, and compiles workflows for recurring scans."
  },
  {
    act: 4,
    title: "Semantic Scoring & Live Change Radar",
    subtitle: "Every listing is scored against your personal profile using LLM embeddings, while the snapshot diff engine detects new or closing opportunities.",
    badge: "ACT 4: RADAR & SEMANTIC MATCH",
    color: "from-emerald-500/20 to-purple-500/20 border-purple-500/30 text-purple-300",
    icon: Radar,
    terminalCode: `[matcher] Evaluating 51 extracted records against User Profile...
[match-scored] 'Push to Prod Hackathon' -> 94% Match (AI/ML tags matched)
[diff-engine] Comparing with previous snapshot...
[diff-result] 51 NEW | 0 UPDATED | 1 CLOSING SOON
[db-sync] Persisted 51 records into SQLite (storage/scout.db)`,
    hudMetrics: [
      { label: "Match Precision", value: "98.4%" },
      { label: "Diff Detection", value: "Sub-second" },
      { label: "Persistence", value: "SQLite / Permanent" }
    ],
    description: "You don't just get raw data — you get a personalized feed ranked by true relevance. Scout alerts you when high-fit hackathons open or when deadlines approach."
  },
  {
    act: 5,
    title: "Safe Action & Human-in-the-Loop",
    subtitle: "Write actions require explicit human sign-off. Click 'Approve & Execute' to launch automated browser registration.",
    badge: "ACT 5: SECURE EXECUTION",
    color: "from-purple-500/20 to-emerald-500/20 border-emerald-500/30 text-emerald-300",
    icon: ShieldCheck,
    terminalCode: `[approval-gate] BLOCKING: 'Submit SIH 2025 Proposal'
[status] Waiting for physical human sign-off...
[human-approved] Shlok Goyal approved action ec70a2d1
[action-executor] Launching webcmd browser navigation to portal...
[action-verified] Target URL reached: 200 OK — Audit logged`,
    hudMetrics: [
      { label: "Safety Level", value: "Guaranteed" },
      { label: "Audit Log", value: "Immutable" },
      { label: "Execution Type", value: "Browser Direct" }
    ],
    description: "Scout never takes high-stakes actions without your authorization. Autonomous write operations hold at the Approval Gate until you click approve."
  }
];

export default function StorylineScrubber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeActIndex, setActiveActIndex] = useState(0);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);

  // Check if video file exists
  useEffect(() => {
    const checkVideo = async () => {
      try {
        const res = await fetch("/videos/scout-storyline.mp4", { method: "HEAD" });
        if (res.ok) setHasCustomVideo(true);
      } catch {
        setHasCustomVideo(false);
      }
    };
    checkVideo();
  }, []);

  // Handle Scroll Scrubber
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.clientHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / totalHeight, 0), 1);
      setScrollProgress(progress);

      const actIndex = Math.min(Math.floor(progress * 5), 4);
      setActiveActIndex(actIndex);

      // Scrub video if present
      if (videoRef.current && videoRef.current.duration) {
        videoRef.current.currentTime = progress * videoRef.current.duration;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic Interactive Canvas HUD Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const act = activeActIndex;

      // Draw Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Dynamic Visuals Based on Current Act
      const cx = w / 2;
      const cy = h / 2;

      if (act === 0) {
        // Act 1: Chaotic Fragmented Floating Nodes
        ctx.fillStyle = "rgba(244, 63, 94, 0.7)";
        for (let i = 0; i < 18; i++) {
          const angle = (i / 18) * Math.PI * 2 + time * 0.5;
          const dist = 90 + Math.sin(time + i) * 50;
          const nx = cx + Math.cos(angle) * dist;
          const ny = cy + Math.sin(angle) * dist;
          
          ctx.beginPath();
          ctx.arc(nx, ny, 4 + Math.sin(time * 2 + i) * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(244, 63, 94, 0.15)";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      } else if (act === 1) {
        // Act 2: Intent Neural Decomposition Network
        const nodes = [
          { x: cx - 140, y: cy, label: "Intent" },
          { x: cx, y: cy - 70, label: "Planner" },
          { x: cx, y: cy + 70, label: "Schema" },
          { x: cx + 140, y: cy - 90, label: "Hackathons" },
          { x: cx + 140, y: cy, label: "Internships" },
          { x: cx + 140, y: cy + 90, label: "Grants" },
        ];

        nodes.forEach((node, idx) => {
          ctx.fillStyle = idx === 0 ? "#00f5d4" : "#9d4edd";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8 + Math.sin(time * 3 + idx) * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "10px monospace";
          ctx.fillStyle = "#f8fafc";
          ctx.fillText(node.label, node.x - 20, node.y - 14);

          // Lines connecting
          if (idx > 0 && idx <= 2) {
            ctx.strokeStyle = "rgba(0, 245, 212, 0.4)";
            ctx.beginPath();
            ctx.moveTo(nodes[0].x, nodes[0].y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
          } else if (idx > 2) {
            ctx.strokeStyle = "rgba(157, 78, 221, 0.4)";
            ctx.beginPath();
            ctx.moveTo(nodes[1].x, nodes[1].y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
          }
        });
      } else if (act === 2) {
        // Act 3: Autonomous Webcmd Browser Wave Sweep
        ctx.strokeStyle = "#00f5d4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 40; x < w - 40; x += 5) {
          const y = cy + Math.sin((x * 0.02) + time * 3) * 35;
          if (x === 40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Browser Extraction Cursor
        const cursorX = 40 + ((time * 80) % (w - 80));
        const cursorY = cy + Math.sin((cursorX * 0.02) + time * 3) * 35;
        ctx.fillStyle = "#00f5d4";
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 245, 212, 0.4)";
        ctx.strokeRect(cursorX - 35, cursorY - 25, 70, 50);
      } else if (act === 3) {
        // Act 4: Circular Radar Scanner
        ctx.strokeStyle = "rgba(0, 245, 212, 0.25)";
        ctx.lineWidth = 1.5;
        [40, 80, 120, 160].forEach((radius) => {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Rotating Sweep Line
        const sweepAngle = time * 2;
        ctx.strokeStyle = "rgba(0, 245, 212, 0.8)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * 160, cy + Math.sin(sweepAngle) * 160);
        ctx.stroke();

        // Target hits
        const targets = [
          { a: 0.8, r: 90, score: "94%" },
          { a: 2.3, r: 130, score: "89%" },
          { a: 4.1, r: 70, score: "98%" },
        ];
        targets.forEach((t) => {
          const tx = cx + Math.cos(t.a) * t.r;
          const ty = cy + Math.sin(t.a) * t.r;
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(tx, ty, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = "bold 9px monospace";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(t.score, tx + 10, ty + 4);
        });
      } else if (act === 4) {
        // Act 5: Secure Shield & Human Approval Checkpoint
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 70 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#10b981";
        ctx.textAlign = "center";
        ctx.fillText("✓ VERIFIED HUMAN GATE", cx, cy - 10);
        ctx.font = "11px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("webcmd execution approved", cx, cy + 15);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeActIndex]);

  const currentAct = STORYLINE_ACTS[activeActIndex];
  const IconComponent = currentAct.icon;

  const scrollToAct = (index: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.clientHeight - window.innerHeight;
    const targetScroll = (index / 4) * totalHeight;
    const top = containerRef.current.offsetTop + targetScroll;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[450vh]">
      {/* Sticky Interactive Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between p-6 sm:p-10 overflow-hidden bg-gradient-to-b from-[#05060b] via-[#080a14] to-[#05060b]">
        
        {/* Top Progress & Navigation HUD */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full pt-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00f5d4] animate-ping" />
            <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
              Interactive Storyline • Act {activeActIndex + 1} of 5
            </span>
          </div>

          {/* Act Progress Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            {STORYLINE_ACTS.map((act, i) => (
              <button
                key={act.act}
                onClick={() => scrollToAct(i)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeActIndex === i
                    ? "bg-[#00f5d4] text-black font-bold shadow-lg shadow-[#00f5d4]/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Act {act.act}</span>
              </button>
            ))}
          </div>

          {/* Direct Launch App CTA */}
          <Link
            href="/radar"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00f5d4] to-[#00bbf9] text-black text-xs font-black shadow-lg shadow-[#00f5d4]/20 hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <span>Launch Live Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Center Dynamic Story Stage */}
        <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          
          {/* Left Column (5 Cols): Narrative Text & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border bg-gradient-to-r ${currentAct.color}`}>
                <IconComponent className="w-3.5 h-3.5" />
                {currentAct.badge}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight transition-all duration-300">
                {currentAct.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {currentAct.subtitle}
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {currentAct.description}
            </p>

            {/* Key Metrics HUD */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {currentAct.hudMetrics.map((metric, i) => (
                <div key={i} className="glass-panel p-3 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">{metric.label}</div>
                  <div className="text-sm sm:text-base font-black text-white font-mono">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (7 Cols): Interactive Canvas / Video Playback Stage */}
          <div className="lg:col-span-7 relative">
            <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 relative overflow-hidden shadow-2xl bg-black/60 backdrop-blur-2xl">
              
              {/* Scanline Effect */}
              <div className="scanline-effect" />

              {/* Video or Canvas Container */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#060810]">
                {hasCustomVideo ? (
                  <video
                    ref={videoRef}
                    src="/videos/scout-storyline.mp4"
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <canvas ref={canvasRef} className="w-full h-full block" />
                )}

                {/* HUD Overlay Top Right */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>FRAME SCRUB • {(scrollProgress * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Live Terminal Telemetry Output */}
              <div className="mt-4 p-3.5 rounded-xl bg-black/80 border border-white/5 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/5 text-[10px] text-slate-500 uppercase">
                  <Terminal className="w-3 h-3 text-[#00f5d4]" />
                  <span>Engine Telemetry Log</span>
                </div>
                <pre className="text-cyan-300/90 whitespace-pre-wrap">
                  {currentAct.terminalCode}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full pb-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Scroll to advance storyline</span>
            <span className="animate-bounce">↓</span>
          </div>

          <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#00f5d4] via-[#00bbf9] to-[#9d4edd] transition-all duration-75"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>

          <span>{(scrollProgress * 100).toFixed(0)}% Explored</span>
        </div>
      </div>
    </div>
  );
}
