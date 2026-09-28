import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "frost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080A0F] disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[#8ED8FF] hover:bg-[#A6E2FF] text-[#080A0F] font-bold shadow-md shadow-[#8ED8FF]/15 focus:ring-[#8ED8FF]",
    frost:
      "bg-[#151922] hover:bg-[#1A1F2B] text-[#8ED8FF] border border-[#8ED8FF]/25 focus:ring-[#8ED8FF]",
    secondary:
      "bg-[#151922] hover:bg-[#1A1F2B] text-[#F5F7FA] border border-white/[0.08] focus:ring-slate-500",
    outline:
      "bg-transparent border border-white/[0.1] hover:border-white/[0.25] text-[#8D95A5] hover:text-[#F5F7FA] focus:ring-slate-500",
    ghost:
      "bg-transparent hover:bg-white/[0.04] text-[#8D95A5] hover:text-[#F5F7FA] focus:ring-slate-600",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 focus:ring-rose-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base font-bold gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
