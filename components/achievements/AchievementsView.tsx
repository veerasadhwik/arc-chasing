"use client";

import React from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StorageRepository } from "@/lib/storage/repository";
import { Trophy, Award, Sparkles, CheckCircle2, Lock, Flame } from "lucide-react";

export function AchievementsView() {
  const { achievements, userAchievements, totalXp, levelInfo } = useArc();
  const { t } = useLanguage();
  const xpEvents = StorageRepository.getXPEvents();

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));

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
              <span>Next Rank</span>
              <span className="text-sky-300">{levelInfo.progressPercent}%</span>
            </div>
            <ProgressBar value={levelInfo.progressPercent} variant="gradient" size="lg" />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Milestone Badges ({userAchievements.length} / {achievements.length} Unlocked)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id);
            const userAch = userAchievements.find((ua) => ua.achievement_id === ach.id);

            return (
              <Card
                key={ach.id}
                className={`transition-all duration-200 ${
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
                    {ach.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-100 text-sm tracking-tight truncate">
                        {ach.name}
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

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {ach.description}
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
