import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "frost" | "emerald" | "amber" | "rose" | "slate" | "gold";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "frost",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    frost: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    gold: "bg-amber-400/15 text-amber-300 border-amber-400/40 font-bold",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

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
    gradient: "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500",
  };

  return (
    <div className={cn("w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50", heights[size], className)}>
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
