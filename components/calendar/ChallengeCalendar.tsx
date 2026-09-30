"use client";

import React, { useState } from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DayMetric } from "@/lib/calculations/engine";
import { DayDetailModal } from "./DayDetailModal";
import { cn, formatDisplayDate } from "@/lib/utils";
import { Calendar, CheckCircle2, ChevronRight, Flame } from "lucide-react";

export function ChallengeCalendar() {
  const { metrics, habits, arc, hasActiveArc, isLoading } = useArc();
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<DayMetric | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          Loading challenge calendar...
        </p>
      </div>
    );
  }

  if (!hasActiveArc || !arc) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#151922] border border-sky-500/20 flex items-center justify-center text-3xl shadow-xl">
          📅
        </div>
        <div className="space-y-1.5">
          <h3 className="text-2xl font-black text-white">Your Arc hasn&apos;t started yet.</h3>
          <p className="text-xs text-slate-400">
            Build your first Arc to generate your interactive daily discipline calendar.
          </p>
        </div>
        <a
          href="/onboarding"
          className="px-6 py-3 rounded-xl bg-[#8ED8FF] hover:bg-[#a2e0ff] text-[#080A0F] font-black text-xs tracking-wide transition-all shadow-md shadow-[#8ED8FF]/20"
        >
          CREATE YOUR ARC
        </a>
      </div>
    );
  }

  const { calendarGrid, currentDay, totalDays, currentStreak, perfectDaysCount } = metrics;

  return (
    <div className="space-y-6">
      {/* Calendar Header stats */}
      <div className="glass-panel rounded-3xl p-6 border border-sky-500/20 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-400" />
            {t("calendar.title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {formatDisplayDate(arc.start_date)} → {formatDisplayDate(arc.end_date)} • {totalDays} Days of Record
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm" />
            <span>{t("calendar.legendPerfect")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500/90 shadow-sm" />
            <span>{t("calendar.legendPartial")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500/80 shadow-sm" />
            <span>{t("calendar.legendMissed")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700 shadow-sm" />
            <span>{t("calendar.legendUpcoming")}</span>
          </div>
        </div>
      </div>

      {/* 90-Day Visual Grid */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-950/70">
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2.5 sm:gap-3">
          {calendarGrid.map((day) => {
            const isToday = day.dayNumber === currentDay;

            const statusColors = {
              perfect:
                "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30",
              partial:
                "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25",
              missed:
                "bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25",
              future:
                "bg-slate-900/60 text-slate-600 border-slate-800/80 hover:border-slate-700 hover:text-slate-400",
            };

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 select-none group relative",
                  statusColors[day.status],
                  isToday &&
                    "ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10 shadow-lg shadow-sky-500/20 font-bold"
                )}
              >
                {/* Day number */}
                <span className="text-xs font-black">D{day.dayNumber}</span>

                {/* Status indicator / completion badge */}
                <span className="text-[10px] font-bold mt-1 opacity-90">
                  {day.status === "future" ? (
                    "•"
                  ) : day.status === "perfect" ? (
                    "100%"
                  ) : (
                    `${day.completionPercentage}%`
                  )}
                </span>

                {/* Today star tag */}
                {isToday && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-sky-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          habits={habits}
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
