import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Habit, HabitLog } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Returns YYYY-MM-DD for a given date in the specified (or browser) timezone
 */
export function formatDate(date: Date | string, timezone?: string): string {
  const tz = timezone || getBrowserTimezone();
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export function formatDisplayDate(dateStr: string, locale: string = "en-US"): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatLocalTime(
  date: Date = new Date(),
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    return date.toLocaleTimeString(locale, options || {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function getTodayDateString(timezone?: string): string {
  return formatDate(new Date(), timezone);
}

/**
 * Parse YYYY-MM-DD strictly as local midnight
 */
export function parseDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Difference in calendar days: (dateB - dateA)
 */
export function diffInDays(dateStrA: string, dateStrB: string): number {
  const dA = parseDate(dateStrA);
  const dB = parseDate(dateStrB);
  const msDiff = dB.getTime() - dA.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Add days to YYYY-MM-DD safely handling month boundaries & leap years
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface ArcTiming {
  status: "upcoming" | "active" | "completed";
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  daysUntilStart: number;
  isTodayStart: boolean;
  progressPercent: number;
}

export function getArcTiming(
  startDateStr: string,
  endDateStr: string,
  durationDays: number,
  todayStr: string = getTodayDateString()
): ArcTiming {
  const daysSinceStart = diffInDays(startDateStr, todayStr);
  const totalDays = durationDays || Math.max(1, diffInDays(startDateStr, endDateStr) + 1);

  if (daysSinceStart < 0) {
    const daysUntilStart = Math.abs(daysSinceStart);
    return {
      status: "upcoming",
      currentDay: 0,
      totalDays,
      daysRemaining: totalDays,
      daysUntilStart,
      isTodayStart: false,
      progressPercent: 0,
    };
  }

  // Day 1 on startDate (daysSinceStart = 0)
  const currentDay = daysSinceStart + 1;

  if (currentDay > totalDays) {
    return {
      status: "completed",
      currentDay: totalDays,
      totalDays,
      daysRemaining: 0,
      daysUntilStart: 0,
      isTodayStart: false,
      progressPercent: 100,
    };
  }

  const daysRemaining = totalDays - currentDay;
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  return {
    status: "active",
    currentDay,
    totalDays,
    daysRemaining,
    daysUntilStart: 0,
    isTodayStart: daysSinceStart === 0,
    progressPercent,
  };
}

export function getDayNumberInArc(startDateStr: string, targetDateStr: string = getTodayDateString()): number {
  const diff = diffInDays(startDateStr, targetDateStr);
  return Math.max(1, diff + 1);
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
    return !!log.completed;
  }
  return !!log.completed;
}

export function getLevelProgress(totalXp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  let level = 1;
  let accumulated = 0;
  let neededForCurrent = 300;

  while (totalXp >= accumulated + neededForCurrent) {
    accumulated += neededForCurrent;
    level++;
    neededForCurrent = level * 300;
  }

  const currentLevelXp = Math.max(0, totalXp - accumulated);
  const nextLevelXp = neededForCurrent;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  };
}
