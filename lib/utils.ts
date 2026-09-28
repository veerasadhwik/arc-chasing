import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Habit, HabitLog } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function formatDisplayDate(dateStr: string, locale: string = "en-US"): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayNumberInArc(startDateStr: string, targetDateStr: string = getTodayDateString()): number {
  const start = new Date(startDateStr + "T00:00:00").getTime();
  const current = new Date(targetDateStr + "T00:00:00").getTime();
  const diffTime = current - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function isHabitCompleted(habit: Habit, log?: HabitLog | null): boolean {
  if (!log) return false;
  if (habit.habit_type === "boolean") {
    return !!log.completed;
  }
  if (habit.habit_type === "number" || habit.habit_type === "duration" || habit.habit_type === "percentage") {
    const target = habit.target_value ?? 1;
    return (log.value ?? 0) >= target;
  }
  if (habit.habit_type === "time") {
    // For time, e.g. target_value 5.0 (5:00 AM) or 23.0 (11:00 PM)
    // If completed is set or log.value <= target_value
    return !!log.completed;
  }
  return !!log.completed;
}

export function getLevelProgress(totalXp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // Level threshold formula: level * 300 XP
  let level = 1;
  let accumulated = 0;
  let neededForCurrent = 300;

  while (totalXp >= accumulated + neededForCurrent) {
    accumulated += neededForCurrent;
    level++;
    neededForCurrent = level * 300;
  }

  const currentLevelXp = totalXp - accumulated;
  const nextLevelXp = neededForCurrent;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  };
}
