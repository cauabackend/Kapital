import { TrendingUp, TrendingDown, Landmark, Receipt } from "lucide-react";

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
            {label}
          </p>
          <p className="font-heading text-3xl font-semibold tracking-tight">{value}</p>
          <p className={`text-sm ${accent}`}>{subtext}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.6} />
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="space-y-10 animate-[fadeSlideIn_0.5s_ease-out_both]">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Overview
        </h1>
        <p className="text-muted-foreground">
          Your financial snapshot at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Balance"
          value="$0.00"
          subtext="Current total"
          icon={Landmark}
          accent="text-muted-foreground"
        />
        <StatCard
          label="Income"
          value="$0.00"
          subtext="This month"
          icon={TrendingUp}
          accent="text-income"
        />
        <StatCard
          label="Expenses"
          value="$0.00"
          subtext="This month"
          icon={TrendingDown}
          accent="text-expense"
        />
        <StatCard
          label="Bills Due"
          value="0"
          subtext="Pending this month"
          icon={Receipt}
          accent="text-muted-foreground"
        />
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-3 flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/50">
          <div className="text-center">
            <p className="font-heading text-lg font-medium text-muted-foreground/40">
              Spending chart
            </p>
            <p className="mt-1 text-sm text-muted-foreground/30">
              Populated after seeding data
            </p>
          </div>
        </div>
        <div className="col-span-2 flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/50">
          <div className="text-center">
            <p className="font-heading text-lg font-medium text-muted-foreground/40">
              Budget summary
            </p>
            <p className="mt-1 text-sm text-muted-foreground/30">
              Populated after seeding data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
