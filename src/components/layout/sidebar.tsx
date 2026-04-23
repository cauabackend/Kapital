"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Wallet,
  ReceiptText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { useLanguageStore } from "@/store/language";
import { useT } from "@/hooks/use-t";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { locale, setLocale } = useLanguageStore();
  const t = useT();

  const navItems = [
    { href: "/overview",        label: t.nav.overview,       icon: LayoutDashboard },
    { href: "/transactions",    label: t.nav.transactions,   icon: ArrowLeftRight },
    { href: "/budgets",         label: t.nav.budgets,        icon: Wallet },
    { href: "/pots",            label: t.nav.pots,           icon: PiggyBank },
    { href: "/recurring-bills", label: t.nav.recurringBills, icon: ReceiptText },
  ];

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
    <aside
      className={cn(
        "relative hidden md:flex h-screen flex-col border-r border-border/50 bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo */}
      <div className="relative flex h-[72px] items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_hsl(42_70%_60%_/_0.15)]">
          <span className="font-heading text-base font-bold text-primary-foreground">
            K
          </span>
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground animate-[fadeSlideIn_0.3s_ease-out_both]">
            Kapital
          </span>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="relative px-5 pb-2 pt-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
            Menu
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 space-y-0.5 px-3 pt-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {isActive && (
                <div className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative space-y-0.5 border-t border-border/50 px-3 py-3">
        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          title={locale === "en" ? "Switch to Portuguese" : "Mudar para Inglês"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {/* Flag icon via emoji — compact and recognisable */}
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-sm leading-none">
            {locale === "en" ? "🇧🇷" : "🇺🇸"}
          </span>
          {!collapsed && (
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-semibold transition-colors",
                  locale === "en" ? "text-foreground" : "text-muted-foreground/50",
                )}
              >
                EN
              </span>
              <span className="text-muted-foreground/30">/</span>
              <span
                className={cn(
                  "font-semibold transition-colors",
                  locale === "pt" ? "text-foreground" : "text-muted-foreground/50",
                )}
              >
                PT
              </span>
            </span>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>{t.nav.signOut}</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
