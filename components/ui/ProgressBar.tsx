import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  variant?: "frost" | "emerald" | "amber" | "gradient";
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  className,
  variant = "frost",
  size = "md",
}: ProgressBarProps) {
  const safeVal = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const barColors = {
    frost: "bg-sky-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    gradient: "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500",
  };

  return (
    <div
      className={cn(
        "w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50",
        heights[size],
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          barColors[variant]
        )}
        style={{ width: `${safeVal}%` }}
      />
    </div>
  );
}
