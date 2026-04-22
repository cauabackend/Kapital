"use client";

import { useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { potTransactionSchema, PotTransactionFormData } from "@/lib/validators/pot";
import { depositToPot, withdrawFromPot } from "./actions";
import { Pot } from "@/types/database";

interface MoneyDialogProps {
  pot: Pot;
  mode: "deposit" | "withdraw";
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export function MoneyDialog({ pot, mode, onClose }: MoneyDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const isDeposit = mode === "deposit";

  const maxDeposit = Math.max(pot.target_amount - pot.current_amount, 0);
  const maxWithdraw = pot.current_amount;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PotTransactionFormData>({
    resolver: zodResolver(potTransactionSchema),
    defaultValues: { amount: 0 },
  });

  const amountValue = watch("amount") || 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const setMax = () => {
    const max = isDeposit ? maxDeposit : maxWithdraw;
    setValue("amount", max, { shouldValidate: true });
  };

  const onSubmit = (values: PotTransactionFormData) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("amount", String(values.amount));

      const result = isDeposit
        ? await depositToPot(pot.id, fd)
        : await withdrawFromPot(pot.id, fd);

      if (result?.error) {
        setError("root", { message: result.error });
        return;
      }
      onClose();
    });
  };

  // Preview: what balance will look like after action
  const preview = isDeposit
    ? Math.min(pot.current_amount + amountValue, pot.target_amount)
    : Math.max(pot.current_amount - amountValue, 0);

  const previewPct =
    pot.target_amount > 0 ? (preview / pot.target_amount) * 100 : 0;
  const currentPct =
    pot.target_amount > 0
      ? (pot.current_amount / pot.target_amount) * 100
      : 0;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      style={{ animation: "fadeSlideIn 0.15s ease-out both" }}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/40"
        style={{ animation: "fadeSlideIn 0.2s ease-out both" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Top accent */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ backgroundColor: pot.theme_color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: pot.theme_color + "22", color: pot.theme_color }}
            >
              {isDeposit ? (
                <ArrowDownLeft className="h-4 w-4" strokeWidth={2} />
              ) : (
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {isDeposit ? "Add money to" : "Withdraw from"}
              </p>
              <h2 className="font-heading text-lg font-semibold leading-none tracking-tight">
                {pot.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Balance preview bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current: {fmt(pot.current_amount)}</span>
              <span>Target: {fmt(pot.target_amount)}</span>
            </div>

            {/* Track */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
              {/* Current (before) */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(currentPct, 100)}%`,
                  backgroundColor: pot.theme_color + "55",
                }}
              />
              {/* Preview (after) */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(previewPct, 100)}%`,
                  backgroundColor: pot.theme_color,
                  opacity: amountValue > 0 ? 1 : 0,
                }}
              />
            </div>

            <div className="text-right text-xs font-medium" style={{ color: pot.theme_color }}>
              {amountValue > 0
                ? `After: ${fmt(preview)} (${previewPct.toFixed(0)}%)`
                : `${currentPct.toFixed(0)}% saved`}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="tx-amount"
                className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Amount
              </label>
              <button
                type="button"
                onClick={setMax}
                className="text-[10px] font-semibold uppercase tracking-widest transition-colors"
                style={{ color: pot.theme_color }}
              >
                Max
              </button>
            </div>
            <div className="flex items-center border-b border-border/50 transition-colors focus-within:border-primary">
              <span className="font-heading text-lg text-muted-foreground/60">$</span>
              <input
                id="tx-amount"
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

          {/* Limit note */}
          {isDeposit && maxDeposit > 0 && (
            <p className="text-xs text-muted-foreground/60">
              Up to {fmt(maxDeposit)} can be added to reach the target.
            </p>
          )}
          {!isDeposit && maxWithdraw > 0 && (
            <p className="text-xs text-muted-foreground/60">
              Balance available to withdraw: {fmt(maxWithdraw)}.
            </p>
          )}

          {/* Root error */}
          {errors.root && (
            <p className="rounded-lg bg-[hsl(var(--expense)/0.1)] px-3 py-2 text-sm text-[hsl(var(--expense))]">
              {errors.root.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all",
                "hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
              )}
              style={{ backgroundColor: pot.theme_color }}
            >
              {isPending
                ? "Processing…"
                : isDeposit
                  ? "Add Money"
                  : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
