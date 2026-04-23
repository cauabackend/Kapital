"use client";

import { useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { transactionSchema, TransactionFormData } from "@/lib/validators/transaction";
import { createTransaction } from "./actions";
import { useT } from "@/hooks/use-t";

const CATEGORIES = [
  "General",
  "Salary",
  "Housing",
  "Groceries",
  "Transport",
  "Entertainment",
  "Dining Out",
  "Shopping",
  "Health",
  "Education",
  "Subscriptions",
  "Travel",
  "Other",
];

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionModal({ open, onClose }: TransactionModalProps) {
  const t = useT();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "General",
      date: today,
      type: "expense",
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (open) {
      reset({
        description: "",
        amount: 0,
        category: "General",
        date: today,
        type: "expense",
      });
    }
  }, [open, reset, today]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const onSubmit = (values: TransactionFormData) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("description", values.description);
      fd.set("amount", String(values.amount));
      fd.set("category", values.category);
      fd.set("date", values.date);
      fd.set("type", values.type);

      const result = await createTransaction(fd);

      if (result?.error) {
        setError("root", { message: result.error });
        return;
      }
      onClose();
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      style={{ animation: "fadeSlideIn 0.15s ease-out both" }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/40"
        style={{ animation: "fadeSlideIn 0.2s ease-out both" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        {/* Top accent */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-[2px]",
          selectedType === "income" ? "bg-income" : "bg-primary"
        )} />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {t.common.new}
            </p>
            <h2
              id="transaction-modal-title"
              className="font-heading text-xl font-semibold leading-none tracking-tight"
            >
              {t.transactions.addTransaction}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Type toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.transactions.type}
            </label>
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("type", type)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors",
                    selectedType === type
                      ? type === "income"
                        ? "bg-income/15 text-income ring-1 ring-income/30"
                        : "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  {type === "income" ? t.transactions.income : t.transactions.expense}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.transactions.description}
            </label>
            <div className="border-b border-border/50 transition-colors focus-within:border-primary">
              <input
                id="description"
                type="text"
                {...register("description")}
                className="w-full bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground/30"
                placeholder="e.g. Grocery run"
              />
            </div>
            {errors.description && (
              <p className="text-xs text-[hsl(var(--expense))]">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.transactions.amount}
            </label>
            <div className="flex items-center border-b border-border/50 transition-colors focus-within:border-primary">
              <span className="font-heading text-lg text-muted-foreground/60">$</span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="w-full bg-transparent py-2 pl-1 font-heading text-lg text-foreground outline-none placeholder:text-muted-foreground/30"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-[hsl(var(--expense))]">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.transactions.category}
            </label>
            <div className="relative border-b border-border/50 transition-colors focus-within:border-primary">
              <input
                id="category"
                type="text"
                list="category-list"
                {...register("category")}
                className="w-full bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground/30"
                placeholder="e.g. Groceries"
              />
              <datalist id="category-list">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            {errors.category && (
              <p className="text-xs text-[hsl(var(--expense))]">{errors.category.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label
              htmlFor="date"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.transactions.date}
            </label>
            <div className="border-b border-border/50 transition-colors focus-within:border-primary">
              <input
                id="date"
                type="date"
                {...register("date")}
                className="w-full bg-transparent py-2 text-base text-foreground outline-none"
              />
            </div>
            {errors.date && (
              <p className="text-xs text-[hsl(var(--expense))]">{errors.date.message}</p>
            )}
          </div>

          {/* Root error */}
          {errors.root && (
            <p className="rounded-lg bg-[hsl(var(--expense)/0.1)] px-3 py-2 text-sm text-[hsl(var(--expense))]">
              {errors.root.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all",
                "hover:brightness-110 active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {isPending ? t.common.saving : t.transactions.createTransaction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
