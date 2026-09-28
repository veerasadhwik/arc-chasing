"use client";

import React from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Flame, CheckCircle, Trophy, Sparkles } from "lucide-react";

export function DailyScoreCard() {
  const { metrics, arc, totalXp } = useArc();
  const { user } = useAuth();
  const { t } = useLanguage();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "GOOD MORNING"
      : hour < 17
      ? "GOOD AFTERNOON"
      : "GOOD EVENING";

  const displayName = (user?.display_name || user?.username || "VEERA").toUpperCase();
  const { currentDay, totalDays, todayMetric, currentStreak } = metrics;
  const arcProgressPct = Math.round((currentDay / totalDays) * 100);

  return (
    <div className="bg-[#151922] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
            {greeting}, {displayName}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
            DAY {currentDay} / {totalDays}
          </h1>
        </div>

        {/* Motivational Status Note (Non-punitive data-driven) */}
        <div className="text-xs sm:text-right text-[#8D95A5] font-medium">
          {todayMetric.perfectDay ? (
            <span className="text-emerald-400 font-bold flex items-center sm:justify-end gap-1.5">
              <CheckCircle className="w-4 h-4" />
              All disciplines completed today. Perfect standard.
            </span>
          ) : (
            <span>
              {todayMetric.completedHabits} of {todayMetric.totalHabits} disciplines hit.{" "}
              {todayMetric.totalHabits - todayMetric.completedHabits > 0
                ? "Keep building your Arc."
                : ""}
            </span>
          )}
        </div>
      </div>

      {/* Main Arc Progress Bar (Large, clean visual) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#8D95A5]">
          <span className="uppercase tracking-wider">Arc Progress</span>
          <span className="text-[#8ED8FF] font-bold">{arcProgressPct}%</span>
        </div>
        <div className="w-full bg-[#10131A] rounded-full h-3 overflow-hidden border border-white/[0.06]">
          <div
            className="bg-[#8ED8FF] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${arcProgressPct}%` }}
          />
        </div>
      </div>

      {/* Metric Tiles: Today Score & Streak */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {/* Today Completion */}
        <div className="bg-[#10131A] border border-white/[0.06] rounded-2xl p-4">
          <div className="text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
            Today's Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F5F7FA] mt-1">
            {todayMetric.completionPercentage}%
          </div>
          <div className="text-[11px] text-[#8D95A5] mt-0.5">
            {todayMetric.completedHabits} / {todayMetric.totalHabits} completed
          </div>
        </div>

        {/* Streak */}
        <div className="bg-[#10131A] border border-white/[0.06] rounded-2xl p-4">
          <div className="text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
            {currentStreak} <span className="text-sm font-semibold text-[#8D95A5]">Days</span>
          </div>
          <div className="text-[11px] text-[#8D95A5] mt-0.5">
            Longest: {metrics.longestStreak} days
          </div>
        </div>

        {/* Perfect Day Badge */}
        <div className="col-span-2 sm:col-span-1 bg-[#10131A] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-[#8ED8FF]" />
            <span>Perfect Days</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#8ED8FF] mt-1">
            {metrics.perfectDaysCount}
          </div>
          <div className="text-[11px] text-[#8D95A5] mt-0.5">
            100% days completed
          </div>
        </div>
      </div>
    </div>
  );
}
