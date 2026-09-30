"use client";

import React, { useState, useEffect } from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Flame, CheckCircle, Trophy, Sparkles, Clock, Calendar } from "lucide-react";
import { formatLocalTime, formatDisplayDate, getBrowserTimezone } from "@/lib/utils";

export function DailyScoreCard() {
  const { metrics, arc } = useArc();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [timeStr, setTimeStr] = useState<string>("");
  const tz = user?.timezone || getBrowserTimezone();

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(
        formatLocalTime(new Date(), "en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: tz,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [tz]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "GOOD MORNING"
      : hour < 17
      ? "GOOD AFTERNOON"
      : "GOOD EVENING";

  const displayName = (user?.display_name || user?.username || "WARRIOR").toUpperCase();
  const { currentDay, totalDays, todayMetric, currentStreak, arcStatus, daysUntilStart } = metrics;
  
  const arcProgressPct = totalDays > 0 ? Math.min(100, Math.round((currentDay / totalDays) * 100)) : 0;

  return (
    <div className="bg-[#151922] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row: Greeting & Live Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider flex items-center gap-2">
            <span>{greeting}, {displayName}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-sky-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              {timeStr || "TICKING..."}
            </span>
          </div>

          {arcStatus === "upcoming" ? (
            <div className="mt-1">
              <h1 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                STARTS IN {daysUntilStart} {daysUntilStart === 1 ? "DAY" : "DAYS"}
              </h1>
              <p className="text-xs text-[#8D95A5] mt-0.5">
                Challenge begins on {arc ? formatDisplayDate(arc.start_date) : "soon"}
              </p>
            </div>
          ) : arcStatus === "completed" ? (
            <div className="mt-1">
              <h1 className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
                ARC COMPLETED 👑
              </h1>
              <p className="text-xs text-[#8D95A5] mt-0.5">
                All {totalDays} days conquered. Legendary discipline.
              </p>
            </div>
          ) : (
            <div className="mt-1">
              <h1 className="text-3xl sm:text-4xl font-black text-[#F5F7FA] tracking-tight">
                DAY {currentDay} / {totalDays}
              </h1>
              <p className="text-xs text-[#8D95A5] mt-0.5">
                {arc?.name || "Winter Arc"} • {tz}
              </p>
            </div>
          )}
        </div>

        {/* Motivational Status Note (Non-punitive data-driven) */}
        <div className="text-xs sm:text-right text-[#8D95A5] font-medium">
          {todayMetric.perfectDay ? (
            <span className="text-emerald-400 font-bold flex items-center sm:justify-end gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              All disciplines completed today. Perfect standard.
            </span>
          ) : arcStatus === "upcoming" ? (
            <span className="text-amber-400 font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              Prepare your mindset. Discipline starts on Day 1.
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
      <div className="space-y-1.5 relative z-10">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 relative z-10">
        {/* Today Completion */}
        <div className="bg-[#10131A] border border-white/[0.06] rounded-2xl p-4 transition-colors hover:border-white/[0.12]">
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
        <div className="bg-[#10131A] border border-white/[0.06] rounded-2xl p-4 transition-colors hover:border-white/[0.12]">
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
        <div className="col-span-2 sm:col-span-1 bg-[#10131A] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-white/[0.12]">
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
