export default function OverviewLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-muted/40" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-2.5 w-14 animate-pulse rounded bg-muted/40" />
                <div className="h-7 w-28 animate-pulse rounded-md bg-muted/50" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
              </div>
              <div className="h-9 w-9 animate-pulse rounded-xl bg-muted/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + budgets row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border/40 bg-card p-6">
            <div className="mb-5 flex justify-between">
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 animate-pulse rounded bg-muted/40" />
                <div className="h-5 w-40 animate-pulse rounded-md bg-muted/50" />
              </div>
              <div className="flex gap-3">
                <div className="h-3 w-14 animate-pulse rounded bg-muted/30" />
                <div className="h-3 w-14 animate-pulse rounded bg-muted/30" />
              </div>
            </div>
            <div className="h-60 animate-pulse rounded-xl bg-muted/20" />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/40 bg-card p-6">
            <div className="mb-5 space-y-1.5">
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted/40" />
              <div className="h-5 w-28 animate-pulse rounded-md bg-muted/50" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-muted/40" />
                    <div className="h-3.5 w-20 animate-pulse rounded bg-muted/30" />
                  </div>
                  <div className="h-1.5 w-full animate-pulse rounded-full bg-muted/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions + side widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border/40 bg-card p-6">
            <div className="mb-5 space-y-1.5">
              <div className="h-2.5 w-10 animate-pulse rounded bg-muted/40" />
              <div className="h-5 w-40 animate-pulse rounded-md bg-muted/50" />
            </div>
            <div className="space-y-0 divide-y divide-border/30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/40" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 animate-pulse rounded bg-muted/40" />
                    <div className="h-2.5 w-24 animate-pulse rounded bg-muted/30" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-muted/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-card p-6"
            >
              <div className="mb-4 h-2.5 w-24 animate-pulse rounded bg-muted/40" />
              <div className="mb-3 h-7 w-32 animate-pulse rounded-md bg-muted/50" />
              <div className="h-2 animate-pulse rounded-full bg-muted/30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
