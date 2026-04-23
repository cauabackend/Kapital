"use client";

import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import type { Locale } from "@/lib/translations";

export type Translations = typeof translations[Locale];

export function useT(): Translations {
  const locale = useLanguageStore((s) => s.locale);
  return translations[locale] as Translations;
}
