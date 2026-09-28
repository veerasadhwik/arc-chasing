"use client";

import React, { useState } from "react";
import { Habit, HabitLog } from "@/types/database";
import { isHabitCompleted, cn } from "@/lib/utils";
import { Check, Flame, Clock, Plus, Minus, Edit3, Trash2 } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  currentStreak?: number;
  onToggle: () => void;
  onSetValue: (val: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HabitCard({
  habit,
  log,
  currentStreak = 0,
  onToggle,
  onSetValue,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const completed = isHabitCompleted(habit, log);
  const [showXpBadge, setShowXpBadge] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState<string>(
    log?.value !== null && log?.value !== undefined ? String(log.value) : ""
  );

  const targetVal = habit.target_value ?? 1;
  const currentVal = log?.value ?? (completed ? targetVal : 0);
  const progressPercent = Math.min(
    100,
    Math.round((currentVal / (targetVal || 1)) * 100)
  );

  const handleToggleClick = () => {
    if (!completed) {
      setShowXpBadge(true);
      setTimeout(() => setShowXpBadge(false), 1200);
    }
    onToggle();
  };

  const handleValueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempValue);
    if (!isNaN(parsed)) {
      if (parsed >= targetVal && !completed) {
        setShowXpBadge(true);
        setTimeout(() => setShowXpBadge(false), 1200);
      }
      onSetValue(parsed);
      setIsEditingValue(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-[#151922] border rounded-2xl p-4 sm:p-5 transition-all duration-200 relative group",
        completed
          ? "border-[#8ED8FF]/20 bg-[#151922]"
          : "border-white/[0.08] hover:border-white/[0.16]"
      )}
    >
      {/* Floating +10 XP Micro-Animation */}
      {showXpBadge && (
        <div className="absolute right-6 -top-2 z-20 pointer-events-none animate-float-xp">
          <span className="px-2 py-0.5 rounded-full bg-[#8ED8FF] text-[#080A0F] font-black text-xs shadow-lg">
            +10 XP
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon & Habit Details */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform",
              completed ? "bg-white/[0.06] text-[#F5F7FA]" : "bg-white/[0.03] text-[#8D95A5]"
            )}
          >
            {habit.icon || "❄️"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  "font-bold text-sm sm:text-base tracking-tight truncate",
                  completed ? "text-[#F5F7FA]" : "text-[#F5F7FA]"
                )}
              >
                {habit.name}
              </h4>

              {/* Individual Streak indicator */}
              {currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {currentStreak}d
                </span>
              )}
            </div>

            {/* Target and Measurement Details */}
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8D95A5]">
              {habit.habit_type === "boolean" && (
                <span>Done / Not Done</span>
              )}

              {habit.habit_type === "number" && (
                <span className="text-[#8ED8FF] font-semibold">
                  {currentVal.toLocaleString()} / {targetVal.toLocaleString()} {habit.target_unit || "units"}
                </span>
              )}

              {habit.habit_type === "duration" && (
                <span className="text-[#8ED8FF] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentVal} / {targetVal} {habit.target_unit || "min"}
                </span>
              )}

              {habit.habit_type === "time" && (
                <span className="text-[#8ED8FF] font-semibold">
                  Target: {habit.target_value ? `${habit.target_value}:00` : ""} {habit.target_unit || ""}
                </span>
              )}

              {habit.habit_type === "percentage" && (
                <span className="text-[#8ED8FF] font-semibold">
                  {currentVal}% / {targetVal}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Rapid Action Button (○ -> ✓) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleClick}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 select-none",
              completed
                ? "bg-[#8ED8FF] text-[#080A0F] font-bold shadow-sm shadow-[#8ED8FF]/20 active:scale-95"
                : "border border-white/[0.15] text-transparent hover:border-white/[0.3] hover:text-white/20 active:scale-95"
            )}
            aria-label={`Toggle habit ${habit.name}`}
          >
            <Check className={cn("w-4 h-4 stroke-[3]", completed ? "opacity-100" : "opacity-0")} />
          </button>
        </div>
      </div>

      {/* Steppers for Number & Duration types: [ − ] value [ + ] */}
      {(habit.habit_type === "number" || habit.habit_type === "duration") && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="w-full bg-[#10131A] rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                completed ? "bg-[#8ED8FF]" : "bg-[#8ED8FF]/70"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Controls: [ − ] value [ + ] */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onSetValue(
                    Math.max(0, currentVal - (habit.habit_type === "number" ? 1000 : 15))
                  )
                }
                className="w-7 h-7 rounded-lg bg-[#10131A] hover:bg-white/[0.05] border border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA] font-bold flex items-center justify-center transition-colors"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="px-2.5 py-1 rounded-lg bg-[#10131A] border border-white/[0.06] text-xs font-mono font-bold text-[#F5F7FA]">
                {currentVal.toLocaleString()}
              </span>

              <button
                onClick={() => {
                  const nextVal = currentVal + (habit.habit_type === "number" ? 1000 : 15);
                  if (nextVal >= targetVal && !completed) {
                    setShowXpBadge(true);
                    setTimeout(() => setShowXpBadge(false), 1200);
                  }
                  onSetValue(nextVal);
                }}
                className="w-7 h-7 rounded-lg bg-[#10131A] hover:bg-white/[0.05] border border-white/[0.08] text-[#8ED8FF] hover:text-white font-bold flex items-center justify-center transition-colors"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>

              <button
                onClick={() => {
                  if (!completed) {
                    setShowXpBadge(true);
                    setTimeout(() => setShowXpBadge(false), 1200);
                  }
                  onSetValue(targetVal);
                }}
                className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-bold text-[#8ED8FF] transition-colors"
              >
                Max
              </button>
            </div>

            {/* Custom value inline */}
            {!isEditingValue ? (
              <button
                onClick={() => {
                  setTempValue(String(currentVal));
                  setIsEditingValue(true);
                }}
                className="text-[11px] text-[#8D95A5] hover:text-[#8ED8FF] font-medium"
              >
                Edit
              </button>
            ) : (
              <form onSubmit={handleValueSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-16 px-1.5 py-0.5 rounded bg-[#10131A] border border-[#8ED8FF]/40 text-[#F5F7FA] text-xs outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 rounded bg-[#8ED8FF] text-[#080A0F] font-bold text-xs"
                >
                  Set
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Hover action bar (Edit/Delete) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-14 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#10131A] rounded-lg p-1 border border-white/[0.08]">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 rounded text-[#8D95A5] hover:text-[#F5F7FA] transition-colors"
              title="Edit Habit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded text-[#8D95A5] hover:text-rose-400 transition-colors"
              title="Delete Habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
