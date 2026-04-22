export default function BudgetsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-4 w-52 animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-muted/50" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <BudgetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BudgetCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6">
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] animate-pulse bg-muted/60" />

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-muted/50" />
          <div className="space-y-2">
            <div className="h-2.5 w-10 animate-pulse rounded bg-muted/40" />
            <div className="h-5 w-24 animate-pulse rounded-md bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="mb-3 flex items-baseline justify-between">
        <div className="h-7 w-28 animate-pulse rounded-md bg-muted/50" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted/40" />
      </div>

      {/* Progress bar */}
      <div className="mb-1.5 h-2 w-full animate-pulse rounded-full bg-muted/40" />

      {/* Status */}
      <div className="mb-5 flex justify-between">
        <div className="h-3.5 w-28 animate-pulse rounded bg-muted/40" />
        <div className="h-3.5 w-8 animate-pulse rounded bg-muted/30" />
      </div>

      {/* Transactions */}
      <div className="space-y-3 border-t border-border/30 pt-4">
        <div className="mb-3 h-2.5 w-12 animate-pulse rounded bg-muted/30" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 animate-pulse rounded bg-muted/40" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted/30" />
            </div>
            <div className="h-4 w-14 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
