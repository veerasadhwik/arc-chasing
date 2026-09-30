"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Habit, HabitType } from "@/types/database";
import { CHALLENGE_TEMPLATES, TemplateDefinition } from "@/lib/storage/mockData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getTodayDateString, addDays, formatDisplayDate } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Layers,
  Edit2,
  CheckCircle2,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { createNewArc } = useArc();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(CHALLENGE_TEMPLATES[0]);
  const [arcName, setArcName] = useState(CHALLENGE_TEMPLATES[0].name);
  const [arcDescription, setArcDescription] = useState(CHALLENGE_TEMPLATES[0].description);
  const [durationDays, setDurationDays] = useState(90);
  const [customDays, setCustomDays] = useState("75");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [habitsList, setHabitsList] = useState<Array<Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">>>(
    CHALLENGE_TEMPLATES[0].habits
  );

  // New habit form in Step 5
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("⚡");
  const [newHabitType, setNewHabitType] = useState<HabitType>("boolean");
  const [newHabitTarget, setNewHabitTarget] = useState("");
  const [newHabitUnit, setNewHabitUnit] = useState("");

  const effectiveDuration = isCustomDuration ? parseInt(customDays, 10) || 90 : durationDays;
  const endDate = addDays(startDate, effectiveDuration - 1);

  const handleSelectTemplate = (template: TemplateDefinition) => {
    setSelectedTemplate(template);
    setArcName(template.name);
    setArcDescription(template.description);
    setDurationDays(template.defaultDurationDays);
    setIsCustomDuration(false);
    setHabitsList(template.habits);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tmplId = params.get("template");
      if (tmplId) {
        const found = CHALLENGE_TEMPLATES.find((t) => t.id === tmplId);
        if (found) {
          handleSelectTemplate(found);
        }
      }
    }
  }, []);

  const handleRemoveHabit = (idx: number) => {
    setHabitsList(habitsList.filter((_, i) => i !== idx));
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    if (habitsList.length >= 10) return;

    const newHabit: Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at"> = {
      name: newHabitName.trim(),
      description: null,
      icon: newHabitIcon,
      habit_type: newHabitType,
      target_value: newHabitType !== "boolean" ? parseFloat(newHabitTarget) || 1 : null,
      target_unit: newHabitType === "duration" ? "min" : newHabitType === "number" ? (newHabitUnit || "units") : null,
      frequency: "daily",
      reminder_enabled: false,
      reminder_time: null,
      sort_order: habitsList.length + 1,
      is_active: true,
    };

    setHabitsList([...habitsList, newHabit]);
    setNewHabitName("");
    setNewHabitTarget("");
    setNewHabitUnit("");
  };

  const handleUpdateHabit = (index: number, updates: Partial<Omit<Habit, "id" | "arc_id" | "created_at" | "updated_at">>) => {
    setHabitsList((prev) =>
      prev.map((h, i) => (i === index ? { ...h, ...updates } : h))
    );
  };

  const handleFinish = () => {
    createNewArc(arcName, effectiveDuration, startDate, habitsList);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col justify-center py-10 px-4 sm:px-6 max-w-3xl mx-auto w-full space-y-6">
      {/* 7-Step Visual Stepper Header */}
      <div className="text-center space-y-3">
        <div className="text-3xl">❄️</div>
        <div>
          <div className="text-xs font-bold text-[#8ED8FF] uppercase tracking-widest">
            CREATE YOUR ARC
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
            Step {step} of 7
          </h1>
        </div>

        {/* Stepper Dots / Bars */}
        <div className="flex items-center justify-center gap-1.5 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-[#8ED8FF]"
                  : s < step
                  ? "w-4 bg-emerald-400"
                  : "w-4 bg-white/[0.1]"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 border border-white/[0.08] bg-[#151922]">
        {/* STEP 1: WHAT DO YOU WANT TO BUILD? */}
        {step === 1 && (
          <div className="space-y-5 animate-auth-fade">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                WHAT DO YOU WANT TO BUILD?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Select a structured discipline framework or build from scratch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {CHALLENGE_TEMPLATES.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3.5 ${
                    selectedTemplate.id === tpl.id
                      ? "bg-[#8ED8FF]/10 border-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                      : "bg-[#10131A] border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                >
                  <span className="text-2xl mt-0.5">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[#F5F7FA]">
                        {tpl.name}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8ED8FF]">
                        {tpl.defaultDurationDays}d
                      </span>
                    </div>
                    <div className="text-xs text-[#8D95A5] mt-1 line-clamp-2">
                      {tpl.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: NAME YOUR ARC */}
        {step === 2 && (
          <div className="space-y-5 animate-auth-fade">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                NAME YOUR ARC
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Give your transformation mission a powerful identity.
              </p>
            </div>

            <div className="space-y-4 max-w-lg mx-auto pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
                  Arc Title
                </label>
                <input
                  type="text"
                  required
                  value={arcName}
                  onChange={(e) => setArcName(e.target.value)}
                  placeholder="e.g. Winter Arc 2026, 60-Day Coding Mastery"
                  className="w-full px-4 py-3 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] font-bold text-base outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
                  Mission Statement / Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={arcDescription}
                  onChange={(e) => setArcDescription(e.target.value)}
                  placeholder="Why are you undertaking this challenge? What version of yourself are you building?"
                  className="w-full px-4 py-3 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] text-xs outline-none resize-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: HOW LONG? */}
        {step === 3 && (
          <div className="space-y-5 animate-auth-fade">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                HOW LONG?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose your commitment duration. 90 days creates permanent identity change.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[30, 60, 90].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => {
                    setDurationDays(days);
                    setIsCustomDuration(false);
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    !isCustomDuration && durationDays === days
                      ? "bg-[#8ED8FF]/15 border-[#8ED8FF] text-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                      : "bg-[#10131A] border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA]"
                  }`}
                >
                  <div className="text-2xl font-black">{days}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mt-1">
                    {days === 90 ? "90 DAYS ❄️" : `${days} DAYS`}
                  </div>
                  {days === 90 && (
                    <div className="text-[9px] text-[#8ED8FF] font-extrabold mt-1 uppercase">
                      Recommended
                    </div>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomDuration(true)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isCustomDuration
                    ? "bg-[#8ED8FF]/15 border-[#8ED8FF] text-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                    : "bg-[#10131A] border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA]"
                }`}
              >
                <div className="text-2xl font-black">⚙️</div>
                <div className="text-[11px] font-bold uppercase tracking-wider mt-1">
                  CUSTOM
                </div>
              </button>
            </div>

            {isCustomDuration && (
              <div className="pt-2 max-w-xs mx-auto space-y-1.5 animate-auth-fade">
                <label className="block text-center text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
                  Enter Duration (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full text-center px-4 py-2.5 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] font-black text-xl outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 4: START DATE */}
        {step === 4 && (
          <div className="space-y-5 animate-auth-fade">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                START DATE
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose when your Arc starts. End date is calculated automatically.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
                  Select Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] font-bold text-sm outline-none transition-all [color-scheme:dark]"
                />
              </div>

              {/* Automatic Calculated Timeline Card */}
              <div className="p-4 rounded-2xl bg-[#10131A] border border-white/[0.06] space-y-3">
                <div className="text-[11px] font-bold text-[#8ED8FF] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Calculated Timeline ({effectiveDuration} Days)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[10px] text-[#8D95A5] uppercase block font-semibold">Start Date</span>
                    <strong className="text-[#F5F7FA]">{formatDisplayDate(startDate)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8D95A5] uppercase block font-semibold">Calculated End Date</span>
                    <strong className="text-emerald-400">{formatDisplayDate(endDate)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CHOOSE HABITS */}
        {step === 5 && (
          <div className="space-y-5 animate-auth-fade">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  CHOOSE HABITS
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep, remove, or add habits for your daily routine. (Max 10)
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#10131A] border border-white/[0.08] text-[#8ED8FF]">
                {habitsList.length} / 10 Selected
              </span>
            </div>

            {/* Habit Chips/Cards */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {habitsList.map((habit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#10131A] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{habit.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#F5F7FA] truncate">
                        {habit.name}
                      </div>
                      <div className="text-[10px] text-[#8D95A5] capitalize">
                        {habit.habit_type}
                        {habit.target_value ? ` • Target: ${habit.target_value} ${habit.target_unit || ""}` : ""}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHabit(idx)}
                    className="p-1.5 text-[#8D95A5] hover:text-rose-400 transition-colors"
                    title="Remove Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Habit */}
            {habitsList.length < 10 && (
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <div className="text-[11px] font-bold text-[#8ED8FF] uppercase tracking-wider">
                  + Add Custom Habit
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. 100 Pushups, Code 90 min"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#10131A] border border-white/[0.08] text-[#F5F7FA] text-xs outline-none"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddHabit}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CUSTOMIZE HABITS */}
        {step === 6 && (
          <div className="space-y-5 animate-auth-fade">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                CUSTOMIZE HABITS
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Fine-tune measurement types and targets for each discipline.
              </p>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {habitsList.map((habit, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#10131A] border border-white/[0.06] space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={habit.icon}
                      onChange={(e) => handleUpdateHabit(idx, { icon: e.target.value })}
                      className="w-10 text-center px-1 py-1 rounded-xl bg-[#151922] border border-white/[0.08] text-base"
                    />
                    <input
                      type="text"
                      value={habit.name}
                      onChange={(e) => handleUpdateHabit(idx, { name: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#151922] border border-white/[0.08] text-[#F5F7FA] font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#8D95A5] block font-semibold mb-1 uppercase">Type</label>
                      <select
                        value={habit.habit_type}
                        onChange={(e) => handleUpdateHabit(idx, { habit_type: e.target.value as HabitType })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#151922] border border-white/[0.08] text-[#F5F7FA] text-xs outline-none"
                      >
                        <option value="boolean">Boolean (Done / Not Done)</option>
                        <option value="number">Number (Count / Steps)</option>
                        <option value="duration">Duration (Minutes)</option>
                        <option value="time">Time (e.g. 5:00 AM)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>

                    {habit.habit_type !== "boolean" && (
                      <>
                        <div>
                          <label className="text-[10px] text-[#8D95A5] block font-semibold mb-1 uppercase">Target</label>
                          <input
                            type="number"
                            value={habit.target_value ?? ""}
                            onChange={(e) => handleUpdateHabit(idx, { target_value: parseFloat(e.target.value) || 0 })}
                            placeholder="Value"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-[#151922] border border-white/[0.08] text-[#F5F7FA] text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#8D95A5] block font-semibold mb-1 uppercase">Unit</label>
                          <input
                            type="text"
                            value={habit.target_unit ?? ""}
                            onChange={(e) => handleUpdateHabit(idx, { target_unit: e.target.value })}
                            placeholder="e.g. min, steps"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-[#151922] border border-white/[0.08] text-[#F5F7FA] text-xs outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW & LAUNCH */}
        {step === 7 && (
          <div className="space-y-6 animate-auth-fade">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
                <span>✓</span>
                <span>Ready to Commit</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                REVIEW YOUR ARC
              </h2>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-2xl bg-[#10131A] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-bold text-[#8ED8FF] uppercase tracking-wider block">
                    Challenge Title
                  </span>
                  <div className="text-lg font-black text-[#F5F7FA] mt-0.5">
                    {arcName}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8D95A5] uppercase tracking-wider block">
                    Duration
                  </span>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    {effectiveDuration} DAYS
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#8D95A5] uppercase font-semibold block">Start Date</span>
                  <strong className="text-[#F5F7FA]">{formatDisplayDate(startDate)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#8D95A5] uppercase font-semibold block">End Date</span>
                  <strong className="text-emerald-400">{formatDisplayDate(endDate)}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <div className="text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider mb-2">
                  Active Disciplines ({habitsList.length} Habits)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {habitsList.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[#151922] text-xs">
                      <span>{h.icon}</span>
                      <span className="text-[#F5F7FA] font-medium truncate">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          {step > 1 ? (
            <Button variant="ghost" size="md" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleFinish}
              className="px-8 text-sm bg-[#8ED8FF] hover:bg-[#A6E2FF] text-[#080A0F] font-black"
            >
              <span>START MY ARC ❄</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
