"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/use-t";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  const navItems = [
    { href: "/overview",        label: t.nav.overview,       icon: LayoutDashboard },
    { href: "/transactions",    label: t.nav.transactions,   icon: ArrowLeftRight },
    { href: "/budgets",         label: t.nav.budgets,        icon: Wallet },
    { href: "/pots",            label: t.nav.pots,           icon: PiggyBank },
    { href: "/recurring-bills", label: t.nav.recurringBills, icon: ReceiptText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/90 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-0 h-[2px] w-8 rounded-full bg-primary" />
              )}
              <item.icon
                className="h-5 w-5 shrink-0"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe-bottom bg-card/90" />
    </nav>
  );
}
