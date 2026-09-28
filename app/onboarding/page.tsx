"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageCode, HabitType } from "@/types/database";
import { DEFAULT_WINTER_ARC_HABITS } from "@/types/habit";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getTodayDateString, addDays } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Calendar,
  Globe,
  Target,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { createNewArc } = useArc();
  const { language, setLanguage, t } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [focusArea, setFocusArea] = useState("Discipline");
  const [durationDays, setDurationDays] = useState(90);
  const [customDays, setCustomDays] = useState("75");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [arcName, setArcName] = useState("Winter Arc 2026");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [habitsList, setHabitsList] = useState(DEFAULT_WINTER_ARC_HABITS);

  // New habit form inline
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("❄️");
  const [newHabitType, setNewHabitType] = useState<HabitType>("boolean");
  const [newHabitTarget, setNewHabitTarget] = useState("");

  const effectiveDuration = isCustomDuration ? (parseInt(customDays, 10) || 90) : durationDays;
  const endDate = addDays(startDate, effectiveDuration);

  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLang(lang);
    setLanguage(lang);
  };

  const handleRemoveHabit = (idx: number) => {
    setHabitsList(habitsList.filter((_, i) => i !== idx));
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    if (habitsList.length >= 10) return;

    setHabitsList([
      ...habitsList,
      {
        name: newHabitName.trim(),
        description: "",
        icon: newHabitIcon,
        habit_type: newHabitType,
        target_value: newHabitType !== "boolean" ? parseFloat(newHabitTarget) || 1 : null,
        target_unit: newHabitType === "duration" ? "min" : newHabitType === "number" ? "steps" : null,
        frequency: "daily",
        reminder_enabled: false,
        reminder_time: null,
        sort_order: habitsList.length + 1,
        is_active: true,
      },
    ]);
    setNewHabitName("");
    setNewHabitTarget("");
  };

  const handleFinish = () => {
    createNewArc(arcName, effectiveDuration, startDate, habitsList);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col justify-center py-10 px-4 sm:px-6 max-w-2xl mx-auto w-full space-y-6">
      {/* 5-Step Visual Stepper Header: 01 ━━━━━ 02 ━━━━━ 03 ━━━━━ 04 ━━━━━ 05 */}
      <div className="text-center space-y-4">
        <div className="text-2xl">❄️</div>
        <div>
          <div className="text-xs font-bold text-[#8ED8FF] uppercase tracking-widest">
            LET'S BUILD YOUR ARC
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
            Step {step} of 5
          </h1>
        </div>

        {/* Linear Stepper Bar */}
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-10 bg-[#8ED8FF]"
                  : s < step
                  ? "w-6 bg-[#8ED8FF]/50"
                  : "w-6 bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: CHOOSE LANGUAGE */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#F5F7FA]">Choose your language</h2>
              <p className="text-xs text-[#8D95A5] mt-1">Your Arc. Your language.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: "en" as LanguageCode, label: "English", sub: "EN", flag: "🇺🇸" },
                { code: "te" as LanguageCode, label: "తెలుగు", sub: "TE", flag: "🇮🇳" },
                { code: "hi" as LanguageCode, label: "हिन्दी", sub: "HI", flag: "🇮🇳" },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleLanguageChange(item.code)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedLang === item.code
                      ? "bg-[#10131A] border-[#8ED8FF] text-[#F5F7FA] shadow-md shadow-[#8ED8FF]/10 ring-1 ring-[#8ED8FF]"
                      : "bg-[#10131A]/60 border-white/[0.08] text-[#8D95A5] hover:border-white/[0.18]"
                  }`}
                >
                  <span className="text-2xl">{item.flag}</span>
                  <div className="text-base font-bold text-[#F5F7FA] mt-2">{item.label}</div>
                  <div className="text-xs text-[#8D95A5] font-mono">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: WHAT ARE YOU WORKING ON? */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#F5F7FA]">What are you working on?</h2>
              <p className="text-xs text-[#8D95A5] mt-1">Select your primary transformation focus.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: "Fitness", icon: "🏋️", desc: "Physical mastery" },
                { name: "Study", icon: "📚", desc: "Cognitive focus" },
                { name: "Skills", icon: "🎯", desc: "Craft & discipline" },
                { name: "Detox", icon: "📵", desc: "Dopamine reset" },
                { name: "Discipline", icon: "❄️", desc: "Routine & habits" },
                { name: "Custom", icon: "✨", desc: "Customized goal" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setFocusArea(item.name)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    focusArea === item.name
                      ? "bg-[#10131A] border-[#8ED8FF] text-[#F5F7FA] ring-1 ring-[#8ED8FF]"
                      : "bg-[#10131A]/60 border-white/[0.08] text-[#8D95A5] hover:border-white/[0.18]"
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="text-sm font-bold text-[#F5F7FA] mt-2">{item.name}</div>
                  <div className="text-[11px] text-[#8D95A5]">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: HOW LONG IS YOUR ARC? (Huge Cards) */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#F5F7FA]">HOW LONG IS YOUR ARC?</h2>
              <p className="text-xs text-[#8D95A5] mt-1">Select your committed challenge duration.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 30 Days */}
              <button
                onClick={() => {
                  setDurationDays(30);
                  setIsCustomDuration(false);
                }}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  !isCustomDuration && durationDays === 30
                    ? "bg-[#10131A] border-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                    : "bg-[#10131A]/60 border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                <div className="text-3xl font-black text-[#F5F7FA]">30</div>
                <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider mt-1">DAYS</div>
              </button>

              {/* 60 Days */}
              <button
                onClick={() => {
                  setDurationDays(60);
                  setIsCustomDuration(false);
                }}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  !isCustomDuration && durationDays === 60
                    ? "bg-[#10131A] border-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                    : "bg-[#10131A]/60 border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                <div className="text-3xl font-black text-[#F5F7FA]">60</div>
                <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider mt-1">DAYS</div>
              </button>

              {/* 90 Days Recommended */}
              <button
                onClick={() => {
                  setDurationDays(90);
                  setIsCustomDuration(false);
                }}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  !isCustomDuration && durationDays === 90
                    ? "bg-[#10131A] border-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                    : "bg-[#10131A]/60 border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                <div className="text-3xl font-black text-[#F5F7FA]">90</div>
                <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider mt-1">DAYS</div>
                <div className="text-[10px] font-black text-[#8ED8FF] uppercase tracking-widest mt-1">
                  RECOMMENDED
                </div>
              </button>

              {/* Custom */}
              <button
                onClick={() => setIsCustomDuration(true)}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  isCustomDuration
                    ? "bg-[#10131A] border-[#8ED8FF] ring-1 ring-[#8ED8FF]"
                    : "bg-[#10131A]/60 border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                <div className="text-3xl font-black text-[#F5F7FA]">CUSTOM</div>
                <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider mt-1">ENTER DAYS</div>
              </button>
            </div>

            {isCustomDuration && (
              <div>
                <label className="block text-xs font-bold text-[#8D95A5] uppercase tracking-wider mb-1">
                  Custom Days Count
                </label>
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10131A] border border-white/[0.08] text-white text-sm outline-none"
                />
              </div>
            )}

            <div className="pt-2">
              <label className="block text-xs font-bold text-[#8D95A5] uppercase tracking-wider mb-1">
                Challenge Name
              </label>
              <input
                type="text"
                value={arcName}
                onChange={(e) => setArcName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10131A] border border-white/[0.08] text-white text-sm outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE TEMPLATE */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#F5F7FA]">CHOOSE YOUR ARC</h2>
              <p className="text-xs text-[#8D95A5] mt-1">Templates are pre-populated with tested disciplines.</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  name: "❄️ WINTER ARC",
                  desc: "Discipline • Fitness • Skills • Routine",
                  habits: DEFAULT_WINTER_ARC_HABITS,
                },
                {
                  name: "📚 STUDY ARC",
                  desc: "Focus • Learning • Exams",
                  habits: DEFAULT_WINTER_ARC_HABITS.slice(0, 6),
                },
                {
                  name: "🏋️ FITNESS ARC",
                  desc: "Strength • 10K Steps • Clean Eating • Cold Water",
                  habits: DEFAULT_WINTER_ARC_HABITS.filter((h) =>
                    ["10K Steps", "Clean Eating", "Cold Water Discipline"].some((n) => h.name.includes(n))
                  ),
                },
                {
                  name: "📵 DIGITAL DETOX",
                  desc: "Mindful Eating • Reading • Screen Curfew",
                  habits: DEFAULT_WINTER_ARC_HABITS.slice(1, 5),
                },
              ].map((tmpl) => (
                <div
                  key={tmpl.name}
                  onClick={() => {
                    setHabitsList(tmpl.habits);
                    setStep(5);
                  }}
                  className="p-4 rounded-2xl bg-[#10131A] border border-white/[0.08] hover:border-white/[0.2] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-extrabold text-sm text-[#F5F7FA]">{tmpl.name}</h3>
                    <p className="text-xs text-[#8D95A5] mt-0.5">{tmpl.desc}</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    SELECT
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: CUSTOMIZE HABITS */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h2 className="text-xl font-black text-[#F5F7FA]">YOUR ARC</h2>
                <p className="text-xs text-[#8D95A5] mt-0.5">
                  {habitsList.length} / 10 HABITS • {effectiveDuration} DAYS
                </p>
              </div>
            </div>

            {/* Habit Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {habitsList.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#10131A] border border-white/[0.06] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{h.icon}</span>
                    <div>
                      <div className="font-bold text-[#F5F7FA]">{h.name}</div>
                      {h.target_value && (
                        <div className="text-[10px] text-[#8ED8FF]">
                          {h.target_value} {h.target_unit || ""}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveHabit(idx)}
                    className="p-1 rounded text-[#8D95A5] hover:text-rose-400"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Habit */}
            {habitsList.length < 10 && (
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-[#8ED8FF] uppercase tracking-wider">
                  + Add Habit
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. 2L Water, Mobility Stretch"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#10131A] border border-white/[0.08] text-white text-xs outline-none"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddHabit}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          {step > 1 ? (
            <Button variant="ghost" size="md" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : <div />}

          {step < 5 ? (
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleFinish}
              className="px-8 text-sm"
            >
              <span>START MY ARC ❄</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
