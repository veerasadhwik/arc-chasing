"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Eye, EyeOff, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, resetPassword } = useAuth();

  // Animation sequence states (250ms - 500ms intervals)
  const [animPhase, setAnimPhase] = useState(0);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  useEffect(() => {
    // 0: Initial mount
    // 1: Brand reveal (100ms)
    // 2: "Welcome back." (350ms)
    // 3: "Continue your Arc." (600ms)
    // 4: Reveal form (850ms)
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
    if (!identifier.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await login(identifier, password);

    if (res.success && res.user) {
      const name = res.user.display_name || res.user.username || "WARRIOR";
      setSuccessName(name.toUpperCase());
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } else {
      setIsLoading(false);
      setError(res.error || "Those details don't match an account.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    const res = await resetPassword(forgotEmail);
    setForgotMsg(res.message);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#080A0F]">
      {/* Cinematic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#8ED8FF]/10 via-[#38bdf8]/05 to-transparent rounded-full blur-3xl animate-ambient-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/05 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#8ED8FF_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Brand Header with Sequential Cinematic Typography */}
        <div className="text-center space-y-3">
          {/* Phase 1: Winter Arc Emblem & Title */}
          <div
            className={`transition-all duration-300 ease-out transform ${
              animPhase >= 1 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-3"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151922] border border-white/[0.08] text-[#8ED8FF] text-[11px] font-bold tracking-widest uppercase mb-2 shadow-inner">
              <span className="text-xs">❄️</span>
              <span>WINTER ARC</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F7FA] tracking-tight uppercase">
              WINTER ARC
            </h1>
          </div>

          {/* Phase 2: "Welcome back." */}
          <div
            className={`transition-all duration-300 ease-out ${
              animPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="text-lg sm:text-xl font-bold text-[#F5F7FA]">
              Welcome back.
            </div>
          </div>

          {/* Phase 3: "Continue your Arc." */}
          <div
            className={`transition-all duration-300 ease-out ${
              animPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <p className="text-xs sm:text-sm text-[#8D95A5] font-medium">
              Continue your Arc.
            </p>
          </div>
        </div>

        {/* Phase 4: Glass Login Form */}
        <div
          className={`transition-all duration-400 ease-out ${
            animPhase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-[#151922]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            {/* Success state banner */}
            {successName ? (
              <div className="py-8 text-center space-y-3 animate-auth-fade">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
                  WELCOME BACK, {successName}.
                </div>
                <div className="text-xs text-[#8D95A5]">
                  Opening today's discipline...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Friendly Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold animate-auth-fade flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Username / Email field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="name@example.com or username"
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] placeholder-[#8D95A5]/60 text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* Password field with toggleable eye */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-[#8D95A5] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      className="text-[11px] text-[#8ED8FF] hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-[#10131A] border border-white/[0.08] focus:border-[#8ED8FF] text-[#F5F7FA] placeholder-[#8D95A5]/60 text-sm outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-3.5 text-[#8D95A5] hover:text-[#F5F7FA] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-6 rounded-2xl bg-[#8ED8FF] hover:bg-[#A6E2FF] active:scale-[0.99] text-[#080A0F] font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-[#8ED8FF]/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#080A0F]" />
                      <span>CONTINUING YOUR ARC...</span>
                    </>
                  ) : (
                    <>
                      <span>CONTINUE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#151922] px-3 text-[#8D95A5]">OR</span>
              </div>
            </div>

            {/* Create Account Link */}
            <Link
              href="/signup"
              className="block w-full py-2.5 px-4 rounded-2xl bg-[#10131A] hover:bg-[#1A1F2B] border border-white/[0.08] hover:border-white/[0.15] text-[#F5F7FA] text-center text-xs font-bold transition-all duration-200 uppercase tracking-wider"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

        {/* Return to Landing link */}
        <div className="text-center text-xs text-[#8D95A5]">
          <Link href="/" className="hover:text-[#F5F7FA] transition-colors">
            ← Back to Winter Arc
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-auth-fade">
          <div className="w-full max-w-sm rounded-3xl bg-[#151922] border border-white/[0.1] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F5F7FA]">Reset Password</h3>
            <p className="text-xs text-[#8D95A5]">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            {forgotMsg ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10131A] border border-white/[0.08] text-sm text-[#F5F7FA] outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#8ED8FF] text-[#080A0F] font-bold text-xs"
                >
                  Send Reset Link
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setForgotModal(false);
                setForgotMsg(null);
              }}
              className="w-full text-center text-xs text-[#8D95A5] hover:text-[#F5F7FA] pt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

