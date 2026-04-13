export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: TransactionType;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  max_amount: number;
  created_at: string;
}

export interface Pot {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  theme_color: string;
}

export interface RecurringBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number;
  category: string;
  is_paid: boolean;
}
