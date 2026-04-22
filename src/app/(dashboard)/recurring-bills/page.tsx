import { Suspense } from "react";
import { fetchRecurringBills } from "./actions";
import { BillsClient } from "./bills-client";
import RecurringBillsLoading from "./loading";

async function BillsContent() {
  const bills = await fetchRecurringBills();
  return <BillsClient bills={bills} />;
}

export default function RecurringBillsPage() {
  return (
    <div className="space-y-8 animate-[fadeSlideIn_0.5s_ease-out_both]">
      <Suspense fallback={<RecurringBillsLoading />}>
        <BillsContent />
      </Suspense>
    </div>
  );
}
