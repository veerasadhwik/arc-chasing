"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useArc } from "@/lib/habits/ArcContext";
import { StorageRepository } from "@/lib/storage/repository";
import { Quest } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Sparkles, Trophy, CheckCircle2, Clock, Gift, ShieldAlert } from "lucide-react";

export function QuestBoard() {
  const { user } = useAuth();
  const { refresh, triggerConfetti } = useArc();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [quests, setQuests] = useState<
    Array<Quest & { current_count: number; is_completed: boolean; is_claimed: boolean }>
  >([]);

  const loadQuests = () => {
    if (!user) return;
    const list = StorageRepository.getUserQuests(user.id);
    setQuests(list);
  };

  useEffect(() => {
    loadQuests();
  }, [user]);

  const handleClaim = (questId: string) => {
    if (!user) return;
    const res = StorageRepository.claimQuestReward(user.id, questId);
    if (res.success) {
      triggerConfetti();
      loadQuests();
      refresh();
    }
  };

  const displayedQuests = quests.filter((q) => q.frequency === activeTab);
  const claimableCount = quests.filter((q) => q.is_completed && !q.is_claimed).length;

  return (
    <Card className="p-5 sm:p-6 relative overflow-hidden border-sky-500/20 bg-slate-900/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Discipline Quests
              </h3>
              {claimableCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  {claimableCount} Ready to Claim
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Conquer daily routines and weekly milestones for bonus XP rank climbs.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "daily"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Daily Quests
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "weekly"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Weekly Milestones
          </button>
        </div>
      </div>

      {/* Quest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayedQuests.map((q) => {
          const progressPercent = Math.min(
            100,
            Math.round((q.current_count / q.target_count) * 100)
          );

          return (
            <div
              key={q.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                q.is_claimed
                  ? "bg-slate-950/40 border-slate-800/60 opacity-75"
                  : q.is_completed
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {q.title}
                  </h4>
                  <span className="text-[11px] font-black text-amber-300 shrink-0">
                    +{q.xp_reward} XP
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {q.description}
                </p>
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>
                    Progress: {q.current_count} / {q.target_count}
                  </span>
                  <span>{progressPercent}%</span>
                </div>

                <ProgressBar
                  value={progressPercent}
                  variant={q.is_completed ? "emerald" : "frost"}
                  size="sm"
                />

                <div className="pt-2">
                  {q.is_claimed ? (
                    <div className="w-full py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-center text-xs font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reward Claimed</span>
                    </div>
                  ) : q.is_completed ? (
                    <button
                      onClick={() => handleClaim(q.id)}
                      className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-center text-xs font-black transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim +{q.xp_reward} XP</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 rounded-xl bg-slate-900 text-slate-500 text-center text-[11px] font-medium border border-slate-800/60">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
