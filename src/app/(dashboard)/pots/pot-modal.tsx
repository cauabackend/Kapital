"use client";

import { useEffect, useRef, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { potSchema, PotFormData } from "@/lib/validators/pot";
import { createPot, updatePot } from "./actions";
import { Pot } from "@/types/database";
import { useT } from "@/hooks/use-t";

export const POT_COLORS = [
  { label: "Amber",  value: "#D4A855" },
  { label: "Sage",   value: "#6DAA8A" },
  { label: "Slate",  value: "#6B8CAE" },
  { label: "Rose",   value: "#C27B7B" },
  { label: "Copper", value: "#B87355" },
  { label: "Violet", value: "#8B7EC8" },
  { label: "Teal",   value: "#4E9E9E" },
  { label: "Stone",  value: "#9B8E82" },
];

interface PotModalProps {
  open: boolean;
  pot: Pot | null;
  onClose: () => void;
}

export function PotModal({ open, pot, onClose }: PotModalProps) {
  const t = useT();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!pot;

  const defaultColor = pot?.theme_color ?? POT_COLORS[0].value;
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<PotFormData>({
    resolver: zodResolver(potSchema),
    defaultValues: {
      name: pot?.name ?? "",
      target_amount: pot?.target_amount ?? 0,
      theme_color: defaultColor,
    },
  });

  useEffect(() => {
    if (open) {
      const color = pot?.theme_color ?? POT_COLORS[0].value;
      setSelectedColor(color);
      reset({
        name: pot?.name ?? "",
        target_amount: pot?.target_amount ?? 0,
        theme_color: color,
      });
    }
  }, [open, pot, reset]);

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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue("theme_color", color);
  };

  const onSubmit = (values: PotFormData) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", values.name);
      fd.set("target_amount", String(values.target_amount));
      fd.set("theme_color", values.theme_color);

      const result = isEditing
        ? await updatePot(pot.id, fd)
        : await createPot(fd);

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
        aria-labelledby="pot-modal-title"
      >
        {/* Top accent — changes with selected color */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] transition-colors duration-300"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {isEditing ? t.common.editing : t.common.new}
            </p>
            <h2
              id="pot-modal-title"
              className="font-heading text-xl font-semibold leading-none tracking-tight"
            >
              {isEditing ? pot.name : t.pots.addPot}
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
              htmlFor="pot-name"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.pots.potName}
            </label>
            <div className="border-b border-border/50 transition-colors focus-within:border-primary">
              <input
                id="pot-name"
                type="text"
                {...register("name")}
                placeholder="e.g. Emergency Fund"
                className="w-full bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-[hsl(var(--expense))]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Target amount */}
          <div className="space-y-2">
            <label
              htmlFor="pot-target"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {t.pots.targetAmount}
            </label>
            <div className="flex items-center border-b border-border/50 transition-colors focus-within:border-primary">
              <span className="font-heading text-lg text-muted-foreground/60">
                $
              </span>
              <input
                id="pot-target"
                type="number"
                step="0.01"
                min="0.01"
                {...register("target_amount", { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full bg-transparent py-2 pl-1 font-heading text-lg text-foreground outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            {errors.target_amount && (
              <p className="text-xs text-[hsl(var(--expense))]">
                {errors.target_amount.message}
              </p>
            )}
          </div>

          {/* Color picker */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.pots.colourTheme}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {POT_COLORS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleColorSelect(value)}
                  aria-label={label}
                  title={label}
                  className={cn(
                    "relative h-8 w-8 rounded-full transition-transform hover:scale-110",
                    selectedColor === value && "scale-110",
                  )}
                  style={{ backgroundColor: value }}
                >
                  {selectedColor === value && (
                    <Check
                      className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow"
                      strokeWidth={3}
                    />
                  )}
                  {selectedColor === value && (
                    <span
                      className="absolute -inset-1 rounded-full border-2 opacity-60"
                      style={{ borderColor: value }}
                    />
                  )}
                </button>
              ))}
            </div>
            {/* Hidden field for theme_color */}
            <input type="hidden" {...register("theme_color")} />
            {errors.theme_color && (
              <p className="text-xs text-[hsl(var(--expense))]">
                {errors.theme_color.message}
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
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              style={{ backgroundColor: selectedColor }}
            >
              {isPending
                ? t.common.saving
                : isEditing
                  ? t.common.save
                  : t.pots.createPot}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
