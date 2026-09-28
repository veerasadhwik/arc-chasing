"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode } from "@/types/database";
import en from "@/locales/en.json";
import te from "@/locales/te.json";
import hi from "@/locales/hi.json";

const translations: Record<LanguageCode, Record<string, any>> = {
  en,
  te,
  hi,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultVal?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("winter_arc_language") as LanguageCode;
    if (saved && (saved === "en" || saved === "te" || saved === "hi")) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("winter_arc_language", lang);
    document.documentElement.lang = lang;
  };

  const t = (path: string, defaultVal?: string): string => {
    const keys = path.split(".");
    let current: any = translations[language] || translations.en;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback: any = translations.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === "object" && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return defaultVal || path;
          }
        }
        return typeof fallback === "string" ? fallback : defaultVal || path;
      }
    }

    return typeof current === "string" ? current : defaultVal || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
