"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";
import type { Goal, Income } from "./PocketGoalsClient";
import { validateIncome } from "./IncomeForm";

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

export default function IncomeCard({
  income,
  goals,
  onUpdate,
  onDelete,
}: {
  income: Income;
  goals: Goal[];
  onUpdate: (
    id: string,
    title: string,
    amount: number,
    source: string,
    note: string,
    goalId: string | null,
    receivedOn: string,
  ) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(income.title);
  const [amount, setAmount] = useState(String(income.amount));
  const [source, setSource] = useState(income.source ?? "");
  const [note, setNote] = useState(income.note ?? "");
  const [goalId, setGoalId] = useState(income.goal_id ?? "");
  const [receivedOn, setReceivedOn] = useState(income.received_on ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const linkedGoal = goals.find((g) => g.id === income.goal_id);

  async function handleSave() {
    const invalid = validateIncome(title, amount, source, note);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const saveError = await onUpdate(
      income.id,
      title.trim(),
      Number(amount),
      source.trim(),
      note.trim(),
      goalId || null,
      receivedOn,
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
          <label htmlFor={`inc-title-${income.id}`} className="block text-sm font-medium">
            Title
          </label>
          <input
            id={`inc-title-${income.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`inc-amount-${income.id}`} className="block text-sm font-medium">
            Amount
          </label>
          <input
            id={`inc-amount-${income.id}`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`inc-source-${income.id}`} className="block text-sm font-medium">
            Source
          </label>
          <input
            id={`inc-source-${income.id}`}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`inc-goal-${income.id}`} className="block text-sm font-medium">
            Link to goal
          </label>
          <select
            id={`inc-goal-${income.id}`}
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          >
            <option value="">No goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`inc-date-${income.id}`} className="block text-sm font-medium">
            Date
          </label>
          <input
            id={`inc-date-${income.id}`}
            type="date"
            value={receivedOn}
            onChange={(e) => setReceivedOn(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`inc-note-${income.id}`} className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id={`inc-note-${income.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
              setTitle(income.title);
              setAmount(String(income.amount));
              setSource(income.source ?? "");
              setNote(income.note ?? "");
              setGoalId(income.goal_id ?? "");
              setReceivedOn(income.received_on ?? "");
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
    <div className="pg-card rounded-2xl border-l-4 border-l-emerald-400 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            {/* User text is rendered as plain text (React escapes it) — data, not markup. */}
            <h3 className="break-words font-semibold">{income.title}</h3>
            <span className="shrink-0 font-semibold text-emerald-600">
              +{formatMoney(Number(income.amount), income.currency)}
            </span>
          </div>
          {income.source && (
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                {income.source}
              </span>
            </div>
          )}
          {linkedGoal && (
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                🎯 {linkedGoal.name}
              </span>
            </div>
          )}
          {income.note && (
            <p className="mt-2 break-words whitespace-pre-wrap text-sm text-gray-600">
              {income.note}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(income.received_on).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 text-sm">
          {confirmingDelete ? (
            <>
              <button
                onClick={() => onDelete(income.id)}
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
