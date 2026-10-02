"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { StorageRepository } from "@/lib/storage/repository";
import { AppNotification } from "@/types/database";
import {
  Bell,
  CheckCheck,
  UserPlus,
  UserCheck,
  MessageSquare,
  Trophy,
  Sparkles,
  Flame,
  Info,
} from "lucide-react";

export function NotificationCenter() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const list = StorageRepository.getUserNotifications(user.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    if (!user) return;
    StorageRepository.markAllNotificationsAsRead(user.id);
    loadNotifications();
  };

  const handleItemClick = (notif: AppNotification) => {
    if (!user) return;
    StorageRepository.markNotificationAsRead(user.id, notif.id);
    loadNotifications();
    setIsOpen(false);
    if (notif.link_url) {
      router.push(notif.link_url);
    }
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="w-4 h-4 text-sky-400" />;
      case "friend_accepted":
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case "direct_message":
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case "badge_unlocked":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case "level_up":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "streak_milestone":
        return <Flame className="w-4 h-4 text-orange-400" />;
      default:
        return <Info className="w-4 h-4 text-[#8ED8FF]" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return "just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-[#151922] hover:bg-[#1A1F2B] border border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA] transition-colors"
        aria-label="Notifications"
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#080A0F] shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#151922] border border-white/[0.1] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F7FA] tracking-wide uppercase">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-[#8ED8FF] border border-sky-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#8D95A5] hover:text-[#8ED8FF] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.05]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="text-2xl opacity-60">🔔</div>
                <div className="text-xs font-bold text-[#F5F7FA]">No notifications yet</div>
                <p className="text-[11px] text-[#8D95A5] leading-relaxed">
                  Conquer habits, level up, or connect with accountability partners to receive live updates.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-white/[0.04] ${
                    !notif.is_read ? "bg-white/[0.02]" : "opacity-80"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h5 className="text-xs font-bold text-[#F5F7FA] truncate">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-[#8D95A5] shrink-0 font-medium">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8D95A5] line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 self-center" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
