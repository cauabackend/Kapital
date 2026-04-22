function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_130px_110px_110px] items-center gap-4 border-b border-border/30 px-5 py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-4 w-44 animate-pulse rounded bg-muted/50" />
      </div>
      <div className="h-6 w-20 animate-pulse rounded-full bg-muted/50" />
      <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
      <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted/50" />
    </div>
  );
}

export default function TransactionsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted/40" />
      </div>

      <div className="flex gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/50" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="border-b border-border/50 px-5 py-3">
          <div className="h-3 w-64 animate-pulse rounded bg-muted/40" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
