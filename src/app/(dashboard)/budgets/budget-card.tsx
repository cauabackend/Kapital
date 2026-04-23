"use client";

import {
  Home,
  ShoppingCart,
  Car,
  Film,
  Utensils,
  ShoppingBag,
  Heart,
  GraduationCap,
  Wifi,
  Plane,
  Tag,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetWithData } from "./actions";
import { useT } from "@/hooks/use-t";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Housing: Home,
  Groceries: ShoppingCart,
  Transport: Car,
  Entertainment: Film,
  "Dining Out": Utensils,
  Shopping: ShoppingBag,
  Health: Heart,
  Education: GraduationCap,
  Subscriptions: Wifi,
  Travel: Plane,
};

interface BudgetCardProps {
  budget: BudgetWithData;
  onEdit: (budget: BudgetWithData) => void;
  onDelete: (budget: BudgetWithData) => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const t = useT();
  const pct = budget.max_amount > 0
    ? Math.min((budget.spent / budget.max_amount) * 100, 100)
    : 0;
  const isOver = budget.spent > budget.max_amount;
  const isWarning = !isOver && pct >= 80;
  const remaining = budget.max_amount - budget.spent;

  const Icon = CATEGORY_ICONS[budget.category] ?? Tag;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20",
        isOver
          ? "border-[hsl(var(--expense)/0.25)]"
          : "border-border/50 hover:border-border",
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[2px]",
          isOver
            ? "bg-[hsl(var(--expense))]"
            : isWarning
              ? "bg-amber-400"
              : "bg-primary",
        )}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                isOver
                  ? "bg-[hsl(var(--expense)/0.12)] text-[hsl(var(--expense))]"
                  : isWarning
                    ? "bg-amber-400/10 text-amber-400"
                    : "bg-primary/10 text-primary",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {t.budgets.budget}
              </p>
              <h3 className="font-heading text-lg font-semibold leading-none tracking-tight">
                {budget.category}
              </h3>
            </div>
          </div>

          {/* Action buttons — visible on hover */}
          <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => onEdit(budget)}
              aria-label="Edit budget"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              aria-label="Delete budget"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[hsl(var(--expense)/0.1)] hover:text-[hsl(var(--expense))]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Spent / max */}
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {fmt(budget.spent)}
            </span>
            <span className="ml-1.5 text-sm text-muted-foreground">{t.budgets.spent}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            of {fmt(budget.max_amount)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-muted/40">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isOver
                ? "bg-[hsl(var(--expense))]"
                : isWarning
                  ? "bg-amber-400"
                  : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Status line */}
        <div className="mb-5 flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-medium",
              isOver
                ? "text-[hsl(var(--expense))]"
                : isWarning
                  ? "text-amber-400"
                  : "text-[hsl(var(--income))]",
            )}
          >
            {isOver
              ? `${fmt(budget.spent - budget.max_amount)} ${t.budgets.overLimit}`
              : `${fmt(remaining)} ${t.budgets.remaining}`}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {pct.toFixed(0)}%
          </span>
        </div>

        {/* Recent transactions */}
        {budget.transactions.length > 0 && (
          <div className="space-y-2.5 border-t border-border/40 pt-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {t.budgets.recent}
            </p>
            {budget.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm leading-snug text-foreground/80">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">
                    {fmtDate(tx.date)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[hsl(var(--expense))]">
                  {fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
