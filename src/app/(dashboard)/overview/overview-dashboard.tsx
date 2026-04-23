"use client";

import {
  TrendingUp,
  TrendingDown,
  Landmark,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  CalendarClock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetSummary, MonthlyChartPoint } from "./actions";
import { SpendingChart } from "./spending-chart";
import { Transaction, Pot, RecurringBill } from "@/types/database";
import { useT } from "@/hooks/use-t";

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export interface OverviewDashboardProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  billsPending: number;
  chartData: MonthlyChartPoint[];
  topBudgets: BudgetSummary[];
  recentTransactions: Transaction[];
  pots: Pot[];
  bills: RecurringBill[];
}

/* ─────────────────────────── Stat card ───────────────────── */

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 transition-colors hover:border-border",
        highlight ? "border-primary/30" : "border-border/50",
      )}
    >
      {highlight && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-primary" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {label}
          </p>
          <p
            className={cn(
              "truncate font-heading text-2xl font-semibold tracking-tight tabular-nums",
              accent,
            )}
          >
            {value}
          </p>
          <p className="text-xs text-muted-foreground/60">{subtext}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/50">
          <Icon className="h-4 w-4 text-muted-foreground/70" strokeWidth={1.6} />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Chart widget ──────────────────── */

function ChartWidget({
  chartData,
}: {
  chartData: MonthlyChartPoint[];
}) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t.overview.cashFlow}
          </p>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {t.overview.incomeVsExpenses}
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[hsl(155,50%,55%)]" />
            {t.overview.income}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[hsl(0,65%,62%)]" />
            {t.overview.expenses}
          </span>
        </div>
      </div>
      <SpendingChart data={chartData} />
    </div>
  );
}

/* ──────────────────────── Budgets widget ─────────────────── */

function BudgetsWidget({ budgets }: { budgets: BudgetSummary[] }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t.common.thisMonth}
        </p>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {t.overview.topBudgets}
        </h2>
      </div>

      {budgets.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/40">
          {t.overview.noBudgets}
        </p>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const pct =
              b.max_amount > 0
                ? Math.min((b.spent / b.max_amount) * 100, 100)
                : 0;
            const isOver = b.spent > b.max_amount;
            const isWarning = !isOver && pct >= 80;

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">{b.category}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {fmt(b.spent)}{" "}
                    <span className="text-muted-foreground/50">
                      / {fmt(b.max_amount)}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Transactions widget ─────────────── */

function TransactionsWidget({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t.overview.latest}
        </p>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {t.overview.recentTransactions}
        </h2>
      </div>

      {transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/40">
          {t.overview.noTransactions}
        </p>
      ) : (
        <div className="divide-y divide-border/30">
          {transactions.map((tx) => {
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id} className="flex items-center gap-3 py-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isIncome
                      ? "bg-[hsl(var(--income)/0.1)] text-[hsl(var(--income))]"
                      : "bg-[hsl(var(--expense)/0.1)] text-[hsl(var(--expense))]",
                  )}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">
                    {tx.category} ·{" "}
                    {new Date(tx.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    isIncome
                      ? "text-[hsl(var(--income))]"
                      : "text-[hsl(var(--expense))]",
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {fmt(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Pots widget ─────────────────── */

function PotsWidget({ pots }: { pots: Pot[] }) {
  const t = useT();
  const totalSaved = pots.reduce((s, p) => s + p.current_amount, 0);
  const totalTarget = pots.reduce((s, p) => s + p.target_amount, 0);
  const overallPct =
    totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <PiggyBank
          className="h-4 w-4 text-muted-foreground/60"
          strokeWidth={1.6}
        />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t.overview.savingsPots}
        </p>
      </div>

      {pots.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground/40">
          {t.overview.noPots}
        </p>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-heading text-2xl font-semibold tabular-nums">
              {fmt(totalSaved)}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {t.common.of} {fmt(totalTarget)} {t.overview.target} ·{" "}
              {overallPct.toFixed(0)}%
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {pots.slice(0, 3).map((pot) => {
              const pct =
                pot.target_amount > 0
                  ? Math.min(
                      (pot.current_amount / pot.target_amount) * 100,
                      100,
                    )
                  : 0;
              return (
                <div key={pot.id} className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: pot.theme_color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {pot.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
            {pots.length > 3 && (
              <p className="text-xs text-muted-foreground/50">
                +{pots.length - 3}{" "}
                {pots.length - 3 > 1
                  ? t.overview.morePots
                  : t.overview.morePot}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── Bills widget ────────────────── */

function BillsWidget({ bills }: { bills: RecurringBill[] }) {
  const t = useT();
  const paid = bills.filter((b) => b.is_paid);
  const unpaid = bills.filter((b) => !b.is_paid);
  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);

  const today = new Date().getDate();
  const nextDue = [...unpaid]
    .filter((b) => b.due_day >= today)
    .sort((a, b) => a.due_day - b.due_day)[0];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock
          className="h-4 w-4 text-muted-foreground/60"
          strokeWidth={1.6}
        />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t.overview.recurringBills}
        </p>
      </div>

      {bills.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground/40">
          {t.overview.noBills}
        </p>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-heading text-2xl font-semibold tabular-nums">
              {fmt(totalMonthly)}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {t.common.perMonth}
            </p>
          </div>

          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>
                {paid.length} {t.overview.paidOf} · {unpaid.length}{" "}
                {t.overview.remaining}
              </span>
              <span>
                {bills.length} {t.overview.total}
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full bg-[hsl(var(--income))] transition-all duration-700"
                style={{
                  width: `${bills.length > 0 ? (paid.length / bills.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {nextDue && (
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="font-heading text-sm font-bold leading-none tabular-nums">
                  {nextDue.due_day}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{nextDue.name}</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {t.overview.nextDue}
                </p>
              </div>
              <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums">
                {fmt(nextDue.amount)}
              </span>
            </div>
          )}

          {unpaid.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--income)/0.2)] bg-[hsl(var(--income)/0.05)] px-3 py-2.5">
              <Check
                className="h-4 w-4 text-[hsl(var(--income))]"
                strokeWidth={2.5}
              />
              <p className="text-sm font-medium text-[hsl(var(--income))]">
                {t.overview.allBillsPaid}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────── Main dashboard ──────────────────── */

export function OverviewDashboard({
  balance,
  monthlyIncome,
  monthlyExpenses,
  billsPending,
  chartData,
  topBudgets,
  recentTransactions,
  pots,
  bills,
}: OverviewDashboardProps) {
  const t = useT();
  const isPositiveBalance = balance >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t.overview.title}
        </h1>
        <p className="text-muted-foreground">{t.overview.subtitle}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t.overview.netBalance}
          value={fmt(Math.abs(balance))}
          subtext={
            isPositiveBalance
              ? t.overview.allTimeSurplus
              : t.overview.allTimeDeficit
          }
          icon={Landmark}
          accent={
            isPositiveBalance
              ? "text-[hsl(var(--income))]"
              : "text-[hsl(var(--expense))]"
          }
          highlight
        />
        <StatCard
          label={t.overview.income}
          value={fmt(monthlyIncome)}
          subtext={t.common.thisMonth}
          icon={TrendingUp}
          accent="text-[hsl(var(--income))]"
        />
        <StatCard
          label={t.overview.expenses}
          value={fmt(monthlyExpenses)}
          subtext={t.common.thisMonth}
          icon={TrendingDown}
          accent="text-[hsl(var(--expense))]"
        />
        <StatCard
          label={t.overview.billsPending}
          value={String(billsPending)}
          subtext={
            billsPending === 0
              ? t.overview.allClear
              : t.overview.awaitingPayment
          }
          icon={Receipt}
          accent={billsPending > 0 ? "text-amber-400" : undefined}
        />
      </div>

      {/* Chart + Budgets row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ChartWidget chartData={chartData} />
        </div>
        <div className="lg:col-span-2">
          <BudgetsWidget budgets={topBudgets} />
        </div>
      </div>

      {/* Transactions + Pots + Bills row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TransactionsWidget transactions={recentTransactions} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <PotsWidget pots={pots} />
          <BillsWidget bills={bills} />
        </div>
      </div>
    </div>
  );
}
