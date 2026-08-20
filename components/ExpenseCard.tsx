"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";
import type { Expense } from "./PocketGoalsClient";
import { validateExpense } from "./ExpenseForm";

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

export default function ExpenseCard({
  expense,
  onUpdate,
  onDelete,
}: {
  expense: Expense;
  onUpdate: (
    id: string,
    title: string,
    amount: number,
    category: string,
    note: string,
    spentOn: string,
  ) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category ?? "");
  const [note, setNote] = useState(expense.note ?? "");
  const [spentOn, setSpentOn] = useState(expense.spent_on ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    const invalid = validateExpense(title, amount, category, note);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const saveError = await onUpdate(
      expense.id,
      title.trim(),
      Number(amount),
      category.trim(),
      note.trim(),
      spentOn,
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
          <label htmlFor={`exp-title-${expense.id}`} className="block text-sm font-medium">
            Title
          </label>
          <input
            id={`exp-title-${expense.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`exp-amount-${expense.id}`} className="block text-sm font-medium">
            Amount
          </label>
          <input
            id={`exp-amount-${expense.id}`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`exp-category-${expense.id}`} className="block text-sm font-medium">
            Category
          </label>
          <input
            id={`exp-category-${expense.id}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`exp-date-${expense.id}`} className="block text-sm font-medium">
            Date
          </label>
          <input
            id={`exp-date-${expense.id}`}
            type="date"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`exp-note-${expense.id}`} className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id={`exp-note-${expense.id}`}
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
              setTitle(expense.title);
              setAmount(String(expense.amount));
              setCategory(expense.category ?? "");
              setNote(expense.note ?? "");
              setSpentOn(expense.spent_on ?? "");
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
    <div className="pg-card rounded-2xl border-l-4 border-l-red-400 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            {/* User text is rendered as plain text (React escapes it) — data, not markup. */}
            <h3 className="break-words font-semibold">{expense.title}</h3>
            <span className="shrink-0 font-semibold" style={{ color: brand.primaryColor }}>
              {formatMoney(Number(expense.amount), expense.currency)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
            {expense.category && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5">
                {expense.category}
              </span>
            )}
          </div>
          {expense.note && (
            <p className="mt-2 break-words whitespace-pre-wrap text-sm text-gray-600">
              {expense.note}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(expense.spent_on).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 text-sm">
          {confirmingDelete ? (
            <>
              <button
                onClick={() => onDelete(expense.id)}
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
