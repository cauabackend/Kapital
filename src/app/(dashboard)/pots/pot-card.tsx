"use client";

import { Pencil, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pot } from "@/types/database";

interface PotCardProps {
  pot: Pot;
  onEdit: (pot: Pot) => void;
  onDelete: (pot: Pot) => void;
  onDeposit: (pot: Pot) => void;
  onWithdraw: (pot: Pot) => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

// SVG circular progress ring
function RingProgress({
  pct,
  color,
  size = 96,
  stroke = 7,
}: {
  pct: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const center = size / 2;
  const radius = center - stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(pct, 100) / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted/30"
      />
      {/* Fill */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

export function PotCard({
  pot,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
}: PotCardProps) {
  const pct =
    pot.target_amount > 0
      ? (pot.current_amount / pot.target_amount) * 100
      : 0;
  const isComplete = pot.current_amount >= pot.target_amount;
  const remaining = Math.max(pot.target_amount - pot.current_amount, 0);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-xl hover:shadow-black/20"
    >
      {/* Colored top accent */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ backgroundColor: pot.theme_color }}
      />

      {/* Subtle color wash in background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundColor: pot.theme_color }}
      />

      <div className="relative p-6">
        {/* Edit / Delete — hover reveal */}
        <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={() => onEdit(pot)}
            aria-label="Edit pot"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(pot)}
            aria-label="Delete pot"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[hsl(var(--expense)/0.1)] hover:text-[hsl(var(--expense))]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Ring + center text */}
        <div className="mb-5 flex flex-col items-center">
          <div className="relative mb-3">
            <RingProgress pct={pct} color={pot.theme_color} />
            {/* Centered percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-heading text-xl font-semibold tabular-nums leading-none"
                style={{ color: pot.theme_color }}
              >
                {pct >= 100 ? "✓" : `${Math.round(pct)}%`}
              </span>
            </div>
          </div>

          {/* Pot name */}
          <h3 className="text-center font-heading text-lg font-semibold leading-tight tracking-tight">
            {pot.name}
          </h3>
          {isComplete && (
            <span
              className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: pot.theme_color + "22",
                color: pot.theme_color,
              }}
            >
              Goal reached
            </span>
          )}
        </div>

        {/* Amount row */}
        <div className="mb-5 flex items-baseline justify-between border-y border-border/30 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Saved
            </p>
            <p className="font-heading text-xl font-semibold tabular-nums">
              {fmt(pot.current_amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {isComplete ? "Target" : "Left"}
            </p>
            <p className="font-heading text-xl font-semibold tabular-nums text-muted-foreground">
              {isComplete ? fmt(pot.target_amount) : fmt(remaining)}
            </p>
          </div>
        </div>

        {/* Deposit / Withdraw buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onDeposit(pot)}
            disabled={isComplete}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "hover:brightness-110 active:scale-[0.97]",
            )}
            style={{
              backgroundColor: pot.theme_color + "22",
              color: pot.theme_color,
            }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Add Money
          </button>
          <button
            onClick={() => onWithdraw(pot)}
            disabled={pot.current_amount === 0}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground transition-all hover:border-border hover:text-foreground active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Withdraw
          </button>
        </div>
      </div>
    </article>
  );
}
