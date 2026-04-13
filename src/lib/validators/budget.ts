import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  max_amount: z.number().positive("Amount must be positive"),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
