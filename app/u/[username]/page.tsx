"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { StorageRepository } from "@/lib/storage/repository";
import {
  Profile,
  PlayerProfileStats,
  Title,
  ArcHistoryStamp,
  FriendshipRelationState,
  Achievement,
} from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DirectChatModal } from "@/components/chat/DirectChatModal";
import {
  Shield,
  Award,
  Sparkles,
  Flame,
  Trophy,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  MessageSquare,
  Lock,
  ArrowLeft,
  Stamp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { getLevelProgress } from "@/lib/utils";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = typeof params?.username === "string" ? params.username : "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerProfileStats | null>(null);
  const [equippedTitle, setEquippedTitle] = useState<Title | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<Achievement[]>([]);
  const [arcHistory, setArcHistory] = useState<ArcHistoryStamp[]>([]);
  const [relation, setRelation] = useState<FriendshipRelationState>("NOT_CONNECTED");
  const [totalXp, setTotalXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadData = () => {
    if (!username) return;
    const targetProfile = StorageRepository.getProfileByUsername(username);
    if (!targetProfile) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setProfile(targetProfile);

    const stats = StorageRepository.getPlayerProfileStats(targetProfile.id);
    const xp = StorageRepository.getUserXP(targetProfile.id);
    const history = StorageRepository.getArcHistory(targetProfile.id);
    const titles = StorageRepository.getTitles();
    const equipped = titles.find((t) => t.id === stats.equipped_title_id) || null;

    // Badges
    const allAchs = StorageRepository.getAchievements();
    const userAchs = StorageRepository.getUserAchievements(targetProfile.id);
    const achIds = new Set(userAchs.map((u) => u.achievement_id));
    const badges = allAchs.filter((a) => achIds.has(a.id));

    setPlayerStats(stats);
    setTotalXp(xp);
    setEquippedTitle(equipped);
    setUnlockedBadges(badges);
    setArcHistory(history);

    if (currentUser) {
      const rel = StorageRepository.getFriendshipRelation(currentUser.id, targetProfile.id);
      setRelation(rel);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [username, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#8ED8FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile || !playerStats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
          🔍
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">Challenger Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
          No active profile exists for @{username}. The challenger may have changed their username or deleted their account.
        </p>
        <Link href="/friends">
          <Button variant="frost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Friends
          </Button>
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && currentUser.id === profile.id;
  const isPrivate =
    !isSelf &&
    (playerStats.profile_visibility === "private" ||
      (playerStats.profile_visibility === "friends" && relation !== "FRIENDS"));

  const levelInfo = getLevelProgress(totalXp);

  const handleSendFriendRequest = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const res = StorageRepository.sendFriendRequest(currentUser.id, profile.id);
    setFeedback(res.message);
    loadData();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAcceptFriendRequest = () => {
    if (!currentUser) return;
    const reqs = StorageRepository.getFriendRequests(currentUser.id);
    const req = reqs.incoming.find((r) => r.sender_id === profile.id);
    if (req) {
      const res = StorageRepository.acceptFriendRequest(req.id, currentUser.id);
      setFeedback(res.message);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back Link */}
      <Link
        href="/friends"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Circle</span>
      </Link>

      {/* Challenger Hero Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0B0E14] via-[#111622] to-[#171F2F] border border-[#8ED8FF]/25 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8ED8FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 rounded-3xl bg-[#151922] border-2 border-[#8ED8FF]/40 overflow-hidden shrink-0 shadow-xl">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile.display_name || profile.username}
                </h1>
                {equippedTitle && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {equippedTitle.name}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#8ED8FF] font-medium mt-0.5">
                @{profile.username}
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

          {/* Social Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {isSelf ? (
              <Link href="/profile">
                <Button variant="primary" size="sm">
                  Edit My Profile
                </Button>
              </Link>
            ) : relation === "FRIENDS" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </Button>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Friends</span>
                </span>
              </div>
            ) : relation === "REQUEST_SENT" ? (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>Request Sent</span>
              </span>
            ) : relation === "REQUEST_RECEIVED" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptFriendRequest}
                className="flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept Friend Request</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendFriendRequest}
                className="flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Friend</span>
              </Button>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed relative z-10">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        {feedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold">
            {feedback}
          </div>
        )}
      </div>

      {/* Private Profile Notice */}
      {isPrivate ? (
        <Card className="p-8 text-center space-y-3 border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">This Challenger&apos;s Passport is Private</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {playerStats.profile_visibility === "friends"
              ? "Connect with this challenger to inspect their Arc Passport stamps and milestone badges."
              : "This user has restricted their activity and passport to private mode."}
          </p>
          {relation === "NOT_CONNECTED" && (
            <Button
              variant="frost"
              size="sm"
              onClick={handleSendFriendRequest}
              className="mt-2"
            >
              Send Friend Request
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Arc Passport & Stamped Records */}
          <Card className="p-6 sm:p-8 space-y-4 border-sky-500/20">
            <div className="flex items-center gap-2">
              <Stamp className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-black text-white tracking-tight">
                Sealed Arc Passport ({arcHistory.length})
              </h3>
            </div>

            {arcHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                No sealed Arc stamps in this challenger&apos;s passport yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {arcHistory.map((stamp) => (
                  <div
                    key={stamp.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-sky-500/30 text-center space-y-1"
                  >
                    <div className="text-xl">🏆</div>
                    <div className="font-bold text-sm text-white">{stamp.arc_name}</div>
                    <div className="text-[11px] text-sky-400 font-semibold">{stamp.stamp_title}</div>
                    <div className="text-[10px] text-slate-400 mt-2">
                      {stamp.completion_rate}% Completion • {stamp.duration_days} Days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Unlocked Badges Showcase */}
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white tracking-tight">
                Unlocked Milestone Badges ({unlockedBadges.length})
              </h3>
            </div>

            {unlockedBadges.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                No milestone badges unlocked yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1.5"
                  >
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="font-bold text-xs text-white truncate">{badge.name}</div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400">
                      {badge.rarity || "Common"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Direct Chat Modal */}
      <DirectChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        friend={profile}
      />
    </div>
  );
}
