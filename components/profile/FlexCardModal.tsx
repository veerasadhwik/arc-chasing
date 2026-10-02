"use client";

import React, { useState } from "react";
import { Profile, Arc, PlayerProfileStats, Title } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Flame, Trophy, Sparkles, Copy, Check, Download, Shield } from "lucide-react";

interface FlexCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  arc: Arc | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  perfectDays: number;
  playerStats: PlayerProfileStats;
  equippedTitle: Title | null;
}

export function FlexCardModal({
  isOpen,
  onClose,
  user,
  arc,
  level,
  totalXp,
  currentStreak,
  perfectDays,
  playerStats,
  equippedTitle,
}: FlexCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/u/${user.username}` : "";
    const text = `❄️ I'm locked in on Arc-Chaser! Day streak: ${currentStreak}d | Level: ${level} | Title: ${equippedTitle?.name || "The Initiate"}. Chase your arc: ${url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shareable Arc Flex Card"
      description="Showcase your relentless discipline on Instagram Stories & WhatsApp."
    >
      <div className="space-y-4">
        {/* Card Canvas */}
        <div
          id="flex-card-canvas"
          className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0B0E14] via-[#10141E] to-[#151B28] border-2 border-[#8ED8FF]/40 shadow-2xl relative overflow-hidden select-none"
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ED8FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Branding */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">❄️</span>
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-[#F5F7FA]">
                ARC-CHASER
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#8ED8FF]/15 text-[#8ED8FF] border border-[#8ED8FF]/30">
              {arc?.name || "Discipline Journey"}
            </span>
          </div>

          {/* Player Identity */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#151922] border-2 border-[#8ED8FF]/40 overflow-hidden shrink-0 shadow-lg">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {user.display_name || user.username}
              </h3>
              <p className="text-xs text-[#8ED8FF] font-semibold">@{user.username}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {equippedTitle?.name || "The Initiate"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                  {playerStats.player_class}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-6 relative z-10 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center justify-center gap-1 text-lg font-black text-amber-400">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{currentStreak}d</span>
              </div>
              <div className="text-[10px] text-[#8D95A5] font-bold uppercase tracking-wider mt-0.5">
                Streak
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-lg font-black text-[#8ED8FF]">
                Level {level}
              </div>
              <div className="text-[10px] text-[#8D95A5] font-bold uppercase tracking-wider mt-0.5">
                Discipline Rank
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-lg font-black text-emerald-400">
                {perfectDays}
              </div>
              <div className="text-[10px] text-[#8D95A5] font-bold uppercase tracking-wider mt-0.5">
                100% Days
              </div>
            </div>
          </div>

          {/* Footer Motto */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8D95A5] relative z-10">
            <span className="font-mono text-[10px]">CHASE YOUR ARC. BUILD YOUR FUTURE.</span>
            <span className="font-bold text-[#F5F7FA]">{totalXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="primary"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Flex Card Link"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
