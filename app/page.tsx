"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Flame,
  Check,
  ArrowRight,
  Shield,
  Calendar,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const { t } = useLanguage();

  // Interactive sample card state for the floating hero preview
  const [sampleHabits, setSampleHabits] = useState([
    { id: "1", name: "Wake at 5:00 AM", done: true, icon: "🌅", detail: "05:00 AM target" },
    { id: "2", name: "No Social Media while eating", done: true, icon: "📵", detail: "Done" },
    { id: "3", name: "10K Steps", done: false, icon: "🚶", detail: "7,842 / 10,000" },
    { id: "4", name: "Deep Skill / Coding", done: false, icon: "🎯", detail: "45 / 60 min" },
  ]);

  const toggleSample = (id: string) => {
    setSampleHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  const sampleCompletedCount = sampleHabits.filter((h) => h.done).length;
  const sampleScore = Math.round((sampleCompletedCount / sampleHabits.length) * 100);

  return (
    <div className="space-y-20 py-6 sm:py-16 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-10 pb-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Huge Commanding Typography */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151922] border border-white/[0.08] text-[#8ED8FF] text-xs font-bold tracking-widest uppercase">
            <span>❄️</span>
            <span>90 Days. One Version Better.</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#F5F7FA] tracking-tighter leading-[0.95] uppercase">
              BUILD YOUR
              <br />
              <span className="text-[#8ED8FF]">ARC.</span>
            </h1>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F7FA] tracking-tight uppercase pt-2">
              BECOME YOUR NEXT VERSION.
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#8D95A5] max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
            A 90-day challenge for your habits, discipline and personal growth.
            Don't just track your habits. Build your arc.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 text-sm">
                <span>START MY ARC ❄</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 text-sm">
                <span>See how it works</span>
              </Button>
            </Link>
          </div>

          {/* Quick Subtext Features */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs font-medium text-[#8D95A5]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8ED8FF]" />
              Structured 90-Day Challenge
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Habit Logs as Source of Truth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Unbroken Streak Engine
            </span>
          </div>
        </div>

        {/* Right Column: Floating Live-Looking Arc Dashboard Card Preview */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="relative">
            {/* Ambient soft glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8ED8FF]/15 to-transparent rounded-3xl blur-xl opacity-60 pointer-events-none" />

            <div className="relative bg-[#151922] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-5">
              {/* Card Header: DAY 27, 30% Progress */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">❄️</span>
                    <span className="text-xs font-bold text-[#8ED8FF] uppercase tracking-wider">
                      WINTER ARC 2026
                    </span>
                  </div>
                  <div className="text-xl font-black text-[#F5F7FA] mt-0.5">
                    DAY 27 / 90
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>21 STREAK</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#8D95A5]">
                  <span>Arc Progress</span>
                  <span className="text-[#8ED8FF] font-bold">30%</span>
                </div>
                <div className="w-full bg-[#10131A] rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div className="bg-[#8ED8FF] h-full rounded-full transition-all duration-500" style={{ width: "30%" }} />
                </div>
              </div>

              {/* Interactive Sample Habits Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
                  <span>Today's Habits (Interactive Preview)</span>
                  <span className="text-[#F5F7FA]">{sampleCompletedCount} / {sampleHabits.length}</span>
                </div>

                <div className="space-y-2">
                  {sampleHabits.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => toggleSample(habit.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        habit.done
                          ? "bg-[#10131A] border-[#8ED8FF]/20 text-[#F5F7FA]"
                          : "bg-[#10131A]/60 border-white/[0.06] text-[#8D95A5] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{habit.icon}</span>
                        <div>
                          <div className={`text-xs font-bold ${habit.done ? "text-[#F5F7FA]" : "text-[#8D95A5]"}`}>
                            {habit.name}
                          </div>
                          <div className="text-[10px] text-[#8D95A5]">{habit.detail}</div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          habit.done
                            ? "bg-[#8ED8FF] text-[#080A0F] font-bold scale-105"
                            : "border border-white/[0.15] text-transparent hover:border-white/[0.3]"
                        }`}
                      >
                        {habit.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Score block */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#10131A] border border-white/[0.06] text-xs">
                <span className="text-[#8D95A5] font-semibold">Today's Discipline Score</span>
                <span className="font-extrabold text-[#8ED8FF] text-sm">{sampleScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6">
          <div className="text-2xl mb-3">❄️</div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">8 Core Disciplines</h3>
          <p className="text-xs text-[#8D95A5] mt-1.5 leading-relaxed">
            5 AM Wake up, Mindful eating, 10K steps, Reading, Sleep &lt;11 PM, Deep skill, Clean eating, Cold water discipline.
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-2xl mb-3">🔥</div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">Streaks & Perfect Days</h3>
          <p className="text-xs text-[#8D95A5] mt-1.5 leading-relaxed">
            Every habit log is the pure source of truth. Reach 100% completion for the Perfect Day badge and +100 bonus XP.
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-2xl mb-3">👥</div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">Private Squads</h3>
          <p className="text-xs text-[#8D95A5] mt-1.5 leading-relaxed">
            Invite classmates or friends with custom invite codes. Compare squad average completion rates and build shared streaks.
          </p>
        </Card>
      </section>

      {/* 5 Measurement Methods */}
      <section className="bg-[#151922] border border-white/[0.08] rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-1.5">
          <h2 className="text-2xl font-black text-[#F5F7FA] tracking-tight">
            Designed for Real Disciplines
          </h2>
          <p className="text-xs text-[#8D95A5]">
            Habits are measured differently. Winter Arc supports 5 precise tracking modes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {[
            { name: "Done / Not Done", ex: "Clean Eating", icon: "✓" },
            { name: "Number", ex: "10,000 Steps", icon: "#" },
            { name: "Duration", ex: "60 Min Coding", icon: "⏱" },
            { name: "Time", ex: "Sleep < 11:00 PM", icon: "🌙" },
            { name: "Percentage", ex: "80% Study Tasks", icon: "%" },
          ].map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-[#10131A] border border-white/[0.06] text-center space-y-1"
            >
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] text-[#8ED8FF] font-bold flex items-center justify-center mx-auto text-xs">
                {item.icon}
              </div>
              <div className="font-bold text-[#F5F7FA] text-xs pt-1">{item.name}</div>
              <div className="text-[11px] text-[#8D95A5]">{item.ex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Minimal CTA */}
      <section className="bg-gradient-to-b from-[#151922] to-[#10131A] border border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center space-y-5">
        <div className="text-3xl">❄️</div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#F5F7FA] tracking-tight">
          Your 90 Days Start Now.
        </h2>
        <p className="text-xs sm:text-sm text-[#8D95A5] max-w-md mx-auto">
          "Discipline, one day at a time." Start your custom arc and forge your next version.
        </p>
        <Link href="/onboarding" className="inline-block pt-2">
          <Button size="lg" variant="primary" className="px-10 text-sm">
            <span>START MY ARC ❄</span>
          </Button>
        </Link>
      </section>
    </div>
  );
}
