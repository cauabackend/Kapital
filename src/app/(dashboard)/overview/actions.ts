"use server";

import { createClient } from "@/lib/supabase/server";
import { Transaction, Budget, Pot, RecurringBill } from "@/types/database";

export interface BudgetSummary extends Budget {
  spent: number;
}

export interface MonthlyChartPoint {
  month: string;   // "Jan 25"
  income: number;
  expenses: number;
}

export interface OverviewData {
  // Stats
  balance: number;          // all-time income - expenses
  monthlyIncome: number;
  monthlyExpenses: number;
  billsPending: number;     // count of unpaid bills

  // Widgets
  chartData: MonthlyChartPoint[];
  topBudgets: BudgetSummary[];
  recentTransactions: Transaction[];
  pots: Pot[];
  bills: RecurringBill[];
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function monthStart(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function fetchOverviewData(): Promise<OverviewData> {
  const supabase = await createClient();

  const now = new Date();
  const currentMonthStart = monthStart(now);

  // Six months back (including current)
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const chartFrom = monthStart(sixMonthsAgo);

  const [
    allTransactionsRes,
    chartTransactionsRes,
    budgetsRes,
    recentRes,
    potsRes,
    billsRes,
  ] = await Promise.all([
    // All-time transactions for balance
    supabase.from("transactions").select("type, amount"),
    // Last 6 months for chart + current month stats
    supabase
      .from("transactions")
      .select("type, amount, date")
      .gte("date", chartFrom),
    // Budgets
    supabase.from("budgets").select("*").order("created_at"),
    // Recent 5 transactions
    supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(5),
    // Pots
    supabase.from("pots").select("*").order("created_at"),
    // Bills
    supabase.from("recurring_bills").select("*").order("due_day"),
  ]);

  // ── Balance (all-time) ────────────────────────────────────
  const allTx = allTransactionsRes.data ?? [];
  const balance = allTx.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0,
  );

  // ── Monthly stats + chart ─────────────────────────────────
  const chartTx = chartTransactionsRes.data ?? [];

  // Build month buckets for last 6 months
  const buckets: Record<string, { income: number; expenses: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    buckets[monthStart(d)] = { income: 0, expenses: 0 };
  }

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  for (const tx of chartTx) {
    const key = tx.date.slice(0, 7) + "-01"; // normalise to YYYY-MM-01
    if (buckets[key]) {
      if (tx.type === "income") buckets[key].income += tx.amount;
      else buckets[key].expenses += tx.amount;
    }
    // Current month stats
    if (tx.date >= currentMonthStart) {
      if (tx.type === "income") monthlyIncome += tx.amount;
      else monthlyExpenses += tx.amount;
    }
  }

  const chartData: MonthlyChartPoint[] = Object.entries(buckets).map(
    ([key, val]) => {
      const d = new Date(key);
      return { month: monthLabel(d), ...val };
    },
  );

  // ── Budgets with current-month spending ───────────────────
  const budgets = (budgetsRes.data as Budget[]) ?? [];
  const topBudgets: BudgetSummary[] = await Promise.all(
    budgets.slice(0, 4).map(async (budget) => {
      const { data } = await supabase
        .from("transactions")
        .select("amount")
        .eq("category", budget.category)
        .eq("type", "expense")
        .gte("date", currentMonthStart);

      const spent = (data ?? []).reduce((s, t) => s + t.amount, 0);
      return { ...budget, spent };
    }),
  );

  // ── Bills ─────────────────────────────────────────────────
  const bills = (billsRes.data as RecurringBill[]) ?? [];
  const billsPending = bills.filter((b) => !b.is_paid).length;

  return {
    balance,
    monthlyIncome,
    monthlyExpenses,
    billsPending,
    chartData,
    topBudgets,
    recentTransactions: (recentRes.data as Transaction[]) ?? [],
    pots: (potsRes.data as Pot[]) ?? [],
    bills,
  };
}
