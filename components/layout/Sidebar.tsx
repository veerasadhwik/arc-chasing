"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Compass,
  CalendarDays,
  BarChart3,
  Trophy,
  Users,
  Shield,
  Share2,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard", icon: CheckCircle2 },
    { label: t("nav.arc"), href: "/arc", icon: Compass },
    { label: t("nav.calendar"), href: "/calendar", icon: CalendarDays },
    { label: t("nav.analytics"), href: "/analytics", icon: BarChart3 },
    { label: t("nav.achievements"), href: "/achievements", icon: Trophy },
    { label: t("nav.friends"), href: "/friends", icon: Users },
    { label: t("nav.groups"), href: "/groups", icon: Shield },
    { label: t("nav.profile"), href: "/profile", icon: User },
    { label: t("nav.share"), href: "/share", icon: Share2 },
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-white/[0.08] bg-[#080A0F] p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-white/[0.06] text-[#8ED8FF] font-bold border border-white/[0.08]"
                  : "text-[#8D95A5] hover:text-[#F5F7FA] hover:bg-white/[0.03]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-[#8ED8FF]" : "text-[#8D95A5] group-hover:text-[#F5F7FA]"
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8ED8FF]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="pt-3 border-t border-white/[0.08] mt-auto space-y-1.5">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-[#151922] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-[#8ED8FF] overflow-hidden">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-[#8ED8FF]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#F5F7FA] truncate">
              {user?.display_name || user?.username || "Veera"}
            </div>
            <div className="text-[10px] text-[#8D95A5] truncate">
              @{user?.username || "veera"}
            </div>
          </div>
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t("app.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
