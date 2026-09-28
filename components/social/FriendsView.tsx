"use client";

import React, { useState } from "react";
import { StorageRepository } from "@/lib/storage/repository";
import { Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Users, UserPlus, Flame, Trophy, Trash2, Check, Shield } from "lucide-react";

export function FriendsView() {
  const [friends, setFriends] = useState<Profile[]>(StorageRepository.getFriends());
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = StorageRepository.addFriend(searchQuery.trim());
    setFeedback(res.message);
    if (res.success) {
      setFriends(StorageRepository.getFriends());
      setSearchQuery("");
    }
  };

  const handleRemoveFriend = (id: string) => {
    StorageRepository.removeFriend(id);
    setFriends(StorageRepository.getFriends());
  };

  return (
    <div className="space-y-6">
      {/* Header and Friend Search */}
      <div className="glass-panel rounded-3xl p-6 border border-sky-500/20 bg-slate-900/60">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-400" />
          {t("social.friendsTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Build mutual accountability. Challenge and push each other through the 90-day Arc.
        </p>

        <form onSubmit={handleAddFriend} className="mt-4 flex gap-2 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("social.searchPlaceholder")}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-xs sm:text-sm outline-none transition-colors"
          />
          <Button type="submit" variant="primary" size="md">
            <UserPlus className="w-4 h-4" />
            <span>{t("social.addFriend")}</span>
          </Button>
        </form>

        {feedback && (
          <div className="mt-2 text-xs font-semibold text-sky-400">
            {feedback}
          </div>
        )}
      </div>

      {/* Friends Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 overflow-hidden shrink-0">
                    <img
                      src={friend.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`}
                      alt={friend.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                      {friend.display_name || friend.username}
                    </h4>
                    <p className="text-xs text-sky-400">@{friend.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove Friend"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {friend.bio && (
                <p className="text-xs text-slate-300 mt-3 font-medium">
                  {friend.bio}
                </p>
              )}
            </div>

            {/* Friend Challenge Stats */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="font-bold text-sky-300">Winter Arc</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Challenge</div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  18d
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Streak</div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="font-bold text-emerald-400">82%</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Score</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
