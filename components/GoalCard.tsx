"use client";

import { useEffect, useState } from "react";
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
    targetDate: string,
    notes: string,
  ) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(goal.name);
  const [amount, setAmount] = useState(String(goal.target_amount));
  const [targetDate, setTargetDate] = useState(goal.target_date ?? "");
  const [notes, setNotes] = useState(goal.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const target = Number(goal.target_amount);
  const percent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const reached = target > 0 && saved >= target;

  // Days left until the target date. Read "now" once after mount so the
  // render itself stays pure (no impure Date.now() during render).
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read clock once on mount
    setNowMs(Date.now());
  }, []);
  const daysLeft =
    goal.target_date && nowMs !== null
      ? Math.ceil(
          (new Date(goal.target_date).getTime() - nowMs) / (1000 * 60 * 60 * 24),
        )
      : null;

  async function handleSave() {
    const invalid = validateGoal(name, amount, notes);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const saveError = await onUpdate(
      goal.id,
      name.trim(),
      Number(amount),
      targetDate,
      notes.trim(),
    );
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
          <label htmlFor={`goal-date-${goal.id}`} className="block text-sm font-medium">
            Target date
          </label>
          <input
            id={`goal-date-${goal.id}`}
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
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
              setTargetDate(goal.target_date ?? "");
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
    <div className="pg-card rounded-2xl border-l-4 p-4" style={{ borderLeftColor: brand.primaryColor }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* User text is rendered as plain text (React escapes it) — data, not markup. */}
          <h3 className="flex items-center gap-2 break-words font-semibold">
            {goal.name}
            {reached && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                🎉 Reached!
              </span>
            )}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {formatMoney(saved, goal.currency)} of{" "}
            {formatMoney(target, goal.currency)} ({percent}%)
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${percent}%`,
                backgroundColor: reached ? "#059669" : brand.primaryColor,
              }}
            />
          </div>
          {daysLeft !== null && (
            <p
              className={`mt-2 text-xs font-medium ${
                daysLeft < 0
                  ? "text-red-600"
                  : daysLeft <= 7
                    ? "text-amber-600"
                    : "text-gray-500"
              }`}
            >
              {daysLeft < 0
                ? `⏰ ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`
                : daysLeft === 0
                  ? "⏰ Due today"
                  : `⏳ ${daysLeft} day${daysLeft === 1 ? "" : "s"} left (by ${new Date(goal.target_date as string).toLocaleDateString()})`}
            </p>
          )}
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
