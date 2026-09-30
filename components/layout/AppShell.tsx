"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/signup";
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  // Public unauthenticated routes: full bleed
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Loading authenticated session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#151922] border border-white/[0.08] flex items-center justify-center text-xl animate-pulse shadow-lg">
          ❄️
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8ED8FF] tracking-widest uppercase">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>LOADING YOUR DAY...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and attempting to view protected route, show redirecting splash
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center space-y-4">
        <div className="text-xs font-bold text-[#8D95A5] uppercase tracking-wider">
          REDIRECTING TO LOGIN...
        </div>
      </div>
    );
  }

  // Onboarding wizard: focused standalone view
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex flex-col">
        <main className="flex-1 flex flex-col justify-center">{children}</main>
      </div>
    );
  }

  // Standard authenticated dashboard shell
  return (
    <>
      <Header />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          {children}
        </main>
      </div>
      <MobileNav />
    </>
  );
}
