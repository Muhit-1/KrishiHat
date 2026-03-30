import type { Locale } from "./config";

// Flat dot-notation key lookup
export type Dictionary = Record<string, string>;

function flatten(obj: Record<string, unknown>, prefix = ""): Dictionary {
  const result: Dictionary = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      Object.assign(result, flatten(val as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () =>
    import("@/locales/en.json").then((m) => flatten(m.default as Record<string, unknown>)),
  bn: () =>
    import("@/locales/bn.json").then((m) => flatten(m.default as Record<string, unknown>)),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]?.() ?? dictionaries["en"]();
}

// Interpolation helper: t("hello {name}", { name: "World" }) → "hello World"
export function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}