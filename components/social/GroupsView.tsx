"use client";

import React, { useState, useEffect, useRef } from "react";
import { StorageRepository } from "@/lib/storage/repository";
import { Group, GroupMessage } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Shield,
  Users,
  Flame,
  Plus,
  Copy,
  Check,
  TrendingUp,
  MessageSquare,
  Send,
  X,
} from "lucide-react";

export function GroupsView() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Squad Chat State
  const [activeChatGroup, setActiveChatGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  const loadGroups = () => {
    setGroups(StorageRepository.getGroups());
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroupMessages = () => {
    if (!activeChatGroup) return;
    const msgs = StorageRepository.getGroupMessages(activeChatGroup.id);
    setGroupMessages(msgs);
  };

  useEffect(() => {
    if (!activeChatGroup) return;
    loadGroupMessages();
    const interval = setInterval(loadGroupMessages, 2500);
    return () => clearInterval(interval);
  }, [activeChatGroup]);

  useEffect(() => {
    if (activeChatGroup) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages, activeChatGroup]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    StorageRepository.createGroup(user?.id || "user-local", newGroupName.trim(), newGroupDesc.trim());
    loadGroups();
    setIsCreateOpen(false);
    setNewGroupName("");
    setNewGroupDesc("");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const res = StorageRepository.joinGroup(joinCode.trim());
    setFeedback(res.message);
    if (res.success) {
      loadGroups();
      setIsJoinOpen(false);
      setJoinCode("");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendGroupMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeChatGroup || !user) return;

    StorageRepository.sendGroupMessage(
      activeChatGroup.id,
      user.id,
      user.display_name || user.username || "Challenger",
      messageText.trim(),
      user.avatar_url
    );
    setMessageText("");
    loadGroupMessages();
  };

  const handleQuickCheer = (cheer: string) => {
    if (!activeChatGroup || !user) return;
    StorageRepository.sendGroupMessage(
      activeChatGroup.id,
      user.id,
      user.display_name || user.username || "Challenger",
      cheer,
      user.avatar_url
    );
    loadGroupMessages();
  };

  const quickCheers = [
    "🔥 Squad streak safe today!",
    "⚡ 100% Locked in!",
    "💪 Let's conquer the day!",
    "❄️ Unstoppable discipline!",
  ];

  return (
    <div className="space-y-6">
      {/* Header and Squad Actions */}
      <div className="glass-panel rounded-3xl p-6 border border-sky-500/20 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-400" />
            {t("social.groupsTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conquer challenges together with your university, gym, or engineering squad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsJoinOpen(true)}>
            {t("social.joinGroup")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>{t("social.createGroup")}</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{group.name}</h3>
                  {group.description && (
                    <p className="text-xs text-slate-400 mt-1">{group.description}</p>
                  )}
                </div>

                {/* Invite code chip */}
                <button
                  onClick={() => copyCode(group.invite_code)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
                  title="Click to copy invite code"
                >
                  <span>{group.invite_code}</span>
                  {copiedCode === group.invite_code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Squad Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800 text-center">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-white">
                    <Users className="w-4 h-4 text-sky-400" />
                    {group.members_count || 1}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Members
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-emerald-400">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    {group.avg_completion || 100}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Squad Avg
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-amber-400">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {group.group_streak || 1}d
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Squad Streak
                  </div>
                </div>
              </div>
            </div>

            {/* Squad Chat Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Live Squad Feed
              </span>
              <Button
                size="sm"
                variant="frost"
                onClick={() => setActiveChatGroup(group)}
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Squad Chat</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Squad Chat Modal */}
      {activeChatGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0E121A] border border-white/[0.1] rounded-3xl shadow-2xl flex flex-col h-[580px] max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5F7FA]">
                    {activeChatGroup.name}
                  </h4>
                  <p className="text-[11px] text-[#8ED8FF] font-medium">
                    {activeChatGroup.members_count || 1} Active Challengers
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveChatGroup(null)}
                className="p-2 rounded-xl text-[#8D95A5] hover:text-[#F5F7FA] hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080A0F]/50">
              {groupMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-1">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-[#F5F7FA]">Squad Cheer Channel</h5>
                  <p className="text-xs text-[#8D95A5] max-w-xs">
                    Start the conversation. Post your morning victories, cheer on teammates, and keep squad discipline high.
                  </p>
                </div>
              ) : (
                groupMessages.map((m) => {
                  const isMine = user && m.sender_id === user.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      {!isMine && (
                        <span className="text-[10px] font-bold text-sky-400 mb-0.5 px-1">
                          {m.sender_name}
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm break-words ${
                          isMine
                            ? "bg-[#8ED8FF] text-[#080A0F] font-medium rounded-tr-none"
                            : "bg-[#151922] text-[#F5F7FA] border border-white/[0.08] rounded-tl-none"
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[10px] text-[#8D95A5] mt-1 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Cheers */}
            <div className="px-4 py-2 bg-white/[0.01] border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickCheers.map((cheer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickCheer(cheer)}
                  className="px-2.5 py-1 rounded-xl bg-[#151922] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-medium text-[#8D95A5] hover:text-[#F5F7FA] whitespace-nowrap transition-colors"
                >
                  {cheer}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendGroupMessage}
              className="p-3 bg-[#0E121A] border-t border-white/[0.08] flex items-center gap-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Post to squad channel..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#151922] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#8D95A5] focus:outline-none focus:border-[#8ED8FF]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 rounded-2xl bg-[#8ED8FF] hover:bg-[#A6E2FF] disabled:opacity-40 text-[#080A0F] font-bold transition-all shadow-sm flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Squad Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Arc Squad"
        description="Lead a group challenge with your friends or classmates."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Squad Name *
            </label>
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. CSE Winter Arc 2026, 5 AM Spartans"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Squad Motto / Description
            </label>
            <input
              type="text"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="e.g. 90 days of ruthless consistency."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Squad
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Squad Modal */}
      <Modal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        title="Join Arc Squad"
        description="Enter the 8-character invite code provided by your squad leader."
      >
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Invite Code *
            </label>
            <input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. CSEARC90, EARLY5AM"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm font-mono tracking-widest outline-none uppercase"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsJoinOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Join Squad
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
