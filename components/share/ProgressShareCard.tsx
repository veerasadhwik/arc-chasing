"use client";

import React, { useState } from "react";
import { useArc } from "@/lib/habits/ArcContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Copy, Check, Share2, Sparkles, Flame, Trophy, Shield } from "lucide-react";

export function ProgressShareCard() {
  const { metrics, arc, totalXp, levelInfo } = useArc();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const { currentDay, totalDays, currentStreak, overallCompletionRate } = metrics;
  const username = user?.display_name || user?.username || "Warrior";

  const shareText = `❄️ WINTER ARC 2026\nDay ${currentDay} of ${totalDays}\n🔥 ${currentStreak}-Day Streak | ${overallCompletionRate}% Overall Completion\n⚡ Level ${levelInfo.level} (${totalXp.toLocaleString()} XP)\n\n"90 Days. One Version Better."\nBuild your Arc at: https://winterarc.app/u/${user?.username || "veera"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <Share2 className="w-6 h-6 text-sky-400" />
          {t("share.title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t("share.subtitle")}
        </p>
      </div>

      {/* The Aesthetic Visual Share Badge */}
      <div
        id="share-card-graphic"
        className="rounded-3xl p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border-2 border-sky-400/40 shadow-2xl relative overflow-hidden arc-glow select-none"
      >
        {/* Frost decorative elements */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-sky-500/30 mb-4">
            ❄️
          </div>

          <div className="text-xs font-black tracking-widest text-sky-400 uppercase">
            {(arc?.name || "WINTER ARC").toUpperCase()}
          </div>

          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">
            DAY {currentDay} / {totalDays}
          </div>

          <div className="text-xs font-bold text-slate-300 tracking-widest uppercase mt-1">
            {currentDay} {t("share.daysOfDiscipline")}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 w-full mt-6 pt-6 border-t border-sky-500/20">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-sky-500/20">
              <div className="text-2xl font-black text-sky-300">
                {overallCompletionRate}%
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                Completed
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-amber-500/20">
              <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                {currentStreak}d
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                Streak
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-500/20">
              <div className="text-2xl font-black text-indigo-300">
                L{levelInfo.level}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                {totalXp} XP
              </div>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>@{username}</span>
            <span>•</span>
            <span className="text-sky-400">winterarc.app</span>
          </div>
        </div>
      </div>

      {/* Share Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="frost" onClick={handleCopyLink}>
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? t("share.copied") : t("share.copyLink")}</span>
        </Button>

        <Button variant="secondary" onClick={handleWhatsApp}>
          <span>WhatsApp</span>
        </Button>

        <Button variant="secondary" onClick={handleTwitter}>
          <span>X / Twitter</span>
        </Button>
      </div>
    </div>
  );
}
