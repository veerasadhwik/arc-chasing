"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useArc } from "@/lib/habits/ArcContext";
import { StorageRepository } from "@/lib/storage/repository";
import {
  PlayerClassType,
  PlayerProfileStats,
  Title,
  ArcHistoryStamp,
  Profile,
} from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FlexCardModal } from "@/components/profile/FlexCardModal";
import {
  User,
  Shield,
  Award,
  Sparkles,
  Flame,
  Trophy,
  Share2,
  Lock,
  Globe,
  Users,
  Eye,
  Check,
  CheckCircle2,
  Stamp,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { arc, habits, logs, totalXp, levelInfo, refresh, triggerConfetti } = useArc();

  const [playerStats, setPlayerStats] = useState<PlayerProfileStats | null>(null);
  const [unlockedTitles, setUnlockedTitles] = useState<Title[]>([]);
  const [arcHistory, setArcHistory] = useState<ArcHistoryStamp[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Profile[]>([]);
  const [isFlexCardOpen, setIsFlexCardOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadProfileData = () => {
    if (!user) return;
    const stats = StorageRepository.getPlayerProfileStats(user.id);
    const titles = StorageRepository.getUserUnlockedTitles(user.id);
    const history = StorageRepository.getArcHistory(user.id);

    setPlayerStats(stats);
    setUnlockedTitles(titles);
    setArcHistory(history);

    // Resolve blocked users
    const blockedList = (stats.blocked_user_ids || [])
      .map((id) => StorageRepository.getProfileById(id))
      .filter((p): p is Profile => p !== null);
    setBlockedUsers(blockedList);
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  if (!user || !playerStats) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#8ED8FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const equippedTitle =
    unlockedTitles.find((t) => t.id === playerStats.equipped_title_id) || null;

  const handleClassChange = (newClass: PlayerClassType) => {
    const updated = StorageRepository.updatePlayerProfileStats(user.id, {
      player_class: newClass,
    });
    setPlayerStats(updated);
    setFeedback(`Player class set to ${newClass}!`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleEquipTitle = (titleId: string) => {
    StorageRepository.equipTitle(user.id, titleId);
    loadProfileData();
    refresh();
    setFeedback("Title equipped!");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handlePrivacyChange = (
    key: "profile_visibility" | "friend_request_permission" | "message_permission",
    val: any
  ) => {
    const updated = StorageRepository.updatePlayerProfileStats(user.id, {
      [key]: val,
    });
    setPlayerStats(updated);
    setFeedback("Privacy settings updated.");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleUnblock = (targetUserId: string) => {
    StorageRepository.unblockUser(user.id, targetUserId);
    loadProfileData();
    setFeedback("User unblocked.");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleStampCurrentArc = () => {
    if (!arc) return;
    const stamp = StorageRepository.stampArcCompletion(user.id, arc.id);
    if (stamp) {
      triggerConfetti();
      loadProfileData();
      setFeedback("Arc Passport stamped successfully! 🏆");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const playerClasses: { type: PlayerClassType; desc: string; icon: string }[] = [
    { type: "Iron Monk", desc: "Relentless discipline, stoic morning routines, zero excuses.", icon: "🧘" },
    { type: "Arc Vanguard", desc: "High intensity, deliberate execution, fast-paced progress.", icon: "⚡" },
    { type: "Frost Sage", desc: "Mindfulness, deep focus, dopamine reset, and mental toughness.", icon: "❄️" },
    { type: "Shadow Striker", desc: "Night discipline, independent warrior, solitary focus.", icon: "🌘" },
    { type: "Titan Builder", desc: "Physical mastery, relentless volume, strength and consistency.", icon: "🏛️" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Header Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0B0E14] via-[#111622] to-[#171F2F] border border-[#8ED8FF]/25 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8ED8FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 rounded-3xl bg-[#151922] border-2 border-[#8ED8FF]/40 overflow-hidden shrink-0 shadow-xl">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.display_name || user.username}
                </h1>
                {equippedTitle && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {equippedTitle.name}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#8ED8FF] font-medium mt-0.5">
                @{user.username}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.08] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#8ED8FF]" />
                  <span>Class: {playerStats.player_class}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-[#8ED8FF] border border-sky-500/30">
                  Level {levelInfo.level}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsFlexCardOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Flex Card</span>
            </Button>

            <Link
              href={`/u/${user.username}`}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Public View</span>
            </Link>
          </div>
        </div>

        {/* Level & XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] relative z-10">
          <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-300">
            <span>Discipline Rank Progress</span>
            <span className="text-[#8ED8FF]">
              {totalXp.toLocaleString()} XP ({levelInfo.progressPercent}% to Level {levelInfo.level + 1})
            </span>
          </div>
          <ProgressBar value={levelInfo.progressPercent} variant="gradient" size="md" />
        </div>

        {feedback && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            {feedback}
          </div>
        )}
      </div>

      {/* Grid: Player Class & Equipped Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Class Selection */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#8ED8FF]" />
              <span>Player Class Archetype</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {playerStats.player_class}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Choose the philosophy that governs your daily discipline and training style.
          </p>

          <div className="space-y-2">
            {playerClasses.map((pc) => {
              const isSelected = playerStats.player_class === pc.type;
              return (
                <button
                  key={pc.type}
                  onClick={() => handleClassChange(pc.type)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[#8ED8FF]/15 border-[#8ED8FF]/50 text-white shadow-sm"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{pc.icon}</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm">{pc.type}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{pc.desc}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8ED8FF] shrink-0" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Equipped Title Selection */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Equip Unlocked Title</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {unlockedTitles.length} unlocked
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Titles appear across your Arc cards, friend circle, and public challenger passport.
          </p>

          <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
            {unlockedTitles.map((t) => {
              const isEquipped = playerStats.equipped_title_id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleEquipTitle(t.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isEquipped
                      ? "bg-amber-500/15 border-amber-500/50 text-white shadow-sm"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="font-black text-xs sm:text-sm text-white">{t.name}</div>
                    <div className="text-[11px] text-slate-400">{t.description}</div>
                  </div>
                  {isEquipped ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 hover:text-white font-semibold shrink-0">
                      Equip
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Arc Passport & Arc History */}
      <Card className="p-6 sm:p-8 space-y-6 border-sky-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-sky-400" />
              <span>Challenger Records</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Arc Passport & History
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Every completed Arc is permanently sealed into your passport as proof of unbroken commitment.
            </p>
          </div>

          {arc && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStampCurrentArc}
              className="flex items-center gap-1.5"
            >
              <Stamp className="w-4 h-4" />
              <span>Seal Active Arc Stamp</span>
            </Button>
          )}
        </div>

        {arcHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <div className="text-3xl opacity-60">📜</div>
            <div className="text-sm font-bold text-white">No Sealed Arc Stamps Yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Finish your current Arc challenge or click &quot;Seal Active Arc Stamp&quot; to archive your progress into your permanent passport.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {arcHistory.map((stamp) => (
              <div
                key={stamp.id}
                className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-sky-500/30 relative overflow-hidden shadow-lg group hover:border-sky-400/50 transition-all"
              >
                {/* Stamp Seal Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-2xl">🏆</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SEALED STAMP
                  </span>
                </div>

                <h4 className="font-black text-base text-white">{stamp.arc_name}</h4>
                <p className="text-xs text-sky-400 font-semibold mt-0.5">{stamp.stamp_title}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-center text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <div className="font-bold text-emerald-400">{stamp.completion_rate}%</div>
                    <div className="text-[10px] text-slate-400 uppercase">Rate</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <div className="font-bold text-amber-400">{stamp.duration_days} Days</div>
                    <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-500 text-center">
                  Stamped on {new Date(stamp.stamped_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Social & Privacy Settings */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-400" />
            <span>Social Privacy & Moderation</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure who can discover your challenger card, send friend requests, or message you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Visibility */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Profile Visibility
            </label>
            <select
              value={playerStats.profile_visibility}
              onChange={(e) => handlePrivacyChange("profile_visibility", e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-sky-400 outline-none"
            >
              <option value="public">Public (Discoverable)</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private (Hidden)</option>
            </select>
          </div>

          {/* Friend Requests */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Friend Requests
            </label>
            <select
              value={playerStats.friend_request_permission}
              onChange={(e) => handlePrivacyChange("friend_request_permission", e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-sky-400 outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="friends_of_friends">Mutual Only</option>
              <option value="none">Disabled</option>
            </select>
          </div>

          {/* Direct Messages */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Direct Messages
            </label>
            <select
              value={playerStats.message_permission}
              onChange={(e) => handlePrivacyChange("message_permission", e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-sky-400 outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="friends_only">Friends Only</option>
              <option value="none">Disabled</option>
            </select>
          </div>
        </div>

        {/* Blocked Users Section */}
        {blockedUsers.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Blocked Users ({blockedUsers.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blockedUsers.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 overflow-hidden">
                      <img
                        src={b.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${b.username}`}
                        alt={b.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{b.display_name || b.username}</div>
                      <div className="text-[10px] text-slate-500">@{b.username}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(b.id)}
                    className="text-xs font-bold text-sky-400 hover:underline px-2 py-1"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Flex Card Modal */}
      <FlexCardModal
        isOpen={isFlexCardOpen}
        onClose={() => setIsFlexCardOpen(false)}
        user={user}
        arc={arc}
        level={levelInfo.level}
        totalXp={totalXp}
        currentStreak={logs.filter((l) => l.completed).length}
        perfectDays={logs.filter((l) => l.completed).length > 0 ? 1 : 0}
        playerStats={playerStats}
        equippedTitle={equippedTitle}
      />
    </div>
  );
}
