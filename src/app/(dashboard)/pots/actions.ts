"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Pot } from "@/types/database";
import { potSchema, potTransactionSchema } from "@/lib/validators/pot";

export async function fetchPots(): Promise<Pot[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pots")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Pot[]) ?? [];
}

export async function createPot(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    name: formData.get("name") as string,
    target_amount: Number(formData.get("target_amount")),
    theme_color: formData.get("theme_color") as string,
  };

  const parsed = potSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("pots")
    .insert({ ...parsed.data, current_amount: 0 });

  if (error) return { error: error.message };

  revalidatePath("/pots");
  return { success: true };
}

export async function updatePot(id: string, formData: FormData) {
  const supabase = await createClient();

  const raw = {
    name: formData.get("name") as string,
    target_amount: Number(formData.get("target_amount")),
    theme_color: formData.get("theme_color") as string,
  };

  const parsed = potSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("pots")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pots");
  return { success: true };
}

export async function deletePot(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("pots").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/pots");
  return { success: true };
}

export async function depositToPot(id: string, formData: FormData) {
  const supabase = await createClient();

  const raw = { amount: Number(formData.get("amount")) };
  const parsed = potTransactionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: pot } = await supabase
    .from("pots")
    .select("current_amount, target_amount")
    .eq("id", id)
    .single();

  if (!pot) return { error: "Pot not found" };

  const newAmount = Math.min(
    pot.current_amount + parsed.data.amount,
    pot.target_amount,
  );

  const { error } = await supabase
    .from("pots")
    .update({ current_amount: newAmount })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pots");
  return { success: true };
}

export async function withdrawFromPot(id: string, formData: FormData) {
  const supabase = await createClient();

  const raw = { amount: Number(formData.get("amount")) };
  const parsed = potTransactionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: pot } = await supabase
    .from("pots")
    .select("current_amount")
    .eq("id", id)
    .single();

  if (!pot) return { error: "Pot not found" };

  if (parsed.data.amount > pot.current_amount) {
    return { error: "Cannot withdraw more than the current balance" };
  }

  const { error } = await supabase
    .from("pots")
    .update({ current_amount: pot.current_amount - parsed.data.amount })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pots");
  return { success: true };
}
