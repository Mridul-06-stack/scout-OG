"use client";

import { LucideIcon, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  trend?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  trend = "Real-time",
}: StatsCardProps) {
  return (
    <div className="bento-card bento-card-interactive p-6 relative overflow-hidden group">
      {/* Dynamic Ambient Blur Orb */}
      <div
        className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-500 ${gradient}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {title}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.06] flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              {trend}
            </span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono pt-1">
            {value}
          </h3>

          {subtitle && (
            <p className="text-xs text-slate-400 pt-1 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner ${iconColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
