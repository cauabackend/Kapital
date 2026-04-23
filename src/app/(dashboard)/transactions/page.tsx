import { Suspense } from "react";
import {
  fetchTransactions,
  fetchTransactionCategories,
  SortField,
  SortOrder,
  FilterType,
} from "./actions";
import { TransactionsTable } from "./transactions-table";
import { TransactionsHeader } from "./transactions-header";
import TransactionsLoading from "./loading";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    sort?: string;
    type?: string;
    category?: string;
  };
}

async function TransactionsContent({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const sortKey = searchParams.sort ?? "date_desc";
  const filterType = (searchParams.type ?? "all") as FilterType;
  const category = searchParams.category ?? "";

  const [sortField, sortOrder] = sortKey.split("_") as [SortField, SortOrder];

  const [result, categories] = await Promise.all([
    fetchTransactions({ page, search, sortField, sortOrder, filterType, category }),
    fetchTransactionCategories(),
  ]);

  return <TransactionsTable initialData={result} categories={categories} />;
}

export default function TransactionsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-8 animate-[fadeSlideIn_0.5s_ease-out_both]">
      <TransactionsHeader />

      <Suspense fallback={<TransactionsLoading />}>
        <TransactionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
