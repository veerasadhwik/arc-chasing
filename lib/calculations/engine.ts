import { Habit, HabitLog, Arc } from "@/types/database";
import { formatDate, addDays, getTodayDateString, isHabitCompleted, getArcTiming } from "@/lib/utils";

export interface DayMetric {
  dayNumber: number;
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionPercentage: number;
  perfectDay: boolean;
  status: "perfect" | "partial" | "missed" | "future";
  logs: Record<string, HabitLog>;
}

export interface HabitStreakStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completedDays: number;
  totalDays: number;
  completionRate: number;
}

export interface ArcCalculatedStats {
  currentDay: number;
  totalDays: number;
  overallCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  perfectDaysCount: number;
  totalHabitsCompleted: number;
  missedDaysCount: number;
  habitStats: Record<string, HabitStreakStats>;
  calendarGrid: DayMetric[];
  todayMetric: DayMetric;
  arcStatus: "none" | "upcoming" | "active" | "completed";
  daysUntilStart: number;
}

/**
 * Pure calculation engine deriving all stats from habit_logs (Source of Truth)
 */
export function calculateArcMetrics(
  arc: Arc | null | undefined,
  habits: Habit[],
  logs: HabitLog[],
  evaluationDate: string = getTodayDateString()
): ArcCalculatedStats {
  const emptyTodayMetric: DayMetric = {
    dayNumber: 0,
    date: evaluationDate,
    totalHabits: 0,
    completedHabits: 0,
    completionPercentage: 0,
    perfectDay: false,
    status: "future",
    logs: {},
  };

  if (!arc) {
    return {
      currentDay: 0,
      totalDays: 0,
      overallCompletionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      perfectDaysCount: 0,
      totalHabitsCompleted: 0,
      missedDaysCount: 0,
      habitStats: {},
      calendarGrid: [],
      todayMetric: emptyTodayMetric,
      arcStatus: "none",
      daysUntilStart: 0,
    };
  }

  const timing = getArcTiming(arc.start_date, arc.end_date, arc.duration_days, evaluationDate);
  const activeHabits = habits.filter((h) => h.is_active);
  const totalHabitsCount = activeHabits.length;

  // Map logs by date -> habit_id -> HabitLog
  const logsByDate: Record<string, Record<string, HabitLog>> = {};
  for (const log of logs) {
    if (!logsByDate[log.log_date]) {
      logsByDate[log.log_date] = {};
    }
    logsByDate[log.log_date][log.habit_id] = log;
  }

  const calendarGrid: DayMetric[] = [];
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let perfectDaysCount = 0;
  let totalHabitsCompleted = 0;
  let pastDaysEvaluated = 0;
  let pastDaysCompletedSum = 0;

  // Habit specific accumulators
  const habitCompletedDays: Record<string, number> = {};
  const habitCurrentStreak: Record<string, number> = {};
  const habitLongestStreak: Record<string, number> = {};
  const habitTempStreak: Record<string, number> = {};

  activeHabits.forEach((h) => {
    habitCompletedDays[h.id] = 0;
    habitCurrentStreak[h.id] = 0;
    habitLongestStreak[h.id] = 0;
    habitTempStreak[h.id] = 0;
  });

  const startDate = arc.start_date;
  const duration = arc.duration_days;
  const evalDateTime = new Date(evaluationDate + "T00:00:00").getTime();
  const startDateTime = new Date(startDate + "T00:00:00").getTime();

  const currentDay = timing.currentDay;

  for (let i = 0; i < duration; i++) {
    const dayDate = addDays(startDate, i);
    const dayDateTime = new Date(dayDate + "T00:00:00").getTime();
    const isFuture = dayDateTime > evalDateTime || timing.status === "upcoming";
    const isPastOrToday = dayDateTime <= evalDateTime && timing.status !== "upcoming";

    const dayLogs = logsByDate[dayDate] || {};
    let completedCount = 0;

    activeHabits.forEach((habit) => {
      const log = dayLogs[habit.id];
      const completed = isHabitCompleted(habit, log);

      if (completed) {
        completedCount++;
        totalHabitsCompleted++;
        if (isPastOrToday) {
          habitCompletedDays[habit.id] = (habitCompletedDays[habit.id] || 0) + 1;
        }
      }

      // Habit streak calculation
      if (isPastOrToday) {
        if (completed) {
          habitTempStreak[habit.id] = (habitTempStreak[habit.id] || 0) + 1;
          if (habitTempStreak[habit.id] > (habitLongestStreak[habit.id] || 0)) {
            habitLongestStreak[habit.id] = habitTempStreak[habit.id];
          }
        } else if (dayDate !== evaluationDate) {
          // If missed in the past, streak resets
          habitTempStreak[habit.id] = 0;
        }
      }
    });

    const completionPercentage =
      totalHabitsCount > 0 ? Math.round((completedCount / totalHabitsCount) * 100) : 0;
    const perfectDay = totalHabitsCount > 0 && completedCount === totalHabitsCount;

    let status: "perfect" | "partial" | "missed" | "future" = "future";
    if (isFuture) {
      status = "future";
    } else if (perfectDay) {
      status = "perfect";
    } else if (completedCount > 0) {
      status = "partial";
    } else {
      status = "missed";
    }

    if (isPastOrToday) {
      pastDaysEvaluated++;
      pastDaysCompletedSum += completionPercentage;

      if (perfectDay) {
        perfectDaysCount++;
      }

      // Challenge streak: Day is considered successful if at least 1 habit completed or > 50%
      const daySuccessful = completedCount > 0;
      if (daySuccessful) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (dayDate !== evaluationDate) {
        // Interrupted on a past missed day
        tempStreak = 0;
      }
    }

    calendarGrid.push({
      dayNumber: i + 1,
      date: dayDate,
      totalHabits: totalHabitsCount,
      completedHabits: completedCount,
      completionPercentage,
      perfectDay,
      status,
      logs: dayLogs,
    });
  }

  // Final current streaks
  currentStreak = tempStreak;
  activeHabits.forEach((h) => {
    habitCurrentStreak[h.id] = habitTempStreak[h.id] || 0;
  });

  const overallCompletionRate =
    pastDaysEvaluated > 0 ? Math.round(pastDaysCompletedSum / pastDaysEvaluated) : 0;

  // Build habit stats dictionary
  const habitStats: Record<string, HabitStreakStats> = {};
  activeHabits.forEach((h) => {
    const completedDays = habitCompletedDays[h.id] || 0;
    habitStats[h.id] = {
      habitId: h.id,
      currentStreak: habitCurrentStreak[h.id] || 0,
      longestStreak: habitLongestStreak[h.id] || 0,
      completedDays,
      totalDays: pastDaysEvaluated,
      completionRate:
        pastDaysEvaluated > 0 ? Math.round((completedDays / pastDaysEvaluated) * 100) : 0,
    };
  });

  const todayIndex = currentDay > 0 ? Math.min(currentDay - 1, calendarGrid.length - 1) : 0;
  const todayMetric = calendarGrid[todayIndex] || {
    dayNumber: currentDay,
    date: evaluationDate,
    totalHabits: totalHabitsCount,
    completedHabits: 0,
    completionPercentage: 0,
    perfectDay: false,
    status: timing.status === "upcoming" ? "future" : "missed",
    logs: {},
  };

  const missedDaysCount = calendarGrid.filter(
    (d) => d.status === "missed" && d.dayNumber <= currentDay
  ).length;

  return {
    currentDay,
    totalDays: duration,
    overallCompletionRate,
    currentStreak,
    longestStreak,
    perfectDaysCount,
    totalHabitsCompleted,
    missedDaysCount,
    habitStats,
    calendarGrid,
    todayMetric,
    arcStatus: timing.status,
    daysUntilStart: timing.daysUntilStart,
  };
}
