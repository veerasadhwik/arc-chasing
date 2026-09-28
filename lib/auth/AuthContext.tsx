"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, LanguageCode } from "@/types/database";
import { StorageRepository } from "@/lib/storage/repository";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, pass: string, lang: LanguageCode) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: true,
  isLoading: false,
  login: async () => ({ success: true }),
  signup: async () => ({ success: true }),
  logout: async () => {},
  updateProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    StorageRepository.initialize();
    const profile = StorageRepository.getProfile();
    setUser(profile);
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      }
      // Demo / client fallback
      const profile = StorageRepository.getProfile();
      setUser(profile);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to sign in" };
    }
  };

  const signup = async (username: string, email: string, pass: string, lang: LanguageCode) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { username, language: lang },
          },
        });
        if (error) throw error;
      }

      const updated = StorageRepository.updateProfile({
        username,
        display_name: username,
        language: lang,
      });
      setUser(updated);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to create account" };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // In local demo, user remains Veera or can be reset
    window.location.href = "/";
  };

  const updateProfile = (updates: Partial<Profile>) => {
    const updated = StorageRepository.updateProfile(updates);
    setUser(updated);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
