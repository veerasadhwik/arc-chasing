"use client";

import React, { useState } from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DailyScoreCard } from "@/components/dashboard/DailyScoreCard";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitFormModal } from "@/components/habits/HabitFormModal";
import { Button } from "@/components/ui/Button";
import { Habit, HabitType } from "@/types/database";
import { getTodayDateString } from "@/lib/utils";
import { Plus, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const {
    habits,
    logs,
    metrics,
    toggleHabit,
    setHabitValue,
    addHabit,
    updateHabit,
    deleteHabit,
  } = useArc();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayStr = getTodayDateString();
  const activeHabits = habits.filter((h) => h.is_active);

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSaveHabit = (data: Partial<Habit> & { name: string; habit_type: HabitType }) => {
    if (editingHabit) {
      updateHabit({ ...data, id: editingHabit.id });
    } else {
      addHabit(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Daily Score Header */}
      <DailyScoreCard />

      {/* AI Coach Pattern Analysis Banner */}
      <AiInsightCard />

      {/* Active Disciplines List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{t("dashboard.todayHabits")}</span>
              <span className="text-xs font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                {activeHabits.length} / 10 Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click to complete or adjust values. Data syncs instantly as your source of truth.
            </p>
          </div>

          {activeHabits.length < 10 && (
            <Button size="sm" variant="frost" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Discipline</span>
            </Button>
          )}
        </div>

        {/* Habit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeHabits.map((habit) => {
            const todayLog = logs.find(
              (l) => l.habit_id === habit.id && l.log_date === todayStr
            );
            const habitStreak = metrics.habitStats[habit.id]?.currentStreak || 0;

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={todayLog}
                currentStreak={habitStreak}
                onToggle={() => toggleHabit(habit.id, todayStr)}
                onSetValue={(val) => setHabitValue(habit.id, val, todayStr)}
                onEdit={() => handleOpenEdit(habit)}
                onDelete={() => deleteHabit(habit.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Modal for adding/editing habit */}
      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
        currentHabitsCount={activeHabits.length}
      />
    </div>
  );
}
