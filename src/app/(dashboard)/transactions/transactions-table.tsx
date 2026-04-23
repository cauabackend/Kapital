"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionsResult, SortField, SortOrder, FilterType } from "./actions";
import { useT } from "@/hooks/use-t";

function formatAmount(amount: number, type: string) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
  return type === "income" ? `+${formatted}` : `-${formatted}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Skeleton row
function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_130px_110px_110px] items-center gap-4 border-b border-border/30 px-5 py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted/50" />
      </div>
      <div className="h-5 w-20 animate-pulse rounded-full bg-muted/50" />
      <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
      <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted/50" />
    </div>
  );
}

interface TransactionsTableProps {
  initialData: TransactionsResult;
  categories: string[];
}

export function TransactionsTable({
  initialData,
  categories,
}: TransactionsTableProps) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Controlled state from URL
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const sortKey = searchParams.get("sort") ?? "date_desc";
  const filterType = (searchParams.get("type") ?? "all") as FilterType;
  const categoryFilter = searchParams.get("category") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const SORT_OPTIONS: { label: string; field: SortField; order: SortOrder }[] =
    [
      { label: t.transactions.dateNewest, field: "date", order: "desc" },
      { label: t.transactions.dateOldest, field: "date", order: "asc" },
      { label: t.transactions.amountHighest, field: "amount", order: "desc" },
      { label: t.transactions.amountLowest, field: "amount", order: "asc" },
      { label: t.transactions.descAZ, field: "description", order: "asc" },
      { label: t.transactions.descZA, field: "description", order: "desc" },
    ];

  const activeSortOption =
    SORT_OPTIONS.find((o) => `${o.field}_${o.order}` === sortKey) ??
    SORT_OPTIONS[0];

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset page on filter/search changes
      if (!("page" in updates)) params.set("page", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router],
  );

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput });
      }
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchInput, search, updateParams]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setShowSort(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilter(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data, total, totalPages } = initialData;
  const hasActiveFilters = filterType !== "all" || categoryFilter !== "";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.transactions.search}
            className="h-10 w-full rounded-lg border border-border/50 bg-card pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                updateParams({ search: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => {
              setShowSort(!showSort);
              setShowFilter(false);
            }}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
              showSort
                ? "border-primary/50 bg-primary/5 text-primary"
                : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">{activeSortOption.label}</span>
            <span className="sm:hidden">{t.transactions.sort}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                showSort && "rotate-180",
              )}
            />
          </button>

          {showSort && (
            <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-border/50 bg-popover shadow-xl">
              {SORT_OPTIONS.map((opt) => {
                const key = `${opt.field}_${opt.order}`;
                const isActive = key === sortKey;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      updateParams({ sort: key });
                      setShowSort(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/50",
                    )}
                  >
                    {opt.label}
                    {isActive && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => {
              setShowFilter(!showFilter);
              setShowSort(false);
            }}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
              hasActiveFilters
                ? "border-primary/50 bg-primary/5 text-primary"
                : showFilter
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
            {t.transactions.filter}
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {(filterType !== "all" ? 1 : 0) + (categoryFilter ? 1 : 0)}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                showFilter && "rotate-180",
              )}
            />
          </button>

          {showFilter && (
            <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-border/50 bg-popover p-3 shadow-xl">
              {/* Type filter */}
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {t.transactions.type}
              </p>
              <div className="mb-3 flex gap-1.5">
                {(["all", "income", "expense"] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      updateParams({ type: type === "all" ? null : type })
                    }
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors",
                      filterType === type
                        ? type === "income"
                          ? "bg-income/15 text-income"
                          : type === "expense"
                            ? "bg-expense/15 text-expense"
                            : "bg-primary/10 text-primary"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    {type === "all"
                      ? t.transactions.allTypes
                      : type === "income"
                        ? t.transactions.income
                        : t.transactions.expense}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {t.transactions.category}
              </p>
              <div className="max-h-44 space-y-0.5 overflow-y-auto">
                <button
                  onClick={() => updateParams({ category: null })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    !categoryFilter
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {t.transactions.allCategories}
                  {!categoryFilter && <Check className="h-3.5 w-3.5" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      updateParams({ category: cat });
                      setShowFilter(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      categoryFilter === cat
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {cat}
                    {categoryFilter === cat && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Clear */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    updateParams({ type: null, category: null });
                    setShowFilter(false);
                  }}
                  className="mt-3 w-full rounded-lg border border-border/50 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  {t.transactions.clearFilters}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground/50">
          {total}{" "}
          {total !== 1 ? t.transactions.results : t.transactions.result}
          {search && ` ${t.transactions.matching} "${search}"`}
        </p>
        {isPending && (
          <p className="text-xs text-muted-foreground/40">
            {t.transactions.loading}
          </p>
        )}
      </div>

      {/* Table */}
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/50 bg-card transition-opacity",
          isPending && "opacity-60",
        )}
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr_130px_110px_110px] items-center gap-4 border-b border-border/50 px-5 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            {t.transactions.description}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            {t.transactions.category}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            {t.transactions.date}
          </span>
          <span className="text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            {t.transactions.amount}
          </span>
        </div>

        {/* Rows */}
        {isPending ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="font-heading text-base font-medium text-muted-foreground/40">
                {t.transactions.noResults}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/30">
                {t.transactions.noResultsHint}
              </p>
            </div>
          </div>
        ) : (
          data.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-[1fr_130px_110px_110px] items-center gap-4 border-b border-border/30 px-5 py-4 transition-colors last:border-0 hover:bg-muted/20"
            >
              {/* Description + icon */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    tx.type === "income" ? "bg-income/10" : "bg-muted/50",
                  )}
                >
                  {tx.type === "income" ? (
                    <TrendingUp
                      className="h-4 w-4 text-income"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 text-muted-foreground"
                      strokeWidth={1.8}
                    />
                  )}
                </div>
                <span className="truncate text-sm font-medium">
                  {tx.description}
                </span>
              </div>

              {/* Category badge */}
              <span className="inline-flex w-fit items-center rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {tx.category}
              </span>

              {/* Date */}
              <span className="text-sm text-muted-foreground">
                {formatDate(tx.date)}
              </span>

              {/* Amount */}
              <span
                className={cn(
                  "text-right text-sm font-semibold tabular-nums",
                  tx.type === "income" ? "text-income" : "text-foreground",
                )}
              >
                {formatAmount(tx.amount, tx.type)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50">
            {t.transactions.page} {page} {t.common.of} {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="flex h-9 w-9 items-center justify-center text-xs text-muted-foreground/40"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: String(p) })}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      page === p
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
