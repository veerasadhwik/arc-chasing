"use client";

import React, { useMemo } from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { Sparkles, ArrowRight, Brain, Lightbulb } from "lucide-react";

export function AiInsightCard() {
  const { metrics, habits } = useArc();
  const { habitStats, currentStreak } = metrics;

  const insight = useMemo(() => {
    const statsList = Object.values(habitStats);
    if (statsList.length === 0) return null;

    // Find best habit and lagging habit
    const sorted = [...statsList].sort((a, b) => b.completionRate - a.completionRate);
    const topHabitStat = sorted[0];
    const bottomHabitStat = sorted[sorted.length - 1];

    const topHabit = habits.find((h) => h.id === topHabitStat?.habitId);
    const bottomHabit = habits.find((h) => h.id === bottomHabitStat?.habitId);

    if (!topHabit || !bottomHabit || topHabit.id === bottomHabit.id) {
      return {
        observation: `You are maintaining a steady ${currentStreak}-day momentum on your Arc.`,
        recommendation: "Focus on locking in your morning habits within the first 60 minutes of waking up.",
      };
    }

    let recommendation = "";
    if (bottomHabit.habit_type === "duration") {
      recommendation = `Consider splitting your ${bottomHabit.name} target from ${bottomHabit.target_value}m into two smaller sessions or scheduling it earlier in the day.`;
    } else if (bottomHabit.habit_type === "time") {
      recommendation = `Set a wind-down alarm 30 minutes before your target ${bottomHabit.name} to eliminate evening screen distraction.`;
    } else {
      recommendation = `Tie ${bottomHabit.name} right after your highest consistency habit (${topHabit.name}) via habit stacking.`;
    }

    return {
      observation: `You've locked in ${topHabit.name} with ${topHabitStat.completionRate}% consistency, while ${bottomHabit.name} is at ${bottomHabitStat.completionRate}%.`,
      recommendation,
    };
  }, [habitStats, habits, currentStreak]);

  if (!insight) return null;

  return (
    <div className="glass-panel bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-sky-300">
        <Brain className="w-5 h-5 text-sky-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400 tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            AI Coach Pattern Analysis
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
            Phase 2
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          {insight.observation}
        </p>

        <div className="mt-2.5 p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/20 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-200">
            <strong className="text-sky-300">Actionable Suggestion:</strong> {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
