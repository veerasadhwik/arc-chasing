"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DailyScoreCard } from "@/components/dashboard/DailyScoreCard";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { QuestBoard } from "@/components/gamification/QuestBoard";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitFormModal } from "@/components/habits/HabitFormModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Habit, HabitType } from "@/types/database";
import { CHALLENGE_TEMPLATES, TemplateDefinition } from "@/lib/storage/mockData";
import { getTodayDateString } from "@/lib/utils";
import { Plus, ArrowRight, Compass, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const {
    arc,
    hasActiveArc,
    habits,
    logs,
    metrics,
    toggleHabit,
    setHabitValue,
    addHabit,
    updateHabit,
    deleteHabit,
    isLoading,
  } = useArc();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

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

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          Loading your Arc vault...
        </p>
      </div>
    );
  }

  // 2. Active Arc Detection: Empty State (Requirement 3)
  if (!hasActiveArc || !arc) {
    return (
      <div className="space-y-12 max-w-4xl mx-auto py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-8 relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Ice / Arc Crest Icon */}
          <div className="w-20 h-20 rounded-3xl bg-[#151922] border border-sky-500/20 flex items-center justify-center text-4xl shadow-2xl relative z-10">
            ❄️
          </div>

          <div className="space-y-3 max-w-lg relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#8ED8FF] px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
              FIRST TIME DISCIPLINE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mt-2">
              Your Arc hasn&apos;t started yet.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
              Build your first Arc. Choose your target duration, set your core habits, and commit to becoming your next version.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto relative z-10">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#8ED8FF] hover:bg-[#a2e0ff] text-[#080A0F] font-black text-sm tracking-wide transition-all shadow-lg shadow-[#8ED8FF]/20 flex items-center justify-center gap-2 group"
            >
              <span>CREATE YOUR ARC</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => setShowTemplatesModal(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#151922] hover:bg-white/[0.06] text-white border border-white/[0.1] font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>EXPLORE TEMPLATES</span>
            </button>
          </div>

          {/* Quick preset cards preview */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-8 max-w-3xl relative z-10 text-left">
            {CHALLENGE_TEMPLATES.slice(0, 3).map((tmpl) => (
              <Link
                key={tmpl.id}
                href={`/onboarding?template=${tmpl.id}`}
                className="bg-[#151922] border border-white/[0.08] hover:border-[#8ED8FF]/40 rounded-2xl p-4 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tmpl.icon}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/[0.04] text-sky-400 border border-white/[0.08]">
                      {tmpl.defaultDurationDays} Days
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-3 group-hover:text-sky-300 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8ED8FF] font-bold">
                  <span>{tmpl.habits.length} Disciplines</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Explore Templates Modal */}
        <Modal
          isOpen={showTemplatesModal}
          onClose={() => setShowTemplatesModal(false)}
          title="Curated Challenge Templates"
          description="Select a proven challenge blueprint or build your custom transformation journey."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {CHALLENGE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-[#10131A] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tmpl.icon}</span>
                    <span className="text-[11px] font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                      {tmpl.defaultDurationDays} Days
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{tmpl.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Includes: {tmpl.habits.map((h) => h.name).slice(0, 3).join(", ")}
                    {tmpl.habits.length > 3 ? "..." : ""}
                  </div>
                </div>

                <Link
                  href={`/onboarding?template=${tmpl.id}`}
                  onClick={() => setShowTemplatesModal(false)}
                  className="mt-4 w-full py-2 rounded-xl bg-white/[0.06] hover:bg-sky-500/20 text-sky-300 hover:text-white border border-white/[0.08] hover:border-sky-500/40 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>Select Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    );
  }

  // 3. Active Dashboard View
  return (
    <div className="space-y-6">
      {/* Hero Daily Score Header */}
      <DailyScoreCard />

      {/* AI Coach Pattern Analysis Banner */}
      <AiInsightCard />

      {/* Daily & Weekly Discipline Quests */}
      <QuestBoard />

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
