"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Budget, Transaction } from "@/types/database";
import { budgetSchema } from "@/lib/validators/budget";

export interface BudgetWithData extends Budget {
  spent: number;
  transactions: Transaction[];
}

export async function fetchBudgets(): Promise<BudgetWithData[]> {
  const supabase = await createClient();

  const { data: budgets, error } = await supabase
    .from("budgets")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!budgets || budgets.length === 0) return [];

  // For each budget, get spending and last 3 transactions in that category
  const results = await Promise.all(
    budgets.map(async (budget) => {
      // Current month expenses for this category
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("category", budget.category)
        .eq("type", "expense")
        .gte("date", monthStart)
        .order("date", { ascending: false });

      const spent = (txData ?? []).reduce((sum, tx) => sum + tx.amount, 0);

      // Last 3 transactions (any date)
      const { data: last3 } = await supabase
        .from("transactions")
        .select("*")
        .eq("category", budget.category)
        .eq("type", "expense")
        .order("date", { ascending: false })
        .limit(3);

      return {
        ...budget,
        spent,
        transactions: (last3 ?? []) as Transaction[],
      };
    })
  );

  return results;
}

export async function createBudget(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    category: formData.get("category") as string,
    max_amount: Number(formData.get("max_amount")),
  };

  const parsed = budgetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("budgets").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/budgets");
  return { success: true };
}

export async function updateBudget(id: string, formData: FormData) {
  const supabase = await createClient();

  const raw = {
    category: formData.get("category") as string,
    max_amount: Number(formData.get("max_amount")),
  };

  const parsed = budgetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("budgets")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  return { success: true };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/budgets");
  return { success: true };
}

export async function fetchAvailableCategories(): Promise<string[]> {
  const supabase = await createClient();

  // Categories already used in budgets
  const { data: existing } = await supabase
    .from("budgets")
    .select("category");

  const used = new Set((existing ?? []).map((b) => b.category));

  const ALL_CATEGORIES = [
    "Housing", "Groceries", "Transport", "Entertainment",
    "Dining Out", "Shopping", "Health", "Education",
    "Subscriptions", "Travel",
  ];

  return ALL_CATEGORIES.filter((c) => !used.has(c));
}
