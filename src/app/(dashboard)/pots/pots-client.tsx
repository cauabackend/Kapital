"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Pot } from "@/types/database";
import { deletePot } from "./actions";
import { PotCard } from "./pot-card";
import { PotModal } from "./pot-modal";
import { MoneyDialog } from "./money-dialog";
import { DeleteDialog } from "./delete-dialog";
import { useT } from "@/hooks/use-t";

interface PotsClientProps {
  pots: Pot[];
}

export function PotsClient({ pots }: PotsClientProps) {
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPot, setEditingPot] = useState<Pot | null>(null);
  const [moneyTarget, setMoneyTarget] = useState<{
    pot: Pot;
    mode: "deposit" | "withdraw";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pot | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditingPot(null);
    setModalOpen(true);
  };

  const openEdit = (pot: Pot) => {
    setEditingPot(pot);
    setModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deletePot(deleteTarget.id);
      setDeleteTarget(null);
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t.pots.title}
          </h1>
          <p className="text-muted-foreground">
            {t.pots.subtitle}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t.pots.addPot}
        </button>
      </div>

      {/* Grid */}
      {pots.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pots.map((pot, i) => (
            <div
              key={pot.id}
              style={{
                animation: `fadeSlideIn 0.4s ease-out ${i * 0.07}s both`,
              }}
            >
              <PotCard
                pot={pot}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onDeposit={(p) => setMoneyTarget({ pot: p, mode: "deposit" })}
                onWithdraw={(p) =>
                  setMoneyTarget({ pot: p, mode: "withdraw" })
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Pot add/edit modal */}
      <PotModal
        open={modalOpen}
        pot={editingPot}
        onClose={() => {
          setModalOpen(false);
          setEditingPot(null);
        }}
      />

      {/* Deposit / Withdraw dialog */}
      {moneyTarget && (
        <MoneyDialog
          pot={moneyTarget.pot}
          mode={moneyTarget.mode}
          onClose={() => setMoneyTarget(null)}
        />
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          pot={deleteTarget}
          isPending={isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const t = useT();
  return (
    <button
      onClick={onAdd}
      className="mt-2 flex h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/40 bg-card/40 transition-colors hover:border-border/70 hover:bg-card/60"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
        <Plus className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.75} />
      </div>
      <div className="text-center">
        <p className="font-heading text-lg font-medium text-muted-foreground/50">
          {t.pots.empty}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground/35">
          {t.pots.emptyHint}
        </p>
      </div>
    </button>
  );
}
