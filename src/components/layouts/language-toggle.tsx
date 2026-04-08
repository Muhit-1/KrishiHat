"use client";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils/cn";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center border rounded-full overflow-hidden text-xs font-medium">
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-2.5 py-1 transition-colors",
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        )}
        title="Switch to English"
      >
        ENG
      </button>
      <button
        onClick={() => setLocale("bn")}
        className={cn(
          "px-2.5 py-1 transition-colors",
          locale === "bn"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        )}
        title="বাংলায় পরিবর্তন করুন"
      >
        বাংলা
      </button>
    </div>
  );
}