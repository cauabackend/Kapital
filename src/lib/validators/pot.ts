import { z } from "zod";

export const potSchema = z.object({
  name: z.string().min(1, "Name is required"),
  target_amount: z.number().positive("Target must be positive"),
  theme_color: z.string().min(1, "Color is required"),
});

export const potTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

export type PotFormData = z.infer<typeof potSchema>;
export type PotTransactionFormData = z.infer<typeof potTransactionSchema>;
