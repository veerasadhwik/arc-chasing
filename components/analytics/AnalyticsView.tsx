"use client";

import React from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Flame, Trophy, CheckCircle, XCircle, TrendingUp, BarChart2, Calendar } from "lucide-react";

export function AnalyticsView() {
  const { metrics, habits, totalXp, levelInfo } = useArc();
  const { t } = useLanguage();

  const {
    currentStreak,
    longestStreak,
    perfectDaysCount,
    overallCompletionRate,
    currentDay,
    totalDays,
    missedDaysCount,
    habitStats,
    calendarGrid,
  } = metrics;

  // Last 14 days trend data for the visual sparkline / bars
  const recentDays = calendarGrid
    .filter((d) => d.dayNumber <= currentDay)
    .slice(-14);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t("analytics.overallRate")}</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">{overallCompletionRate}%</div>
            <div className="mt-2">
              <ProgressBar value={overallCompletionRate} variant="gradient" size="sm" />
            </div>
          </div>
        </Card>

        {/* Current & Longest Streak */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t("analytics.currentStreak")}</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-300">{currentStreak} <span className="text-sm font-semibold text-slate-400">days</span></div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">
              Longest: <strong className="text-slate-200">{longestStreak} days</strong>
            </div>
          </div>
        </Card>

        {/* Perfect Days */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{t("analytics.perfectDays")}</span>
            <Trophy className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-sky-300">{perfectDaysCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">
              100% Habit Completion
            </div>
          </div>
        </Card>

        {/* Total XP & Level */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Level & XP</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-indigo-300">L{levelInfo.level}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">
              {totalXp.toLocaleString()} XP Total
            </div>
          </div>
        </Card>
      </div>

      {/* 14-Day Completion Trend Visual Bar Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Recent 14-Day Consistency</h3>
            <p className="text-xs text-slate-400">Daily habit execution performance</p>
          </div>
          <div className="text-xs font-bold text-sky-400 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
            Day {currentDay} / {totalDays}
          </div>
        </div>

        <div className="h-36 flex items-end justify-between gap-1.5 sm:gap-2 pt-6 pb-2">
          {recentDays.map((d) => {
            const heightPct = Math.max(12, d.completionPercentage);
            const isToday = d.dayNumber === currentDay;

            return (
              <div key={d.dayNumber} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.completionPercentage}%
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 relative ${
                    d.status === "perfect"
                      ? "bg-gradient-to-t from-emerald-500 to-teal-400"
                      : d.status === "partial"
                      ? "bg-gradient-to-t from-amber-500 to-yellow-400"
                      : "bg-rose-500/60"
                  } ${isToday ? "ring-2 ring-sky-400" : ""}`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className={`text-[10px] font-bold ${isToday ? "text-sky-400" : "text-slate-500"}`}>
                  D{d.dayNumber}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Habit-by-Habit Detailed Performance */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-400" />
          {t("analytics.habitBreakdown")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.filter((h) => h.is_active).map((habit) => {
            const stat = habitStats[habit.id] || {
              currentStreak: 0,
              longestStreak: 0,
              completedDays: 0,
              totalDays: currentDay,
              completionRate: 0,
            };

            return (
              <Card key={habit.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700">
                      {habit.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                        {habit.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Target: {habit.target_value ?? "Yes"} {habit.target_unit ?? ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-sky-300">
                      {stat.completionRate}%
                    </span>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      Completion
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar value={stat.completionRate} variant="frost" size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {stat.currentStreak}d
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Current</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{stat.longestStreak}d</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Longest</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400">
                      {stat.completedDays} / {stat.totalDays}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Days Hit</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
