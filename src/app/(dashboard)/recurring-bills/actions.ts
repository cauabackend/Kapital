"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RecurringBill } from "@/types/database";
import { recurringBillSchema } from "@/lib/validators/recurring-bill";

export async function fetchRecurringBills(): Promise<RecurringBill[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recurring_bills")
    .select("*")
    .order("due_day", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as RecurringBill[]) ?? [];
}

export async function createRecurringBill(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Usuário não autenticado." };

  const raw = {
    name: formData.get("name") as string,
    amount: Number(formData.get("amount")),
    due_day: Number(formData.get("due_day")),
    category: formData.get("category") as string,
  };

  const parsed = recurringBillSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("recurring_bills")
    .insert({ ...parsed.data, is_paid: false, user_id: user.id });

  if (error) return { error: error.message };

  revalidatePath("/recurring-bills");
  return { success: true };
}

export async function updateRecurringBill(id: string, formData: FormData) {
  const supabase = await createClient();

  const raw = {
    name: formData.get("name") as string,
    amount: Number(formData.get("amount")),
    due_day: Number(formData.get("due_day")),
    category: formData.get("category") as string,
  };

  const parsed = recurringBillSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("recurring_bills")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/recurring-bills");
  return { success: true };
}

export async function deleteRecurringBill(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("recurring_bills")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/recurring-bills");
  return { success: true };
}

export async function toggleBillPaid(id: string, isPaid: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("recurring_bills")
    .update({ is_paid: isPaid })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/recurring-bills");
  return { success: true };
}
