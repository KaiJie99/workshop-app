"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";
import type { Goal } from "./PocketGoalsClient";
import { validateGoal } from "./GoalForm";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function GoalCard({
  goal,
  saved,
  onUpdate,
  onDelete,
}: {
  goal: Goal;
  saved: number;
  onUpdate: (
    id: string,
    name: string,
    targetAmount: number,
    notes: string,
  ) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(goal.name);
  const [amount, setAmount] = useState(String(goal.target_amount));
  const [notes, setNotes] = useState(goal.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const target = Number(goal.target_amount);
  const percent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  async function handleSave() {
    const invalid = validateGoal(name, amount, notes);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const saveError = await onUpdate(goal.id, name.trim(), Number(amount), notes.trim());
    setBusy(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-3 rounded-xl border border-gray-300 p-4">
        <div>
          <label htmlFor={`goal-name-${goal.id}`} className="block text-sm font-medium">
            Goal name
          </label>
          <input
            id={`goal-name-${goal.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`goal-amount-${goal.id}`} className="block text-sm font-medium">
            Target amount
          </label>
          <input
            id={`goal-amount-${goal.id}`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`goal-notes-${goal.id}`} className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id={`goal-notes-${goal.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={busy}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: brand.primaryColor }}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setName(goal.name);
              setAmount(String(goal.target_amount));
              setNotes(goal.notes ?? "");
              setError(null);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* User text is rendered as plain text (React escapes it) — data, not markup. */}
          <h3 className="break-words font-semibold">{goal.name}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {formatMoney(saved, goal.currency)} of{" "}
            {formatMoney(target, goal.currency)} ({percent}%)
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, backgroundColor: brand.primaryColor }}
            />
          </div>
          {goal.notes && (
            <p className="mt-2 break-words whitespace-pre-wrap text-sm text-gray-600">
              {goal.notes}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(goal.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 text-sm">
          {confirmingDelete ? (
            <>
              <button
                onClick={() => onDelete(goal.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white"
              >
                Really delete?
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
              >
                Keep
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
