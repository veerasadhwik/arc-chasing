"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useArc } from "@/lib/habits/ArcContext";
import { StorageRepository } from "@/lib/storage/repository";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LanguageCode, PrivacySetting, ThemeMode } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Settings, User, Globe, Moon, Shield, Bell, Database, RefreshCw, Check } from "lucide-react";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { refresh } = useArc();

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [privacy, setPrivacy] = useState<PrivacySetting>(user?.privacy || "friends");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName,
      username,
      bio,
      privacy,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleResetData = () => {
    if (confirm("Reset your active habits, logs, and streak progress?")) {
      StorageRepository.resetToDefaults();
      refresh();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          {t("settings.title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal profile, challenge language, privacy controls, and app appearance.
        </p>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t("settings.saved")}</span>
        </div>
      )}

      {/* Profile Section */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-sky-400" />
          {t("settings.profile")}
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Personal Bio / Motto
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Discipline over motivation."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {t("settings.privacy")}
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as PrivacySetting)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white text-sm outline-none"
            >
              <option value="private">Private (Only you can view habits & progress)</option>
              <option value="friends">Friends Only (Accepted squad members can see streak & level)</option>
              <option value="public">Public (Anyone with your username can view your Arc)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              {t("settings.save")}
            </Button>
          </div>
        </form>
      </Card>

      {/* Language & Theme Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Language Selection */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-sky-400" />
            {t("settings.language")}
          </h3>

          <div className="space-y-2">
            {[
              { code: "en" as LanguageCode, label: "English", flag: "🇺🇸" },
              { code: "te" as LanguageCode, label: "తెలుగు (Telugu)", flag: "🇮🇳" },
              { code: "hi" as LanguageCode, label: "हिन्दी (Hindi)", flag: "🇮🇳" },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                  language === item.code
                    ? "bg-sky-500/15 border-sky-400 text-sky-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <span>{item.label}</span>
                </span>
                {language === item.code && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            ))}
          </div>
        </Card>

        {/* Theme Selection */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-sky-400" />
            {t("settings.theme")}
          </h3>

          <div className="space-y-2">
            {[
              { mode: "dark" as ThemeMode, label: "Winter Dark (Default)" },
              { mode: "light" as ThemeMode, label: "Frost Light" },
              { mode: "system" as ThemeMode, label: "System Sync" },
            ].map((item) => (
              <button
                key={item.mode}
                onClick={() => setTheme(item.mode)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                  theme === item.mode
                    ? "bg-sky-500/15 border-sky-400 text-sky-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span>{item.label}</span>
                {theme === item.mode && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Backend & Supabase Status */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-sky-400" />
          Backend Storage Engine
        </h3>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? "bg-emerald-400" : "bg-sky-400 animate-pulse"
                }`}
              />
              <span>
                {isSupabaseConfigured
                  ? "Connected to Live Supabase PostgreSQL"
                  : "Local Client Storage Engine (Active)"}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {isSupabaseConfigured
                ? "All habit logs and streaks synchronize with cloud database."
                : "Full offline-capable storage. Configure .env.local to enable cloud sync anytime."}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-xs font-bold text-slate-200">Demo Reset</div>
            <div className="text-[11px] text-slate-400">Restore default 8 habits and Day 15 starter data</div>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetData}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
