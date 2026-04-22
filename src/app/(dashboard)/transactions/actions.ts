"use server";

import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types/database";

export type SortField = "date" | "amount" | "description" | "category";
export type SortOrder = "asc" | "desc";
export type FilterType = "all" | "income" | "expense";

export interface TransactionsResult {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchTransactions({
  page = 1,
  pageSize = 10,
  search = "",
  sortField = "date",
  sortOrder = "desc",
  filterType = "all",
  category = "",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
  filterType?: FilterType;
  category?: string;
}): Promise<TransactionsResult> {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" });

  // Search filter
  if (search.trim()) {
    query = query.ilike("description", `%${search.trim()}%`);
  }

  // Type filter
  if (filterType !== "all") {
    query = query.eq("type", filterType);
  }

  // Category filter
  if (category) {
    query = query.eq("category", category);
  }

  // Sorting
  query = query.order(sortField, { ascending: sortOrder === "asc" });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const total = count ?? 0;

  return {
    data: (data as Transaction[]) ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function fetchTransactionCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("category")
    .order("category");

  if (!data) return [];
  const seen: Record<string, boolean> = {};
  const unique = data.map((t) => t.category).filter((c) => {
    if (seen[c]) return false;
    seen[c] = true;
    return true;
  });
  return unique;
}
