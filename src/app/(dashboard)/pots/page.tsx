import { Suspense } from "react";
import { fetchPots } from "./actions";
import { PotsClient } from "./pots-client";
import PotsLoading from "./loading";

async function PotsContent() {
  const pots = await fetchPots();
  return <PotsClient pots={pots} />;
}

export default function PotsPage() {
  return (
    <div className="space-y-8 animate-[fadeSlideIn_0.5s_ease-out_both]">
      <Suspense fallback={<PotsLoading />}>
        <PotsContent />
      </Suspense>
    </div>
  );
}
