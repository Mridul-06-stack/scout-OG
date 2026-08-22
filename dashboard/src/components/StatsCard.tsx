import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  trend?: string;
  percent?: number;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  trend,
  percent = 72,
}: StatsCardProps) {
  return (
    <div className="bento-card p-5 sm:p-6 group relative overflow-hidden flex flex-col justify-between bg-white/90 border border-slate-200/90 shadow-sm">
      {/* Ambient Backlight Orb */}
      <div 
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none ${gradient}`} 
      />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
            {title}
          </span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm group-hover:scale-110 transition-transform ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 relative z-10">
        <span className="text-xs text-slate-500 font-medium truncate">
          {subtitle}
        </span>
        {trend && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0 font-mono">
            {trend}
          </span>
        )}
      </div>

      {/* Subtle Micro Progress Bar Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
        <div 
          className={`h-full opacity-70 group-hover:opacity-100 transition-all duration-500 ${gradient}`} 
          style={{ width: `${Math.min(100, Math.max(15, Number(value) > 0 ? 80 : 20))}%` }}
        />
      </div>
    </div>
  );
}
