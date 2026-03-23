import type { Locale } from "./config";
import type { LocaleDict } from "@/types";

const dictionaries: Record<string, () => Promise<LocaleDict>> = {
  en: () => import("@/locales/en.json").then((m) => m.default as LocaleDict),
  bn: () => import("@/locales/bn.json").then((m) => m.default as LocaleDict),
};

export async function getDictionary(locale: Locale): Promise<LocaleDict> {
  return dictionaries[locale]?.() ?? dictionaries["en"]();
}

// Nested key access: t("nav.home")
export function t(dict: LocaleDict, key: string): string {
  const keys = key.split(".");
  let result: LocaleDict | string = dict;
  for (const k of keys) {
    if (typeof result === "string") return key;
    result = result[k] ?? key;
  }
  return typeof result === "string" ? result : key;
}