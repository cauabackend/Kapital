"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { BudgetWithData, deleteBudget } from "./actions";
import { BudgetCard } from "./budget-card";
import { BudgetModal } from "./budget-modal";
import { DeleteDialog } from "./delete-dialog";
import { useT } from "@/hooks/use-t";

interface BudgetsClientProps {
  budgets: BudgetWithData[];
  availableCategories: string[];
}

export function BudgetsClient({
  budgets,
  availableCategories,
}: BudgetsClientProps) {
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithData | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<BudgetWithData | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const openEdit = (budget: BudgetWithData) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingBudget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteBudget(deleteTarget.id);
      setDeleteTarget(null);
    });
  };

  // When editing, the current budget's category must appear in the list
  const categoriesForModal = editingBudget
    ? [editingBudget.category, ...availableCategories]
    : availableCategories;

  return (
    <>
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t.budgets.title}
          </h1>
          <p className="text-muted-foreground">{t.budgets.subtitle}</p>
        </div>

        <button
          onClick={openCreate}
          disabled={availableCategories.length === 0}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t.budgets.addBudget}
        </button>
      </div>

      {/* Budget grid */}
      {budgets.length === 0 ? (
        <EmptyState onAdd={openCreate} hasCategories={availableCategories.length > 0} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {budgets.map((budget, i) => (
            <div
              key={budget.id}
              style={{
                animation: `fadeSlideIn 0.4s ease-out ${i * 0.06}s both`,
              }}
            >
              <BudgetCard
                budget={budget}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            </div>
          ))}
        </div>
      )}

      {/* All categories used — hint */}
      {budgets.length > 0 && availableCategories.length === 0 && (
        <p className="text-center text-sm text-muted-foreground/50">
          {t.budgets.allUsed}
        </p>
      )}

      {/* Add / Edit modal */}
      <BudgetModal
        open={modalOpen}
        budget={editingBudget}
        availableCategories={categoriesForModal}
        onClose={handleModalClose}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteDialog
          budget={deleteTarget}
          isPending={isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

function EmptyState({
  onAdd,
  hasCategories,
}: {
  onAdd: () => void;
  hasCategories: boolean;
}) {
  const t = useT();
  return (
    <button
      onClick={hasCategories ? onAdd : undefined}
      disabled={!hasCategories}
      className="col-span-full mt-2 flex h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/40 bg-card/40 transition-colors hover:border-border/70 hover:bg-card/60 disabled:cursor-default"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
        <Plus
          className="h-5 w-5 text-muted-foreground/40"
          strokeWidth={1.75}
        />
      </div>
      <div className="text-center">
        <p className="font-heading text-lg font-medium text-muted-foreground/50">
          {t.budgets.empty}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground/35">
          {t.budgets.emptyHint}
        </p>
      </div>
    </button>
  );
}
