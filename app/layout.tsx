import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ArcProvider } from "@/lib/habits/ArcContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Winter Arc — 90 Days. One Version Better.",
  description:
    "Don't just track your habits. Build your arc. Customizable 90-day challenge and discipline platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080A0F] text-[#F5F7FA] min-h-screen flex flex-col antialiased selection:bg-[#8ED8FF] selection:text-[#080A0F]">
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ArcProvider>
                <Header />
                <div className="flex-1 flex max-w-7xl w-full mx-auto">
                  <Sidebar />
                  <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
                    {children}
                  </main>
                </div>
                <MobileNav />
              </ArcProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
