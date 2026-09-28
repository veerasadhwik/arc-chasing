"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Arc, Habit, HabitLog, Achievement, UserAchievement, HabitType } from "@/types/database";
import { StorageRepository } from "@/lib/storage/repository";
import { calculateArcMetrics, ArcCalculatedStats } from "@/lib/calculations/engine";
import { getLevelProgress, getTodayDateString, addDays } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ArcContextType {
  arc: Arc;
  habits: Habit[];
  logs: HabitLog[];
  metrics: ArcCalculatedStats;
  totalXp: number;
  levelInfo: { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number };
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  isLoading: boolean;
  toggleHabit: (habitId: string, date?: string) => Promise<{ xpAwarded: number; isPerfectDay: boolean }>;
  setHabitValue: (habitId: string, value: number, date?: string) => Promise<{ xpAwarded: number; isPerfectDay: boolean }>;
  addHabit: (habit: Partial<Habit> & { name: string; habit_type: HabitType }) => void;
  updateHabit: (habit: Partial<Habit> & { id: string; name: string; habit_type: HabitType }) => void;
  deleteHabit: (habitId: string) => void;
  createNewArc: (name: string, durationDays: number, startDate: string, habitsList: Array<Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">>) => void;
  triggerConfetti: () => void;
  refresh: () => void;
}

const ArcContext = createContext<ArcContextType | null>(null);

export function ArcProvider({ children }: { children: React.ReactNode }) {
  const [arc, setArc] = useState<Arc>(StorageRepository.getArc());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [totalXp, setTotalXp] = useState<number>(840);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    StorageRepository.initialize();
    const currentArc = StorageRepository.getArc();
    const currentHabits = StorageRepository.getHabits();
    const currentLogs = StorageRepository.getHabitLogs();
    const currentXp = StorageRepository.getTotalXP();
    const achs = StorageRepository.getAchievements();
    const uAchs = StorageRepository.getUserAchievements();

    setArc(currentArc);
    setHabits(currentHabits);
    setLogs(currentLogs);
    setTotalXp(currentXp);
    setAchievements(achs);
    setUserAchievements(uAchs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = calculateArcMetrics(arc, habits, logs);
  const levelInfo = getLevelProgress(totalXp);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#7dd3fc", "#e0f2fe", "#f59e0b", "#10b981"],
      });
    } catch {
      // Ignore if canvas-confetti fails
    }
  };

  const toggleHabit = async (habitId: string, date: string = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return { xpAwarded: 0, isPerfectDay: false };

    const existingLog = logs.find((l) => l.habit_id === habitId && l.log_date === date);
    const newCompleted = !(existingLog?.completed ?? false);
    const value = newCompleted && habit.target_value ? habit.target_value : (newCompleted ? 1 : 0);

    const result = StorageRepository.logHabit(habitId, date, newCompleted, value);
    if (result.isPerfectDay) {
      triggerConfetti();
    }

    loadData();
    return result;
  };

  const setHabitValue = async (habitId: string, value: number, date: string = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return { xpAwarded: 0, isPerfectDay: false };

    const target = habit.target_value ?? 1;
    const completed = value >= target;

    const result = StorageRepository.logHabit(habitId, date, completed, value);
    if (result.isPerfectDay) {
      triggerConfetti();
    }

    loadData();
    return result;
  };

  const addHabit = (habitData: Partial<Habit> & { name: string; habit_type: HabitType }) => {
    StorageRepository.addOrUpdateHabit(habitData);
    loadData();
  };

  const updateHabit = (habitData: Partial<Habit> & { id: string; name: string; habit_type: HabitType }) => {
    StorageRepository.addOrUpdateHabit(habitData);
    loadData();
  };

  const deleteHabit = (habitId: string) => {
    StorageRepository.deleteHabit(habitId);
    loadData();
  };

  const createNewArc = (
    name: string,
    durationDays: number,
    startDate: string,
    habitsList: Array<Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">>
  ) => {
    const newArc: Arc = {
      id: `arc-${Date.now()}`,
      user_id: StorageRepository.getProfile().id,
      name,
      duration_days: durationDays,
      start_date: startDate,
      end_date: addDays(startDate, durationDays),
      status: "active",
      privacy: "private",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newHabits: Habit[] = habitsList.slice(0, 10).map((h, i) => ({
      ...h,
      id: `habit-${Date.now()}-${i}`,
      arc_id: newArc.id,
      sort_order: i + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    StorageRepository.saveArc(newArc);
    StorageRepository.saveHabits(newHabits);
    StorageRepository.saveHabitLogs([]); // Fresh start for new challenge!

    triggerConfetti();
    loadData();
  };

  return (
    <ArcContext.Provider
      value={{
        arc,
        habits,
        logs,
        metrics,
        totalXp,
        levelInfo,
        achievements,
        userAchievements,
        isLoading,
        toggleHabit,
        setHabitValue,
        addHabit,
        updateHabit,
        deleteHabit,
        createNewArc,
        triggerConfetti,
        refresh: loadData,
      }}
    >
      {children}
    </ArcContext.Provider>
  );
}

export function useArc() {
  const ctx = useContext(ArcContext);
  if (!ctx) {
    throw new Error("useArc must be used within an ArcProvider");
  }
  return ctx;
}
