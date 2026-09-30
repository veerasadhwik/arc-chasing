"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Arc, Habit, HabitLog, Achievement, UserAchievement, HabitType } from "@/types/database";
import { StorageRepository } from "@/lib/storage/repository";
import { useAuth } from "@/lib/auth/AuthContext";
import { calculateArcMetrics, ArcCalculatedStats } from "@/lib/calculations/engine";
import { getLevelProgress, getTodayDateString, addDays } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ArcContextType {
  arc: Arc | null;
  hasActiveArc: boolean;
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
  createNewArc: (
    name: string,
    durationDays: number,
    startDate: string,
    habitsList: Array<Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">>
  ) => { arc: Arc; habits: Habit[] } | null;
  triggerConfetti: () => void;
  refresh: () => void;
}

const ArcContext = createContext<ArcContextType | null>(null);

export function ArcProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [arc, setArc] = useState<Arc | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    StorageRepository.initialize();
    const achs = StorageRepository.getAchievements();
    setAchievements(achs);

    if (!user) {
      setArc(null);
      setHabits([]);
      setLogs([]);
      setTotalXp(0);
      setUserAchievements([]);
      setIsLoading(false);
      return;
    }

    const activeArc = StorageRepository.getActiveArc(user.id);
    setArc(activeArc);

    if (activeArc) {
      const currentHabits = StorageRepository.getHabits(activeArc.id);
      const userLogs = StorageRepository.getUserHabitLogs(user.id);
      setHabits(currentHabits);
      setLogs(userLogs);
    } else {
      setHabits([]);
      setLogs([]);
    }

    const currentXp = StorageRepository.getUserXP(user.id);
    const uAchs = StorageRepository.getUserAchievements(user.id);

    setTotalXp(currentXp);
    setUserAchievements(uAchs);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = calculateArcMetrics(arc, habits, logs);
  const levelInfo = getLevelProgress(totalXp);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8ED8FF", "#38bdf8", "#10b981", "#f59e0b"],
      });
    } catch {
      // Ignore if canvas-confetti fails
    }
  };

  const toggleHabit = async (habitId: string, date: string = getTodayDateString()) => {
    if (!user || !arc) return { xpAwarded: 0, isPerfectDay: false };

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return { xpAwarded: 0, isPerfectDay: false };

    const existingLog = logs.find((l) => l.habit_id === habitId && l.log_date === date);
    const newCompleted = !(existingLog?.completed ?? false);
    const value =
      newCompleted && habit.target_value ? habit.target_value : newCompleted ? 1 : 0;

    const result = StorageRepository.logHabit(
      user.id,
      arc.id,
      habitId,
      date,
      newCompleted,
      value
    );

    if (result.isPerfectDay) {
      triggerConfetti();
    }

    loadData();
    return result;
  };

  const setHabitValue = async (
    habitId: string,
    value: number,
    date: string = getTodayDateString()
  ) => {
    if (!user || !arc) return { xpAwarded: 0, isPerfectDay: false };

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return { xpAwarded: 0, isPerfectDay: false };

    const target = habit.target_value ?? 1;
    const completed = value >= target;

    const result = StorageRepository.logHabit(
      user.id,
      arc.id,
      habitId,
      date,
      completed,
      value
    );

    if (result.isPerfectDay) {
      triggerConfetti();
    }

    loadData();
    return result;
  };

  const addHabit = (habitData: Partial<Habit> & { name: string; habit_type: HabitType }) => {
    if (!arc) return;
    StorageRepository.addOrUpdateHabit(arc.id, habitData);
    loadData();
  };

  const updateHabit = (habitData: Partial<Habit> & { id: string; name: string; habit_type: HabitType }) => {
    if (!arc) return;
    StorageRepository.addOrUpdateHabit(arc.id, habitData);
    loadData();
  };

  const deleteHabit = (habitId: string) => {
    if (!arc) return;
    StorageRepository.deleteHabit(arc.id, habitId);
    loadData();
  };

  const createNewArc = (
    name: string,
    durationDays: number,
    startDate: string,
    habitsList: Array<Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">>
  ) => {
    if (!user) return null;

    const calculatedEndDate = addDays(startDate, durationDays - 1);
    const result = StorageRepository.createArc(
      user.id,
      {
        name,
        duration_days: durationDays,
        start_date: startDate,
        end_date: calculatedEndDate,
        status: "active",
        privacy: "private",
      },
      habitsList
    );

    triggerConfetti();
    loadData();
    return result;
  };

  return (
    <ArcContext.Provider
      value={{
        arc,
        hasActiveArc: !!arc,
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

