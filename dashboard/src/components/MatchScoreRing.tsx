"use client";

interface MatchScoreRingProps {
  score: number; // 0.0 to 1.0
  size?: "sm" | "md" | "lg";
}

export default function MatchScoreRing({ score, size = "md" }: MatchScoreRingProps) {
  const percentage = Math.round(score * 100);

  // Gradient ID and color palette based on match tier
  let gradientId = "emeraldGrad";
  let textColor = "text-emerald-700";
  let glowColor = "shadow-emerald-500/10";
  let badgeLabel = "High Fit";

  if (percentage < 45) {
    gradientId = "slateGrad";
    textColor = "text-slate-600";
    glowColor = "shadow-slate-500/10";
    badgeLabel = "Base";
  } else if (percentage < 70) {
    gradientId = "indigoGrad";
    textColor = "text-indigo-700";
    glowColor = "shadow-indigo-500/10";
    badgeLabel = "Good";
  }

  const dimensions = {
    sm: { radius: 14, stroke: 3, width: 38, fontSize: "text-[10px]" },
    md: { radius: 20, stroke: 4, width: 52, fontSize: "text-xs" },
    lg: { radius: 28, stroke: 5, width: 70, fontSize: "text-sm" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (Math.min(score, 1.0) * circumference);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shadow-md ${glowColor} transition-transform hover:scale-110 duration-200 bg-white`}
      title={`Relevance Fit: ${percentage}% (${badgeLabel})`}
    >
      <svg
        width={dimensions.width}
        height={dimensions.width}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>

        <circle
          cx={dimensions.width / 2}
          cy={dimensions.width / 2}
          r={dimensions.radius}
          stroke="#e2e8f0"
          strokeWidth={dimensions.stroke}
          fill="transparent"
        />
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.width / 2}
          r={dimensions.radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={dimensions.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <span
        className={`absolute font-black font-mono ${dimensions.fontSize} ${textColor}`}
      >
        {percentage}%
      </span>
    </div>
  );
}
