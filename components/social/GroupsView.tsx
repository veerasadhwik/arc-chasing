"use client";

import React, { useState } from "react";
import { StorageRepository } from "@/lib/storage/repository";
import { Group } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { Shield, Users, Flame, Plus, Copy, Check, TrendingUp } from "lucide-react";

export function GroupsView() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>(StorageRepository.getGroups());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    StorageRepository.createGroup(user?.id || "user-local", newGroupName.trim(), newGroupDesc.trim());
    setGroups(StorageRepository.getGroups());
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
      setGroups(StorageRepository.getGroups());
      setIsJoinOpen(false);
      setJoinCode("");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
          <Card key={group.id} className="p-6">
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
          </Card>
        ))}
      </div>

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
