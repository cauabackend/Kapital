export default function PotsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-xl bg-muted/50" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <PotCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function PotCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6">
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] animate-pulse bg-muted/60" />

      {/* Ring */}
      <div className="mb-5 flex flex-col items-center gap-3">
        <div className="h-24 w-24 animate-pulse rounded-full bg-muted/40" />
        <div className="h-5 w-28 animate-pulse rounded-md bg-muted/50" />
      </div>

      {/* Amounts */}
      <div className="mb-5 flex justify-between border-y border-border/30 py-3">
        <div className="space-y-1.5">
          <div className="h-2.5 w-10 animate-pulse rounded bg-muted/30" />
          <div className="h-6 w-20 animate-pulse rounded-md bg-muted/50" />
        </div>
        <div className="space-y-1.5 text-right">
          <div className="ml-auto h-2.5 w-8 animate-pulse rounded bg-muted/30" />
          <div className="h-6 w-20 animate-pulse rounded-md bg-muted/40" />
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-9 animate-pulse rounded-xl bg-muted/40" />
        <div className="h-9 animate-pulse rounded-xl bg-muted/30" />
      </div>
    </div>
  );
}
