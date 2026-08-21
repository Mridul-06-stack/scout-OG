"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
}: StatsCardProps) {
  return (
    <div className="glass-panel glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group">
      {/* Background glow behind icon */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity ${gradient}`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl bg-white/[0.05] border border-white/10 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
