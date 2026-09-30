"use client";

import React, { useState, useEffect } from "react";
import { StorageRepository } from "@/lib/storage/repository";
import { useAuth } from "@/lib/auth/AuthContext";
import { Profile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Users,
  UserPlus,
  Flame,
  Trophy,
  Trash2,
  Check,
  Shield,
  Sparkles,
  Search,
  UserCheck,
} from "lucide-react";

export function FriendsView() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"friends" | "community">("friends");
  const [friends, setFriends] = useState<Profile[]>([]);
  const [registeredAccounts, setRegisteredAccounts] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadData = () => {
    const userFriends = StorageRepository.getFriends(user?.id);
    const accounts = StorageRepository.getRegisteredAccounts(user?.id);
    setFriends(userFriends);
    setRegisteredAccounts(accounts);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const friendIds = new Set(friends.map((f) => f.id));
  const friendUsernames = new Set(friends.map((f) => f.username.toLowerCase()));

  const handleAddFriend = (identifier: string) => {
    const res = StorageRepository.addFriend(identifier, user?.id);
    setFeedback({ text: res.message, isError: !res.success });
    if (res.success) {
      loadData();
      setSearchQuery("");
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleAddFriend(searchQuery.trim());
  };

  const handleRemoveFriend = (id: string) => {
    StorageRepository.removeFriend(id, user?.id);
    loadData();
  };

  // Filtered lists
  const filteredFriends = friends.filter(
    (f) =>
      (f.display_name || f.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunity = registeredAccounts.filter(
    (a) =>
      (a.display_name || a.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Friend Search */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-sky-500/20 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Winter Arc Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {t("social.friendsTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Mutual accountability. All created user accounts on this site are discoverable below.
            </p>
          </div>

          {/* Tab Pill Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "friends"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              My Circle ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "community"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Created Accounts ({registeredAccounts.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or display name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-xs sm:text-sm outline-none transition-colors"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("social.addFriend")}</span>
          </Button>
        </form>

        {feedback && (
          <div
            className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-xl inline-block ${
              feedback.isError
                ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Tab 1: My Friends Circle */}
      {activeTab === "friends" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Your Accountability Circle ({filteredFriends.length})
            </h3>
            {filteredFriends.length === 0 && (
              <button
                onClick={() => setActiveTab("community")}
                className="text-xs font-bold text-sky-400 hover:underline"
              >
                Browse created accounts →
              </button>
            )}
          </div>

          {filteredFriends.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <div className="text-3xl">🤝</div>
              <h4 className="text-base font-bold text-white">No friends connected yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Discipline is magnified with accountability partners. Add challengers from the Created Accounts tab to see their daily progress.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("community")}
                className="mt-2"
              >
                Discover Created Accounts
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="p-5 flex flex-col justify-between group hover:border-sky-500/30 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 overflow-hidden shrink-0">
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
                      <p className="text-xs text-slate-300 mt-3 font-medium line-clamp-2">
                        {friend.bio}
                      </p>
                    )}
                  </div>

                  {/* Challenge Stats */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="font-bold text-sky-300 truncate">Winter Arc</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Challenge</div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        Active
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Streak</div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="font-bold text-emerald-400">Lock-in</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Standard</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Created Accounts on Platform */}
      {activeTab === "community" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>All Registered Accounts on this Platform</span>
              <span className="text-xs font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                {registeredAccounts.length} Total
              </span>
            </h3>
          </div>

          {filteredCommunity.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <div className="text-2xl">🌱</div>
              <h4 className="text-base font-bold text-white">No other accounts registered yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When new users sign up on the platform, their accounts will appear here for 1-click connecting.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunity.map((acc) => {
                const isAlreadyFriend =
                  friendIds.has(acc.id) || friendUsernames.has(acc.username.toLowerCase());

                return (
                  <Card key={acc.id} className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 overflow-hidden shrink-0">
                            <img
                              src={acc.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${acc.username}`}
                              alt={acc.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                              {acc.display_name || acc.username}
                            </h4>
                            <p className="text-xs text-sky-400">@{acc.username}</p>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                          {acc.language.toUpperCase()}
                        </span>
                      </div>

                      {acc.bio && (
                        <p className="text-xs text-slate-300 mt-3 font-medium line-clamp-2">
                          {acc.bio}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {acc.timezone || "Local timezone"}
                      </span>

                      {isAlreadyFriend ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="frost"
                          onClick={() => handleAddFriend(acc.id)}
                          className="flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                          <span>Add Friend</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
