"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/language";

export function MobileHeader() {
  const router = useRouter();
  const { locale, setLocale } = useLanguageStore();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function toggleLocale() {
    setLocale(locale === "en" ? "pt" : "en");
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-card/80 px-4 backdrop-blur-md md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-[0_0_16px_hsl(42_70%_60%_/_0.2)]">
          <span className="font-heading text-sm font-bold text-primary-foreground">K</span>
        </div>
        <span className="font-heading text-base font-semibold tracking-tight">Kapital</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLocale}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          {locale === "en" ? "🇧🇷" : "🇺🇸"}
        </button>
        <button
          onClick={handleSignOut}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
