"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Profile, LanguageCode } from "@/types/database";
import { StorageRepository } from "@/lib/storage/repository";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string; user?: Profile }>;
  signup: (name: string, email: string, pass: string, lang: LanguageCode) => Promise<{ success: boolean; error?: string; user?: Profile }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => ({ success: true, message: "" }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    StorageRepository.initialize();

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id).then((prof) => {
            setUser(prof);
            setIsLoading(false);
          });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const prof = await fetchSupabaseProfile(session.user.id);
          setUser(prof);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Offline / standalone client-database session
      const sessionUser = StorageRepository.getSessionUser();
      setUser(sessionUser);
      setIsLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (userId: string): Promise<Profile | null> => {
    try {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) return null;
      return data as Profile;
    } catch {
      return null;
    }
  };

  const login = async (
    emailOrUser: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; user?: Profile }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrUser,
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: "Those details don't match an account." };
        }

        if (data.user) {
          const profile = await fetchSupabaseProfile(data.user.id);
          setUser(profile);
          setIsLoading(false);
          return { success: true, user: profile || undefined };
        }
      }

      // Standalone vault authentication
      const res = StorageRepository.authenticateAccount(emailOrUser, pass);
      if (!res.success || !res.user) {
        setIsLoading(false);
        return { success: false, error: res.error || "Those details don't match an account." };
      }

      setUser(res.user);
      setIsLoading(false);
      return { success: true, user: res.user };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: "Those details don't match an account." };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    lang: LanguageCode
  ): Promise<{ success: boolean; error?: string; user?: Profile }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              username: name.trim().toLowerCase().replace(/\s+/g, "_"),
              display_name: name.trim(),
              language: lang,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message || "Failed to create account" };
        }

        if (data.user) {
          const profile = await fetchSupabaseProfile(data.user.id);
          setUser(profile);
          setIsLoading(false);
          return { success: true, user: profile || undefined };
        }
      }

      // Standalone vault registration
      const res = StorageRepository.registerAccount(name, email, pass, lang);
      if (!res.success || !res.user) {
        setIsLoading(false);
        return { success: false, error: res.error || "Failed to create account" };
      }

      setUser(res.user);
      setIsLoading(false);
      return { success: true, user: res.user };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: "We couldn't create your account right now. Please try again." };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      StorageRepository.clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    if (isSupabaseConfigured && supabase) {
      await supabase.from("profiles").update(updates).eq("id", user.id);
    }
    const updated = StorageRepository.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
    }
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.resetPasswordForEmail(email);
    }
    return {
      success: true,
      message: "If an account matches that email, instructions have been sent.",
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

