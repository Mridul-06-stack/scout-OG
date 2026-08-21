"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Radar, 
  Layers, 
  Globe2, 
  ShieldCheck, 
  UserCheck, 
  Activity,
  Sparkles,
  ChevronRight,
  Radio,
  Cpu,
  Compass
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { 
      name: "Overview Radar", 
      href: "/", 
      icon: Radar,
      badge: "Live",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    },
    { 
      name: "Opportunities", 
      href: "/opportunities", 
      icon: Compass,
      badge: "Kanban",
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
    },
    { 
      name: "Learned Sources", 
      href: "/sources", 
      icon: Globe2,
      badge: null
    },
    { 
      name: "Approval Gate", 
      href: "/approvals", 
      icon: ShieldCheck,
      badge: "Safe",
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30"
    },
    { 
      name: "User Profile", 
      href: "/profile", 
      icon: UserCheck,
      badge: null
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 md:min-h-screen bg-[#070914]/80 backdrop-blur-2xl border-r border-white/[0.08] p-5 flex flex-col justify-between shrink-0 shadow-2xl relative z-30">
      {/* Ambient Sidebar Gradient Blur */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-7 relative z-10">
        {/* Brand Logo & Radar Pulse */}
        <div className="flex items-center gap-3.5 px-2 py-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#090b1c] rounded-[15px] flex items-center justify-center relative overflow-hidden">
              {/* Radar Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-transparent animate-radar-sweep pointer-events-none" />
              <Radio className="w-5 h-5 text-indigo-400 relative z-10" />
            </div>
            {/* Live Online Ping Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#070914]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-white font-display">
                Scout
              </h1>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Self-Learning Radar
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Navigation
          </span>

          <nav className="space-y-1 pt-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-transparent text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  {/* Left Active Glow Pill */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full shadow-md shadow-indigo-400/50" />
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-slate-200"
                    }`} />
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 relative z-10">
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border font-mono ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? "text-indigo-400 translate-x-0.5" : "text-slate-600 opacity-0 group-hover:opacity-100"
                    }`} />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Real-time System Telemetry Box at Bottom */}
      <div className="pt-4 border-t border-white/[0.08] relative z-10">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Engine Status
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Stealth v0.1.1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300">
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="text-slate-400 block text-[8px] uppercase">AI Model</span>
              <span className="font-bold text-indigo-300">gpt-4o-mini</span>
            </div>
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="text-slate-400 block text-[8px] uppercase">Storage</span>
              <span className="font-bold text-purple-300">SQLite Async</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
