import { z } from "zod";

export const recurringBillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  due_day: z
    .number()
    .int("Due day must be a whole number")
    .min(1, "Due day must be at least 1")
    .max(31, "Due day cannot exceed 31"),
  category: z.string().min(1, "Category is required"),
});

export type RecurringBillFormData = z.infer<typeof recurringBillSchema>;
