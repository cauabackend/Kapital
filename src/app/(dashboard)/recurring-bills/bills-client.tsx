"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  CalendarClock,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecurringBill } from "@/types/database";
import { toggleBillPaid, deleteRecurringBill } from "./actions";
import { BillModal } from "./bill-modal";
import { DeleteDialog } from "./delete-dialog";
import { useT } from "@/hooks/use-t";

type SortKey = "due_day" | "name" | "amount";

interface BillsClientProps {
  bills: RecurringBill[];
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const TODAY = new Date().getDate();

function getBillStatus(bill: RecurringBill): "paid" | "overdue" | "upcoming" {
  if (bill.is_paid) return "paid";
  if (bill.due_day < TODAY) return "overdue";
  return "upcoming";
}

export function BillsClient({ bills }: BillsClientProps) {
  const t = useT();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("due_day");
  const [sortAsc, setSortAsc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecurringBill | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic paid state
  const [optimisticPaid, setOptimisticPaid] = useState<
    Record<string, boolean>
  >({});

  const handleTogglePaid = (bill: RecurringBill) => {
    const newVal = !(optimisticPaid[bill.id] ?? bill.is_paid);
    setOptimisticPaid((prev) => ({ ...prev, [bill.id]: newVal }));
    setTogglingId(bill.id);
    startTransition(async () => {
      await toggleBillPaid(bill.id, newVal);
      setTogglingId(null);
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteRecurringBill(deleteTarget.id);
      setDeleteTarget(null);
    });
  };

  // Merge optimistic state into bills list
  const mergedBills = bills.map((b) => ({
    ...b,
    is_paid: optimisticPaid[b.id] ?? b.is_paid,
  }));

  // Search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? mergedBills.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q),
        )
      : mergedBills;
  }, [mergedBills, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "due_day") cmp = a.due_day - b.due_day;
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Summary totals
  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = mergedBills
    .filter((b) => b.is_paid)
    .reduce((s, b) => s + b.amount, 0);
  const totalUpcoming = mergedBills
    .filter((b) => !b.is_paid)
    .reduce((s, b) => s + b.amount, 0);

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown
      className={cn(
        "ml-1 inline h-3 w-3 transition-opacity",
        sortKey === k ? "opacity-100" : "opacity-30",
      )}
      strokeWidth={2}
    />
  );

  return (
    <>
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t.bills.title}
          </h1>
          <p className="text-muted-foreground">
            {t.bills.subtitle}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setModalOpen(true);
          }}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t.bills.addBill}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label={t.bills.monthlyTotal}
          value={fmt(totalMonthly)}
          accent="border-primary/20"
          valueClass=""
        />
        <SummaryCard
          label={t.bills.paid}
          value={fmt(totalPaid)}
          accent="border-[hsl(var(--income)/0.25)]"
          valueClass="text-[hsl(var(--income))]"
          icon={<Check className="h-3.5 w-3.5" />}
        />
        <SummaryCard
          label={t.bills.remaining}
          value={fmt(totalUpcoming)}
          accent="border-[hsl(var(--expense)/0.25)]"
          valueClass={totalUpcoming > 0 ? "text-[hsl(var(--expense))]" : ""}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.bills.search}
            className="h-10 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Bills list */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        {/* Column headers — hidden on mobile */}
        <div className="hidden md:grid grid-cols-[56px_1fr_100px_96px_80px] items-center gap-4 border-b border-border/40 px-5 py-3">
          <button
            onClick={() => cycleSort("due_day")}
            className="text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {t.bills.day}
            <SortIcon k="due_day" />
          </button>
          <button
            onClick={() => cycleSort("name")}
            className="text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {t.bills.bill}
            <SortIcon k="name" />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {t.bills.status}
          </span>
          <button
            onClick={() => cycleSort("amount")}
            className="text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <SortIcon k="amount" />
            {t.bills.amount}
          </button>
          {/* Actions column — invisible header */}
          <span />
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            isFiltered={search.length > 0}
            onAdd={() => setModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-border/30">
            {sorted.map((bill, i) => {
              const status = getBillStatus(bill);
              const isToggling = togglingId === bill.id;

              return (
                <BillRow
                  key={bill.id}
                  bill={bill}
                  status={status}
                  isToggling={isToggling}
                  index={i}
                  onToggle={() => handleTogglePaid(bill)}
                  onEdit={() => {
                    setEditingBill(bill);
                    setModalOpen(true);
                  }}
                  onDelete={() => setDeleteTarget(bill)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <BillModal
        open={modalOpen}
        bill={editingBill}
        onClose={() => {
          setModalOpen(false);
          setEditingBill(null);
        }}
      />

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          bill={deleteTarget}
          isPending={isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

/* ── Bill row ─────────────────────────────────────────────── */

interface BillRowProps {
  bill: RecurringBill;
  status: "paid" | "overdue" | "upcoming";
  isToggling: boolean;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function BillRow({
  bill,
  status,
  isToggling,
  index,
  onToggle,
  onEdit,
  onDelete,
}: BillRowProps) {
  const t = useT();
  const dayColors = {
    paid: "bg-[hsl(var(--income)/0.1)] text-[hsl(var(--income))]",
    overdue: "bg-[hsl(var(--expense)/0.1)] text-[hsl(var(--expense))]",
    upcoming: "bg-primary/10 text-primary",
  };

  const statusConfig = {
    paid: {
      label: t.bills.paid,
      icon: <Check className="h-3 w-3" strokeWidth={2.5} />,
      cls: "bg-[hsl(var(--income)/0.1)] text-[hsl(var(--income))] border-[hsl(var(--income)/0.2)]",
    },
    overdue: {
      label: t.bills.overdue,
      icon: <AlertCircle className="h-3 w-3" strokeWidth={2} />,
      cls: "bg-[hsl(var(--expense)/0.1)] text-[hsl(var(--expense))] border-[hsl(var(--expense)/0.2)]",
    },
    upcoming: {
      label: t.bills.upcoming,
      icon: <Clock className="h-3 w-3" strokeWidth={2} />,
      cls: "bg-muted/50 text-muted-foreground border-border/40",
    },
  };

  const sc = statusConfig[status];

  const amountFmt = bill.amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return (
    <div style={{ animation: `fadeSlideIn 0.35s ease-out ${index * 0.04}s both` }}>
      {/* Mobile layout */}
      <div className="flex items-center gap-3 px-4 py-3.5 md:hidden">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-center",
            dayColors[status],
          )}
        >
          <span className="font-heading text-base font-bold leading-none tabular-nums">{bill.due_day}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">{ordinal(bill.due_day).slice(-2)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-snug">{bill.name}</p>
          <p className="text-xs text-muted-foreground/60">{bill.category}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="font-heading text-sm font-semibold tabular-nums">{amountFmt}</span>
          <button
            onClick={onToggle}
            disabled={isToggling}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all",
              "hover:brightness-110 active:scale-[0.97] disabled:opacity-60",
              sc.cls,
            )}
          >
            {sc.icon}
            {sc.label}
          </button>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[hsl(var(--expense)/0.1)] hover:text-[hsl(var(--expense))]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="group hidden md:grid grid-cols-[56px_1fr_100px_96px_80px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20">
        <div className={cn("flex h-10 w-10 flex-col items-center justify-center rounded-xl text-center transition-colors", dayColors[status])}>
          <span className="font-heading text-base font-bold leading-none tabular-nums">{bill.due_day}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">{ordinal(bill.due_day).slice(-2)}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium leading-snug">{bill.name}</p>
          <p className="text-xs text-muted-foreground/60">{bill.category}</p>
        </div>
        <button
          onClick={onToggle}
          disabled={isToggling}
          className={cn("flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all", "hover:brightness-110 active:scale-[0.97] disabled:opacity-60", sc.cls)}
          title={status === "paid" ? "Mark as unpaid" : "Mark as paid"}
        >
          {sc.icon}
          {sc.label}
        </button>
        <p className="text-right font-heading text-sm font-semibold tabular-nums">{amountFmt}</p>
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[hsl(var(--expense)/0.1)] hover:text-[hsl(var(--expense))]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Summary card ─────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  accent,
  valueClass,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  valueClass: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5",
        accent,
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {icon && (
          <span className={cn("opacity-70", valueClass)}>{icon}</span>
        )}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
      </div>
      <p className={cn("font-heading text-2xl font-semibold tabular-nums", valueClass)}>
        {value}
      </p>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

function EmptyState({
  isFiltered,
  onAdd,
}: {
  isFiltered: boolean;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
        <CalendarClock
          className="h-5 w-5 text-muted-foreground/40"
          strokeWidth={1.6}
        />
      </div>
      <div className="text-center">
        <p className="font-heading text-lg font-medium text-muted-foreground/50">
          {isFiltered ? t.bills.noSearch : t.bills.empty}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground/35">
          {isFiltered
            ? t.bills.noSearchHint
            : t.bills.emptyHint}
        </p>
      </div>
      {!isFiltered && (
        <button
          onClick={onAdd}
          className="mt-1 rounded-xl border border-border/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          {t.bills.addFirst}
        </button>
      )}
    </div>
  );
}
