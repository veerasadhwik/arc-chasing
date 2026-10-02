"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageCode } from "@/types/database";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Globe } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [animPhase, setAnimPhase] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimPhase(1), 100);
    const t2 = setTimeout(() => setAnimPhase(2), 350);
    const t3 = setTimeout(() => setAnimPhase(3), 600);
    const t4 = setTimeout(() => setAnimPhase(4), 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await signup(name.trim(), email.trim(), password, selectedLang);

    if (res.success && res.user) {
      setLanguage(selectedLang);
      setSuccessName(res.user.display_name?.toUpperCase() || name.toUpperCase());
      setTimeout(() => {
        router.push("/onboarding");
      }, 700);
    } else {
      setIsLoading(false);
      setError(res.error || "We couldn't create your account right now. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#080A0F]">
      {/* Cinematic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-[#8ED8FF]/10 via-[#38bdf8]/05 to-transparent rounded-full blur-3xl animate-ambient-glow" />
        <div className="absolute inset-0 bg-[radial-gradient(#8ED8FF_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div
            className={`transition-all duration-300 ease-out transform ${
              animPhase >= 1 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-3"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151922] border border-white/[0.08] text-[#8ED8FF] text-[11px] font-bold tracking-widest uppercase mb-2 shadow-inner">
              <span className="text-xs">⚡</span>
              <span>ARC-CHASER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F7FA] tracking-tight uppercase">
              CREATE YOUR ACCOUNT
            </h1>
          </div>

          <div
            className={`transition-all duration-300 ease-out ${
              animPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <p className="text-xs sm:text-sm text-[#8D95A5] font-medium">
              “Chase Your Arc. Build Your Future.”
            </p>
          </div>
        </div>

        {/* Glass Signup Form */}
        <div
          className={`transition-all duration-400 ease-out ${
            animPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-[#151922]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            {successName ? (
              <div className="py-8 text-center space-y-3 animate-auth-fade">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
                  WELCOME, {successName}.
                </div>
                <div className="text-xs text-[#8D95A5]">
                  Preparing your Arc builder...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold animate-auth-fade flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Veera"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] placeholder-[#8D95A5]/60 text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="name@example.com"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] placeholder-[#8D95A5]/60 text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full px-3.5 py-2.5 pr-9 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] placeholder-[#8D95A5]/60 text-sm outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-3 text-[#8D95A5] hover:text-[#F5F7FA]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
                      Confirm
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] placeholder-[#8D95A5]/60 text-sm outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Language Picker */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#8ED8FF]" />
                    <span>Preferred Language</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: "en", label: "English", flag: "🇺🇸" },
                      { code: "te", label: "తెలుగు", flag: "🇮🇳" },
                      { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
                    ].map((l) => (
                      <button
                        type="button"
                        key={l.code}
                        onClick={() => setSelectedLang(l.code as LanguageCode)}
                        className={`py-2 px-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          selectedLang === l.code
                            ? "bg-[#8ED8FF]/15 border-[#8ED8FF] text-[#8ED8FF]"
                            : "bg-[#10131A] border-white/[0.08] text-[#8D95A5] hover:text-[#F5F7FA]"
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3 px-6 rounded-2xl bg-[#8ED8FF] hover:bg-[#A6E2FF] active:scale-[0.99] text-[#080A0F] font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-[#8ED8FF]/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#080A0F]" />
                      <span>CREATING YOUR ACCOUNT...</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE MY ACCOUNT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-4 border-t border-white/[0.08] text-xs text-[#8D95A5]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#8ED8FF] hover:underline font-bold">
                Log In
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[#8D95A5]">
          <Link href="/" className="hover:text-[#F5F7FA] transition-colors">
            ← Back to Winter Arc
          </Link>
        </div>
      </div>
    </div>
  );
}
