"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Radar, 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  Globe2, 
  UserCircle,
  Activity
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: Radar },
    { name: "Opportunities", href: "/opportunities", icon: Compass },
    { name: "Learned Sources", href: "/sources", icon: Globe2 },
    { name: "Approval Gate", href: "/approvals", icon: ShieldAlert },
    { name: "User Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0c0d16]/90 backdrop-blur-2xl flex flex-col justify-between h-screen sticky top-0 z-40">
      <div>
        {/* Brand Logo & Tag */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Radar className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Scout
            </h1>
            <p className="text-[11px] font-medium text-indigo-400/80 tracking-wide uppercase">
              Workflow Radar
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Engine Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.name === "Approval Gate" && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Hackathon Badge */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-spin" />
          <span>webcmd Engine: Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          SLAB Hackathon Edition
          <span className="block text-slate-500 font-mono text-[10px] mt-0.5">Explore Once · Reuse Forever</span>
        </p>
      </div>
    </aside>
  );
}
