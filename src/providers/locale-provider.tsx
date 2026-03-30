"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getDictionary, interpolate } from "@/lib/i18n/get-dictionary";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dict: Dictionary;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
  dict: {},
  isLoading: true,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [dict, setDict] = useState<Dictionary>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadDict = useCallback(async (loc: Locale) => {
    setIsLoading(true);
    const d = await getDictionary(loc);
    setDict(d);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Restore from localStorage
    const saved = localStorage.getItem("kh_locale") as Locale | null;
    const initial: Locale =
      saved === "bn" || saved === "en" ? saved : defaultLocale;
    setLocaleState(initial);
    loadDict(initial);
  }, [loadDict]);

  const setLocale = useCallback(
    (loc: Locale) => {
      setLocaleState(loc);
      localStorage.setItem("kh_locale", loc);
      document.documentElement.lang = loc;
      loadDict(loc);
    },
    [loadDict]
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const val = dict[key];
      if (!val) return key;
      return interpolate(val, vars);
    },
    [dict]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dict, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

// Shorthand hook for just the t function
export function useT() {
  return useContext(LocaleContext).t;
}