"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { DayMetric } from "@/lib/calculations/engine";
import { Habit } from "@/types/database";
import { isHabitCompleted, formatDisplayDate } from "@/lib/utils";
import { Check, X, Flame, Calendar, Award } from "lucide-react";

interface DayDetailModalProps {
  day: DayMetric;
  habits: Habit[];
  isOpen: boolean;
  onClose: () => void;
}

export function DayDetailModal({
  day,
  habits,
  isOpen,
  onClose,
}: DayDetailModalProps) {
  const activeHabits = habits.filter((h) => h.is_active);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Day ${day.dayNumber} Overview`}
      description={`${formatDisplayDate(day.date)} • ${day.completedHabits} of ${day.totalHabits} disciplines completed (${day.completionPercentage}%)`}
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            day.status === "perfect"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : day.status === "partial"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : day.status === "missed"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-slate-800/50 border-slate-700 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {day.status === "perfect" ? "💯" : day.status === "partial" ? "⚡" : day.status === "missed" ? "⚠️" : "⏳"}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {day.status === "perfect"
                ? "Perfect Day — All Targets Hit"
                : day.status === "partial"
                ? "Discipline Maintained"
                : day.status === "missed"
                ? "No Disciplines Recorded"
                : "Upcoming Challenge Day"}
            </span>
          </div>

          <span className="text-sm font-black">{day.completionPercentage}%</span>
        </div>

        {/* Habit List for this specific day */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Discipline Breakdown
          </h4>

          {activeHabits.map((habit) => {
            const log = day.logs[habit.id];
            const completed = isHabitCompleted(habit, log);

            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  completed
                    ? "bg-sky-950/20 border-sky-500/30 text-white"
                    : "bg-slate-900/40 border-slate-800/80 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{habit.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {habit.name}
                    </div>
                    {habit.habit_type !== "boolean" && habit.target_value && (
                      <div className="text-[11px] text-sky-400/80">
                        Target: {habit.target_value} {habit.target_unit || ""}
                        {log?.value !== undefined && log?.value !== null ? ` (Logged: ${log.value})` : ""}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    completed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {completed ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
