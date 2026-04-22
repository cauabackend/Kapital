"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Pot } from "@/types/database";

interface DeleteDialogProps {
  pot: Pot;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({
  pot,
  isPending,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onCancel();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      style={{ animation: "fadeSlideIn 0.15s ease-out both" }}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[hsl(var(--expense)/0.25)] bg-card shadow-2xl shadow-black/40"
        style={{ animation: "fadeSlideIn 0.2s ease-out both" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[hsl(var(--expense))]" />

        <div className="p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--expense)/0.1)]">
            <AlertTriangle
              className="h-5 w-5 text-[hsl(var(--expense))]"
              strokeWidth={1.75}
            />
          </div>

          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Delete pot?
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{pot.name}</span> and
            all its saved funds will be permanently removed.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 rounded-xl bg-[hsl(var(--expense))] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
