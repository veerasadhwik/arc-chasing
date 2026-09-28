"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { LanguageCode } from "@/types/database";
import { Sparkles, Globe, Moon, Sun, Flame, Award, Shield } from "lucide-react";

export function Header() {
  const { metrics, totalXp, levelInfo, arc } = useArc();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "te", label: "తెలుగు (Telugu)", flag: "🇮🇳" },
    { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080A0F]/85 border-b border-white/[0.08] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Challenge Badge */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#151922] border border-white/[0.1] flex items-center justify-center text-lg shadow-sm group-hover:border-[#8ED8FF]/40 transition-colors">
              ❄️
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-[#F5F7FA]">
                WINTER ARC
              </div>
              <div className="text-[10px] font-bold text-[#8D95A5] tracking-widest uppercase">
                {arc.name || "90-Day Challenge"}
              </div>
            </div>
          </Link>

          {/* Day X / Total Days Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151922] border border-white/[0.08] text-[#8ED8FF] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8ED8FF]" />
            <span>
              {t("dashboard.day")} {metrics.currentDay} / {metrics.totalDays}
            </span>
          </div>
        </div>

        {/* Center / Right Metrics & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Flame */}
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 transition-all font-bold text-xs"
            title="Current Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{metrics.currentStreak}d</span>
          </Link>

          {/* Level & XP Pill */}
          <Link
            href="/achievements"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151922] hover:bg-[#1A1F2B] border border-white/[0.08] transition-all"
            title={`${levelInfo.currentLevelXp} / ${levelInfo.nextLevelXp} XP to Level ${levelInfo.level + 1}`}
          >
            <div className="w-5 h-5 rounded-lg bg-white/[0.05] text-[#8ED8FF] flex items-center justify-center font-black text-[10px]">
              L{levelInfo.level}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F5F7FA]">
                {totalXp.toLocaleString()} XP
              </span>
              <div className="w-14 h-1 bg-[#10131A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8ED8FF] rounded-full"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-xl bg-[#151922] hover:bg-[#1A1F2B] border border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Change Language"
            >
              <Globe className="w-4 h-4 text-[#8ED8FF]" />
              <span className="hidden sm:inline uppercase">{language}</span>
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#151922] border border-white/[0.1] p-1.5 shadow-2xl z-40">
                  <div className="text-[10px] font-bold text-[#8D95A5] px-3 py-1 uppercase tracking-wider">
                    {t("settings.language")}
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        language === l.code
                          ? "bg-white/[0.06] text-[#8ED8FF] font-bold"
                          : "text-[#8D95A5] hover:bg-white/[0.04] hover:text-[#F5F7FA]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-[#151922] hover:bg-[#1A1F2B] border border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA] transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#8ED8FF]" />
            )}
          </button>

          {/* Share CTA */}
          <Link
            href="/share"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8ED8FF] hover:bg-[#A6E2FF] text-[#080A0F] font-bold text-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("nav.share")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
