import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Locale } from "@/lib/translations";

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: "en" as Locale,
      setLocale: (locale) => set({ locale }),
    }),
    { name: "kapital-locale" },
  ),
);
