"use client";

import { useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  recurringBillSchema,
  RecurringBillFormData,
} from "@/lib/validators/recurring-bill";
import { createRecurringBill, updateRecurringBill } from "./actions";
import { RecurringBill } from "@/types/database";
import { useT } from "@/hooks/use-t";

export const BILL_CATEGORIES = [
  "Housing",
  "Utilities",
  "Subscriptions",
  "Insurance",
  "Health",
  "Transport",
  "Education",
  "Entertainment",
  "Groceries",
  "Shopping",
  "Dining Out",
  "Travel",
];

interface BillModalProps {
  open: boolean;
  bill: RecurringBill | null;
  onClose: () => void;
}

export function BillModal({ open, bill, onClose }: BillModalProps) {
  const t = useT();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!bill;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RecurringBillFormData>({
    resolver: zodResolver(recurringBillSchema),
    defaultValues: {
      name: bill?.name ?? "",
      amount: bill?.amount ?? 0,
      due_day: bill?.due_day ?? 1,
      category: bill?.category ?? BILL_CATEGORIES[0],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: bill?.name ?? "",
        amount: bill?.amount ?? 0,
        due_day: bill?.due_day ?? 1,
        category: bill?.category ?? BILL_CATEGORIES[0],
      });
    }
  }, [open, bill, reset]);

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const onSubmit = (values: RecurringBillFormData) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("amount", String(values.amount));
      fd.set("due_day", String(values.due_day));
      fd.set("category", values.category);

      const result = isEditing
        ? await updateRecurringBill(bill.id, fd)
        : await createRecurringBill(fd);

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
        aria-labelledby="bill-modal-title"
      >
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-primary" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {isEditing ? t.common.editing : t.common.new}
            </p>
            <h2
              id="bill-modal-title"
              className="font-heading text-xl font-semibold leading-none tracking-tight"
            >
              {isEditing ? bill.name : t.bills.addBill}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="bill-name"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.bills.billName}
            </label>
            <div className="border-b border-border/50 transition-colors focus-within:border-primary">
              <input
                id="bill-name"
                type="text"
                {...register("name")}
                placeholder="e.g. Netflix, Rent, Insurance"
                className="w-full bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-[hsl(var(--expense))]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Amount + Due day side by side */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="bill-amount"
                className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t.bills.monthlyAmount}
              </label>
              <div className="flex items-center border-b border-border/50 transition-colors focus-within:border-primary">
                <span className="font-heading text-lg text-muted-foreground/60">
                  $
                </span>
                <input
                  id="bill-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full bg-transparent py-2 pl-1 font-heading text-lg text-foreground outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-[hsl(var(--expense))]">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bill-due-day"
                className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t.bills.dueDay}
              </label>
              <div className="flex items-center border-b border-border/50 transition-colors focus-within:border-primary">
                <input
                  id="bill-due-day"
                  type="number"
                  min="1"
                  max="31"
                  {...register("due_day", { valueAsNumber: true })}
                  placeholder="15"
                  className="w-full bg-transparent py-2 font-heading text-lg text-foreground outline-none placeholder:text-muted-foreground/30"
                />
                <span className="shrink-0 text-sm text-muted-foreground/50">
                  / mo
                </span>
              </div>
              {errors.due_day && (
                <p className="text-xs text-[hsl(var(--expense))]">
                  {errors.due_day.message}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="bill-category"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.bills.category}
            </label>
            <div className="relative border-b border-border/50 transition-colors focus-within:border-primary">
              <select
                id="bill-category"
                {...register("category")}
                className="w-full appearance-none bg-transparent py-2 pr-6 text-base text-foreground outline-none"
              >
                {BILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-card">
                    {cat}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </div>
            {errors.category && (
              <p className="text-xs text-[hsl(var(--expense))]">
                {errors.category.message}
              </p>
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
                "hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {isPending
                ? t.common.saving
                : isEditing
                  ? t.common.save
                  : t.bills.createBill}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
