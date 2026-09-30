import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ArcProvider } from "@/lib/habits/ArcContext";
import { AppShell } from "@/components/layout/AppShell";

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
                <AppShell>{children}</AppShell>
              </ArcProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
