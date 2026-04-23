"use client";

import { useT } from "@/hooks/use-t";

export function TransactionsHeader() {
  const t = useT();
  return (
    <div className="space-y-1">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {t.transactions.title}
      </h1>
      <p className="text-muted-foreground">{t.transactions.subtitle}</p>
    </div>
  );
}
