import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverEffect?: boolean;
}

export function Card({
  className,
  glow,
  hoverEffect,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#151922] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden transition-all duration-200",
        hoverEffect && "hover:border-white/[0.18] hover:bg-[#181D27] cursor-pointer",
        glow && "border-[#8ED8FF]/35 shadow-[0_0_24px_rgba(142,216,255,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
}
