"use client";

import { useLocale } from "@/providers/locale-provider";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "bn" : "en")}
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border hover:bg-muted transition-colors"
      title="Toggle language"
    >
      <span className={locale === "en" ? "text-primary font-bold" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={locale === "bn" ? "text-primary font-bold" : "text-muted-foreground"}>বাং</span>
    </button>
  );
}