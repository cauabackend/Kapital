import { Suspense } from "react";
import { fetchBudgets, fetchAvailableCategories } from "./actions";
import { BudgetsClient } from "./budgets-client";
import BudgetsLoading from "./loading";

async function BudgetsContent() {
  const [budgets, availableCategories] = await Promise.all([
    fetchBudgets(),
    fetchAvailableCategories(),
  ]);

  return (
    <BudgetsClient budgets={budgets} availableCategories={availableCategories} />
  );
}

export default function BudgetsPage() {
  return (
    <div className="space-y-8 animate-[fadeSlideIn_0.5s_ease-out_both]">
      <Suspense fallback={<BudgetsLoading />}>
        <BudgetsContent />
      </Suspense>
    </div>
  );
}
