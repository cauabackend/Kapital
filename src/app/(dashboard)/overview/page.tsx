import { Suspense } from "react";
import { fetchOverviewData } from "./actions";
import { OverviewDashboard } from "./overview-dashboard";
import OverviewLoading from "./loading";

async function OverviewContent() {
  const data = await fetchOverviewData();

  return (
    <OverviewDashboard
      balance={data.balance}
      monthlyIncome={data.monthlyIncome}
      monthlyExpenses={data.monthlyExpenses}
      billsPending={data.billsPending}
      chartData={data.chartData}
      topBudgets={data.topBudgets}
      recentTransactions={data.recentTransactions}
      pots={data.pots}
      bills={data.bills}
    />
  );
}

export default function OverviewPage() {
  return (
    <div className="animate-[fadeSlideIn_0.5s_ease-out_both]">
      <Suspense fallback={<OverviewLoading />}>
        <OverviewContent />
      </Suspense>
    </div>
  );
}
