import { Plus } from "lucide-react";

export default function BudgetsPage() {
  return (
    <div className="space-y-8 animate-[fadeSlideIn_0.5s_ease-out_both]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Budgets
          </h1>
          <p className="text-muted-foreground">
            Set limits and stay on track
          </p>
        </div>
        <button className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Budget
        </button>
      </div>

      {/* Budget cards grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="col-span-full flex h-[360px] items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/50">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Plus className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.8} />
            </div>
            <p className="font-heading text-lg font-medium text-muted-foreground/40">
              No budgets created
            </p>
            <p className="mt-1 text-sm text-muted-foreground/30">
              Create a budget to start tracking spending by category
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
