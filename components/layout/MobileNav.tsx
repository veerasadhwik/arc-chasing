"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, Compass, CalendarDays, Users, User, Settings } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard", icon: CheckCircle2 },
    { label: t("nav.arc"), href: "/arc", icon: Compass },
    { label: t("nav.calendar"), href: "/calendar", icon: CalendarDays },
    { label: t("nav.friends"), href: "/friends", icon: Users },
    { label: t("nav.profile"), href: "/profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080A0F]/90 border-t border-white/[0.08] backdrop-blur-xl px-2 py-1.5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 select-none",
                isActive
                  ? "text-[#8ED8FF] font-bold"
                  : "text-[#8D95A5] hover:text-[#F5F7FA]"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-transform",
                  isActive && "bg-white/[0.06] scale-105"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-[#8ED8FF]" : "text-[#8D95A5]"
                  )}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
