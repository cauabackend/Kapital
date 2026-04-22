"use client";

import { useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { budgetSchema, BudgetFormData } from "@/lib/validators/budget";
import { createBudget, updateBudget, BudgetWithData } from "./actions";

interface BudgetModalProps {
  open: boolean;
  budget: BudgetWithData | null; // null = create mode
  availableCategories: string[];
  onClose: () => void;
}

export function BudgetModal({
  open,
  budget,
  availableCategories,
  onClose,
}: BudgetModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!budget;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: budget?.category ?? availableCategories[0] ?? "",
      max_amount: budget?.max_amount ?? 0,
    },
  });

  // Reset form when modal opens/budget changes
  useEffect(() => {
    if (open) {
      reset({
        category: budget?.category ?? availableCategories[0] ?? "",
        max_amount: budget?.max_amount ?? 0,
      });
    }
  }, [open, budget, availableCategories, reset]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const onSubmit = (values: BudgetFormData) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("category", values.category);
      fd.set("max_amount", String(values.max_amount));

      const result = isEditing
        ? await updateBudget(budget.id, fd)
        : await createBudget(fd);

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
        aria-labelledby="budget-modal-title"
      >
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-primary" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {isEditing ? "Editing" : "New"}
            </p>
            <h2
              id="budget-modal-title"
              className="font-heading text-xl font-semibold leading-none tracking-tight"
            >
              {isEditing ? budget.category : "Create Budget"}
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            {isEditing ? (
              <div className="border-b border-border/50 pb-2">
                <span className="font-heading text-base font-medium">
                  {budget.category}
                </span>
              </div>
            ) : (
              <div className="relative">
                <select
                  {...register("category")}
                  disabled={availableCategories.length === 0}
                  className={cn(
                    "w-full appearance-none border-b bg-transparent py-2 pr-6 text-base text-foreground outline-none transition-colors",
                    "border-border/50 focus:border-primary",
                    "disabled:opacity-40",
                  )}
                >
                  {availableCategories.length === 0 ? (
                    <option value="">All categories in use</option>
                  ) : (
                    availableCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-card">
                        {cat}
                      </option>
                    ))
                  )}
                </select>
                {/* Chevron */}
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
                {errors.category && (
                  <p className="mt-1 text-xs text-[hsl(var(--expense))]">
                    {errors.category.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Max amount */}
          <div className="space-y-2">
            <label
              htmlFor="max_amount"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Monthly limit
            </label>
            <div className="relative flex items-center border-b border-border/50 pb-0 transition-colors focus-within:border-primary">
              <span className="font-heading text-lg text-muted-foreground/60">
                $
              </span>
              <input
                id="max_amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register("max_amount", { valueAsNumber: true })}
                className="w-full bg-transparent py-2 pl-1 font-heading text-lg text-foreground outline-none placeholder:text-muted-foreground/30"
                placeholder="0.00"
              />
            </div>
            {errors.max_amount && (
              <p className="text-xs text-[hsl(var(--expense))]">
                {errors.max_amount.message}
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || availableCategories.length === 0 && !isEditing}
              className={cn(
                "flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all",
                "hover:brightness-110 active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {isPending
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Create budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
