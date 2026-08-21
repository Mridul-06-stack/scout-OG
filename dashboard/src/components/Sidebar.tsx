"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Radar, 
  Compass, 
  ShieldAlert, 
  Globe2, 
  UserCircle,
  Activity,
  Film
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Storyline", href: "/", icon: Film, badge: "Intro" },
    { name: "Live Radar", href: "/radar", icon: Radar, badge: "Live" },
    { name: "Opportunities", href: "/opportunities", icon: Compass },
    { name: "Learned Sources", href: "/sources", icon: Globe2 },
    { name: "Approval Gate", href: "/approvals", icon: ShieldAlert, alert: true },
    { name: "User Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#070810]/95 backdrop-blur-2xl flex flex-col justify-between h-screen sticky top-0 z-40">
      <div>
        {/* Brand Logo & Header */}
        <Link href="/" className="p-6 border-b border-white/5 flex items-center gap-3 group block">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f5d4] via-[#00bbf9] to-[#9d4edd] flex items-center justify-center shadow-lg shadow-[#00f5d4]/20 group-hover:scale-105 transition-transform">
            <Radar className="w-6 h-6 text-black font-black" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent flex items-center gap-1.5">
              <span>Scout</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#00f5d4]/10 text-[#00f5d4] rounded-md border border-[#00f5d4]/20">v2.0</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              Agentic Workflow Radar
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#00f5d4]/15 to-[#00bbf9]/5 text-white border border-[#00f5d4]/30 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#00f5d4]" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                    item.badge === "Live" 
                      ? "bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/30 animate-pulse" 
                      : "bg-white/5 text-slate-400 border border-white/10"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.alert && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Hackathon Badge */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#00f5d4]">
          <Activity className="w-3.5 h-3.5 animate-spin" />
          <span>webcmd Engine: Online</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          SLAB Hackathon Edition
          <span className="block text-slate-500 font-mono text-[10px] mt-0.5">Explore Once · Reuse Forever</span>
        </p>
      </div>
    </aside>
  );
}
