"use client";

import React, { useState } from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth/AuthContext";
import { StorageRepository } from "@/lib/storage/repository";
import { BadgeCategory, BadgeRarity, Title } from "@/types/database";
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Flame,
  Shield,
  HelpCircle,
  Check,
} from "lucide-react";

export function AchievementsView() {
  const { achievements, userAchievements, totalXp, levelInfo, refresh } = useArc();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"badges" | "titles">("badges");

  const xpEvents = user ? StorageRepository.getUserXPEvents(user.id) : StorageRepository.getXPEvents();
  const allTitles = StorageRepository.getTitles();
  const unlockedTitles = user ? StorageRepository.getUserUnlockedTitles(user.id) : [];
  const playerStats = user ? StorageRepository.getPlayerProfileStats(user.id) : null;

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const unlockedTitleIds = new Set(unlockedTitles.map((t) => t.id));

  const categories: { key: string; label: string; icon: string }[] = [
    { key: "all", label: "All Badges", icon: "🏆" },
    { key: "streak", label: "Streak", icon: "🔥" },
    { key: "arc", label: "Arc Journey", icon: "🧭" },
    { key: "performance", label: "Performance", icon: "💯" },
    { key: "discipline", label: "Discipline", icon: "⚔️" },
    { key: "recovery", label: "Recovery", icon: "🦅" },
    { key: "secret", label: "Secret", icon: "🌘" },
  ];

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedCategory === "all") return true;
    return (ach.category || "streak") === selectedCategory;
  });

  const getRarityBadge = (rarity: BadgeRarity = "common") => {
    switch (rarity) {
      case "mythic":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 animate-pulse">
            Mythic
          </span>
        );
      case "epic":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Epic
          </span>
        );
      case "rare":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40">
            Rare
          </span>
        );
      case "uncommon":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Uncommon
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Common
          </span>
        );
    }
  };

  const handleEquipTitle = (titleId: string) => {
    if (!user) return;
    StorageRepository.equipTitle(user.id, titleId);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Level Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-indigo-500/30 arc-glow relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  Discipline Rank
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Level {levelInfo.level}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                {totalXp.toLocaleString()} Total XP
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP to Level {levelInfo.level + 1}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-300">
              <span>Next Rank Climb</span>
              <span className="text-sky-300">{levelInfo.progressPercent}%</span>
            </div>
            <ProgressBar value={levelInfo.progressPercent} variant="gradient" size="lg" />
          </div>
        </div>
      </div>

      {/* Main Tabs: Badges vs Titles */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab("badges")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "badges"
              ? "bg-[#8ED8FF]/15 text-[#8ED8FF] border border-[#8ED8FF]/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Milestone Badges ({userAchievements.length} / {achievements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("titles")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "titles"
              ? "bg-[#8ED8FF]/15 text-[#8ED8FF] border border-[#8ED8FF]/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Unlockable Titles ({unlockedTitles.length} / {allTitles.length})</span>
        </button>
      </div>

      {/* Badges Tab View */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === c.key
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                    : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((ach) => {
              const isUnlocked = unlockedIds.has(ach.id);
              const userAch = userAchievements.find((ua) => ua.achievement_id === ach.id);
              const isSecretLocked = ach.is_secret && !isUnlocked;

              return (
                <Card
                  key={ach.id}
                  className={`transition-all duration-200 relative overflow-hidden ${
                    isUnlocked
                      ? "border-sky-500/40 bg-sky-950/20 shadow-md shadow-sky-500/10"
                      : "border-slate-800 bg-slate-900/40 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked
                          ? "bg-sky-500/20 border border-sky-400/40 text-sky-200"
                          : "bg-slate-800/80 border border-slate-700 text-slate-500 grayscale"
                      }`}
                    >
                      {isSecretLocked ? "❓" : ach.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-slate-100 text-sm tracking-tight truncate">
                          {isSecretLocked ? "??? Secret Milestone" : ach.name}
                        </h4>
                        {isUnlocked ? (
                          <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-500 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="mb-2">
                        {getRarityBadge(ach.rarity)}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {isSecretLocked
                          ? "Hidden achievement. Discovered only through legendary discipline."
                          : ach.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="font-bold text-amber-300">+{ach.xp_reward} XP</span>
                        {isUnlocked && userAch && (
                          <span className="text-slate-400">
                            Unlocked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Titles Tab View */}
      {activeTab === "titles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTitles.map((title) => {
            const isUnlocked = unlockedTitleIds.has(title.id);
            const isEquipped = playerStats?.equipped_title_id === title.id;

            return (
              <Card
                key={title.id}
                className={`p-5 flex flex-col justify-between transition-all ${
                  isEquipped
                    ? "border-amber-500/50 bg-amber-950/20 shadow-md shadow-amber-500/10"
                    : isUnlocked
                    ? "border-sky-500/30 bg-slate-900/60"
                    : "border-slate-800 bg-slate-950/40 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-black text-base text-white">{title.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {title.category}
                      </span>
                    </div>
                    {getRarityBadge(title.rarity)}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {title.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  {isUnlocked ? (
                    isEquipped ? (
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Equipped Title</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquipTitle(title.id)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-colors"
                      >
                        Equip Title
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>
                        {title.required_level
                          ? `Unlocks at Level ${title.required_level}`
                          : title.required_streak
                          ? `Requires ${title.required_streak}d streak`
                          : "Locked"}
                      </span>
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Auditable XP Event Feed */}
      <Card>
        <h3 className="font-bold text-white text-base flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-sky-400" />
          {t("achievements.recentXp")}
        </h3>

        <div className="space-y-2">
          {xpEvents.slice(0, 8).map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="font-bold text-slate-200 capitalize">
                  {evt.event_type.replace(/_/g, " ")}
                </span>
              </div>
              <span className="font-black text-amber-300">+{evt.xp_amount} XP</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
