"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StorageRepository } from "@/lib/storage/repository";
import { useAuth } from "@/lib/auth/AuthContext";
import { Profile, FriendRequest, FriendshipRelationState } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DirectChatModal } from "@/components/chat/DirectChatModal";
import {
  Users,
  UserPlus,
  Flame,
  Trash2,
  Check,
  Shield,
  Sparkles,
  Search,
  UserCheck,
  MessageSquare,
  Clock,
  CheckCircle,
  X,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export function FriendsView() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "community">("friends");
  const [friends, setFriends] = useState<Profile[]>([]);
  const [registeredAccounts, setRegisteredAccounts] = useState<Profile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Chat Modal State
  const [chatFriend, setChatFriend] = useState<Profile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadData = () => {
    if (!user) return;
    const userFriends = StorageRepository.getFriends(user.id);
    const accounts = StorageRepository.getRegisteredAccounts(user.id);
    const reqs = StorageRepository.getFriendRequests(user.id);

    setFriends(userFriends);
    setRegisteredAccounts(accounts);
    setIncomingRequests(reqs.incoming);
    setOutgoingRequests(reqs.outgoing);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Check if URL has ?chatWith=userId
  useEffect(() => {
    const chatWithId = searchParams.get("chatWith");
    if (chatWithId && user) {
      const target = StorageRepository.getProfileById(chatWithId);
      if (target) {
        setChatFriend(target);
        setIsChatOpen(true);
      }
    }
  }, [searchParams, user]);

  const handleSendRequest = (targetUserId: string) => {
    if (!user) return;
    const res = StorageRepository.sendFriendRequest(user.id, targetUserId);
    setFeedback({ text: res.message, isError: !res.success });
    loadData();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAcceptRequest = (requestId: string) => {
    if (!user) return;
    const res = StorageRepository.acceptFriendRequest(requestId, user.id);
    setFeedback({ text: res.message, isError: !res.success });
    loadData();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeclineRequest = (requestId: string) => {
    if (!user) return;
    const res = StorageRepository.declineFriendRequest(requestId, user.id);
    setFeedback({ text: res.message, isError: !res.success });
    loadData();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCancelRequest = (requestId: string) => {
    if (!user) return;
    const res = StorageRepository.cancelFriendRequest(requestId, user.id);
    setFeedback({ text: res.message, isError: !res.success });
    loadData();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemoveFriend = (friendId: string) => {
    if (!user) return;
    StorageRepository.removeFriend(friendId, user.id);
    loadData();
  };

  const handleBlockUser = (targetUserId: string) => {
    if (!user) return;
    StorageRepository.blockUser(user.id, targetUserId);
    setFeedback({ text: "User has been blocked.", isError: false });
    loadData();
    setTimeout(() => setFeedback(null), 3000);
  };

  const openChatWith = (friend: Profile) => {
    setChatFriend(friend);
    setIsChatOpen(true);
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
              <span>Arc-Chaser Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Accountability Circle
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Mutual accountability. Send friend requests, direct message, and inspect public challenger passports.
            </p>
          </div>

          {/* Tab Pill Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "friends"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              My Circle ({friends.length})
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "requests"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Requests</span>
              {incomingRequests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("community")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "community"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Created Accounts ({registeredAccounts.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 flex gap-2 max-w-lg">
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
        </div>

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
              Connected Circle ({filteredFriends.length})
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
                Discipline is multiplied with accountability partners. Send friend requests to challengers from the Created Accounts tab.
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
                        <Link href={`/u/${friend.username}`}>
                          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 overflow-hidden shrink-0 hover:scale-105 transition-transform cursor-pointer">
                            <img
                              src={friend.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`}
                              alt={friend.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div>
                          <Link href={`/u/${friend.username}`} className="hover:underline">
                            <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                              {friend.display_name || friend.username}
                            </h4>
                          </Link>
                          <p className="text-xs text-sky-400">@{friend.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove Friend"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {friend.bio && (
                      <p className="text-xs text-slate-300 mt-3 font-medium line-clamp-2">
                        {friend.bio}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openChatWith(friend)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </Button>

                    <Link
                      href={`/u/${friend.username}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Friend Requests Inbox */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Incoming Friend Requests</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300">
                {incomingRequests.length}
              </span>
            </h3>

            {incomingRequests.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-400">
                No pending incoming requests.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingRequests.map((req) => {
                  const sender = req.sender_profile || {
                    id: req.sender_id,
                    username: "challenger",
                    display_name: "Challenger",
                    avatar_url: null,
                  };
                  return (
                    <Card key={req.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 overflow-hidden shrink-0">
                          <img
                            src={sender.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sender.username}`}
                            alt={sender.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">
                            {sender.display_name || sender.username}
                          </div>
                          <div className="text-xs text-sky-400">@{sender.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="text-xs px-3 py-1.5"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeclineRequest(req.id)}
                          className="text-xs px-2.5 py-1.5 text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Outgoing Sent Requests</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                {outgoingRequests.length}
              </span>
            </h3>

            {outgoingRequests.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-400">
                No active outgoing requests.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outgoingRequests.map((req) => {
                  const receiver = req.receiver_profile || {
                    id: req.receiver_id,
                    username: "user",
                    display_name: "Challenger",
                    avatar_url: null,
                  };
                  return (
                    <Card key={req.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                          <img
                            src={receiver.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${receiver.username}`}
                            alt={receiver.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">
                            {receiver.display_name || receiver.username}
                          </div>
                          <div className="text-xs text-slate-400">@{receiver.username}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelRequest(req.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-rose-500/10 transition-colors"
                      >
                        Cancel Request
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Created Accounts on Platform */}
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
              <h4 className="text-base font-bold text-white">No other accounts found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When new users sign up on the platform, their accounts will appear here for connecting.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunity.map((acc) => {
                const relation: FriendshipRelationState = user
                  ? StorageRepository.getFriendshipRelation(user.id, acc.id)
                  : "NOT_CONNECTED";

                return (
                  <Card key={acc.id} className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/u/${acc.username}`}>
                            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 overflow-hidden shrink-0 hover:scale-105 transition-transform cursor-pointer">
                              <img
                                src={acc.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${acc.username}`}
                                alt={acc.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>
                          <div>
                            <Link href={`/u/${acc.username}`} className="hover:underline">
                              <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                                {acc.display_name || acc.username}
                              </h4>
                            </Link>
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
                      <Link
                        href={`/u/${acc.username}`}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                      >
                        <span>Passport</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      {relation === "FRIENDS" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openChatWith(acc)}
                            className="p-1.5 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
                            title="Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Friends</span>
                          </span>
                        </div>
                      ) : relation === "REQUEST_SENT" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Request Sent</span>
                        </span>
                      ) : relation === "REQUEST_RECEIVED" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setActiveTab("requests")}
                          className="flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Respond</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="frost"
                          onClick={() => handleSendRequest(acc.id)}
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

      {/* Direct Chat Modal */}
      <DirectChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        friend={chatFriend}
      />
    </div>
  );
}
