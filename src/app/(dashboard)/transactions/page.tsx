import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="space-y-8 animate-[fadeSlideIn_0.5s_ease-out_both]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            Track every movement of your money
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-10 w-full rounded-lg border border-border/50 bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border/50 bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.8} />
          Sort
        </button>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border/50 bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
          Filter
        </button>
      </div>

      {/* Empty table */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="grid grid-cols-[1fr_120px_100px_100px] gap-4 border-b border-border/50 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">Description</span>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">Category</span>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">Date</span>
          <span className="text-right text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">Amount</span>
        </div>

        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="font-heading text-lg font-medium text-muted-foreground/40">
              No transactions yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground/30">
              Data will appear after seeding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
