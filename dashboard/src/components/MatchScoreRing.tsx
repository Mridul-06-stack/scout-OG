"use client";

interface MatchScoreRingProps {
  score: number; // 0.0 to 1.0
  size?: "sm" | "md" | "lg";
}

export default function MatchScoreRing({ score, size = "md" }: MatchScoreRingProps) {
  const percentage = Math.round(score * 100);

  // Determine color theme based on score value
  let strokeColor = "#10b981"; // emerald for >= 70%
  let textColor = "text-emerald-400";
  let bgGlow = "shadow-emerald-500/20";

  if (percentage < 45) {
    strokeColor = "#94a3b8"; // slate for low
    textColor = "text-slate-400";
    bgGlow = "shadow-slate-500/10";
  } else if (percentage < 70) {
    strokeColor = "#f59e0b"; // amber for medium
    textColor = "text-amber-400";
    bgGlow = "shadow-amber-500/20";
  }

  const dimensions = {
    sm: { radius: 14, stroke: 2.5, width: 36, fontSize: "text-[10px]" },
    md: { radius: 18, stroke: 3.5, width: 46, fontSize: "text-xs" },
    lg: { radius: 24, stroke: 4.5, width: 60, fontSize: "text-sm" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (score * circumference);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shadow-lg ${bgGlow}`}
      title={`Match Score: ${percentage}%`}
    >
      <svg
        width={dimensions.width}
        height={dimensions.width}
        className="transform -rotate-90"
      >
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.width / 2}
          r={dimensions.radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={dimensions.stroke}
          fill="transparent"
        />
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.width / 2}
          r={dimensions.radius}
          stroke={strokeColor}
          strokeWidth={dimensions.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      <span
        className={`absolute font-bold font-mono ${dimensions.fontSize} ${textColor}`}
      >
        {percentage}%
      </span>
    </div>
  );
}
