export default function RecurringBillsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-xl bg-muted/50" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card p-5">
            <div className="mb-2 h-2.5 w-20 animate-pulse rounded bg-muted/40" />
            <div className="h-7 w-28 animate-pulse rounded-md bg-muted/50" />
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="h-10 w-full max-w-sm animate-pulse rounded-xl bg-muted/40" />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
        {/* Header */}
        <div className="grid grid-cols-[56px_1fr_100px_96px_80px] gap-4 border-b border-border/40 px-5 py-3">
          {["w-8", "w-12", "w-14", "w-16", "w-8"].map((w, i) => (
            <div key={i} className={`h-2.5 ${w} animate-pulse rounded bg-muted/30`} />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/30">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[56px_1fr_100px_96px_80px] items-center gap-4 px-5 py-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/40" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted/40" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted/50" />
              <div />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
