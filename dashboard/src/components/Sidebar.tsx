"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Radar, 
  Compass, 
  Globe2, 
  ShieldAlert, 
  UserCircle,
  Activity,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: Radar, badge: "Live" },
    { name: "Opportunities", href: "/opportunities", icon: Compass, badge: "Kanban" },
    { name: "Learned Sources", href: "/sources", icon: Globe2 },
    { name: "Approval Gate", href: "/approvals", icon: ShieldAlert, alert: true },
    { name: "User Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#0c0e1a]/95 backdrop-blur-2xl flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Logo & Header */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                <Radar className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Scout
                </h1>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Self-Learning Radar
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Navigation</span>
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/30 via-indigo-600/15 to-transparent text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                }`}
              >
                {/* Active Left Glow Pill */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500 shadow-md shadow-indigo-400/50" />
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-indigo-500/30 text-indigo-300" 
                      : "bg-white/[0.04] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.08]"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? "bg-indigo-500/30 text-indigo-200" 
                        : "bg-white/[0.06] text-slate-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.alert && (
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-md shadow-rose-500/80" />
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? "text-indigo-400 translate-x-0.5" : "text-transparent group-hover:text-slate-500"
                  }`} />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Tech Telemetry Bento Badge */}
      <div className="p-4 m-4 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/40 border border-white/[0.08] shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>webcmd Stealth</span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            v0.1.1
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Engine Core:</span>
            <span className="font-mono text-slate-300">gpt-4o-mini</span>
          </div>
          <div className="flex justify-between">
            <span>Persistence:</span>
            <span className="font-mono text-slate-300">SQLite Async</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
