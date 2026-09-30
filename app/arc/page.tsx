"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HabitFormModal } from "@/components/habits/HabitFormModal";
import { Habit, HabitType } from "@/types/database";
import { formatDisplayDate } from "@/lib/utils";
import {
  Compass,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Flame,
  CheckCircle2,
  Lock,
  Award,
  Sparkles,
} from "lucide-react";

export default function ArcPage() {
  const { arc, hasActiveArc, habits, metrics, addHabit, updateHabit, deleteHabit, isLoading } = useArc();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          Loading your Arc roadmap...
        </p>
      </div>
    );
  }

  if (!hasActiveArc || !arc) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#151922] border border-sky-500/20 flex items-center justify-center text-4xl shadow-2xl">
          🗺️
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#8ED8FF] px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
            NO ACTIVE ARC
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Arc hasn&apos;t started yet.
          </h1>
          <p className="text-sm text-slate-400">
            Build your first Arc to unlock your transformation timeline and milestone tracking.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="px-8 py-3.5 rounded-2xl bg-[#8ED8FF] hover:bg-[#a2e0ff] text-[#080A0F] font-black text-sm tracking-wide transition-all shadow-lg shadow-[#8ED8FF]/20"
        >
          CREATE YOUR ARC
        </Link>
      </div>
    );
  }

  const activeHabits = habits.filter((h) => h.is_active);
  const { currentDay, totalDays, currentStreak, arcStatus, daysUntilStart } = metrics;
  const progressPercent = totalDays > 0 ? Math.min(100, Math.round((currentDay / totalDays) * 100)) : 0;

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSave = (data: Partial<Habit> & { name: string; habit_type: HabitType }) => {
    if (editingHabit) {
      updateHabit({ ...data, id: editingHabit.id });
    } else {
      addHabit(data);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title & Challenge Header */}
      <div>
        <div className="text-xs font-bold text-[#8ED8FF] uppercase tracking-widest flex items-center gap-1.5">
          <span>❄️</span>
          <span>Personal Transformation Journey</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F5F7FA] tracking-tight mt-1 uppercase">
          {arc.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#8D95A5] mt-1">
          {formatDisplayDate(arc.start_date)} → {formatDisplayDate(arc.end_date)} • {totalDays} Days of Relentless Commitment
        </p>
      </div>

      {/* 1. THE JOURNEY MAP (Section 15) */}
      <Card className="p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
              Current Position
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#F5F7FA] mt-0.5">
              DAY {currentDay} / {totalDays}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{currentStreak} DAY STREAK</span>
            </span>
          </div>
        </div>

        {/* Visual Timeline Bar */}
        <div className="relative pt-6 pb-2">
          {/* Base track */}
          <div className="w-full bg-[#10131A] rounded-full h-3 border border-white/[0.08] relative overflow-hidden">
            <div
              className="bg-[#8ED8FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Current Day Pointer Pin */}
          <div
            className="absolute top-0 -ml-3 flex flex-col items-center pointer-events-none transition-all duration-500"
            style={{ left: `${Math.min(95, Math.max(5, progressPercent))}%` }}
          >
            <span className="text-[10px] font-black text-[#080A0F] bg-[#8ED8FF] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1">
              YOU ARE HERE
            </span>
            <div className="w-3.5 h-3.5 rounded-full bg-[#8ED8FF] ring-4 ring-[#080A0F]" />
          </div>

          {/* Timeline Milestones Markers */}
          <div className="flex justify-between text-xs font-bold text-[#8D95A5] pt-3">
            <span>Day 1</span>
            <span className="text-center">Day 30</span>
            <span className="text-center">Day 60</span>
            <span className="text-right">Day 90</span>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
          {/* 30 Day */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentDay >= 30
                ? "bg-[#10131A] border-emerald-500/30 text-emerald-300"
                : "bg-[#10131A]/60 border-white/[0.06] text-[#8D95A5]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">30 Days</span>
              {currentDay >= 30 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-xs">○</span>
              )}
            </div>
            <div className="font-extrabold text-sm text-[#F5F7FA] mt-1">Foundation Arc</div>
            <div className="text-[11px] text-[#8D95A5] mt-0.5">+500 XP Milestone</div>
          </div>

          {/* 60 Day */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentDay >= 60
                ? "bg-[#10131A] border-emerald-500/30 text-emerald-300"
                : "bg-[#10131A]/60 border-white/[0.06] text-[#8D95A5]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">60 Days</span>
              {currentDay >= 60 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-xs">○</span>
              )}
            </div>
            <div className="font-extrabold text-sm text-[#F5F7FA] mt-1">Ascent Milestone</div>
            <div className="text-[11px] text-[#8D95A5] mt-0.5">+1,000 XP Milestone</div>
          </div>

          {/* 90 Day */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentDay >= 90
                ? "bg-[#10131A] border-emerald-500/30 text-emerald-300"
                : "bg-[#10131A]/60 border-white/[0.06] text-[#8D95A5]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">90 Days</span>
              {currentDay >= 90 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="font-extrabold text-sm text-[#F5F7FA] mt-1">Winter Legend</div>
            <div className="text-[11px] text-[#8D95A5] mt-0.5">+2,000 XP Complete</div>
          </div>
        </div>
      </Card>

      {/* 2. ACTIVE DISCIPLINES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">
              Active Disciplines ({activeHabits.length} / 10)
            </h2>
            <p className="text-xs text-[#8D95A5]">
              Up to 10 active habits. Customize targets, units, and reminders.
            </p>
          </div>

          {activeHabits.length < 10 && (
            <Button size="sm" variant="primary" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4" />
              <span>Add Habit</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeHabits.map((habit) => (
            <Card key={habit.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-[#10131A] border border-white/[0.08]">
                      {habit.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#F5F7FA]">{habit.name}</h4>
                      <p className="text-[11px] text-[#8ED8FF] font-semibold uppercase mt-0.5">
                        {habit.habit_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1 rounded text-[#8D95A5] hover:text-[#F5F7FA]"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 rounded text-[#8D95A5] hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {habit.description && (
                  <p className="text-xs text-[#8D95A5] mt-2.5 line-clamp-1">
                    {habit.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8D95A5]">
                <span>
                  Target: {habit.target_value ?? "Yes"} {habit.target_unit ?? ""}
                </span>
                <span>
                  {habit.reminder_enabled ? `Reminder: ${habit.reminder_time?.slice(0, 5)}` : "No reminder"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialHabit={editingHabit}
        currentHabitsCount={activeHabits.length}
      />
    </div>
  );
}
