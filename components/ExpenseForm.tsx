"use client";

import { useState } from "react";

export const TITLE_MAX = 120;
export const CATEGORY_MAX = 60;
export const NOTE_MAX = 2000;

/** Returns a friendly error message, or null when the input is valid. */
export function validateExpense(
  title: string,
  amountRaw: string,
  category: string,
  note: string,
): string | null {
  if (title.trim().length === 0) return "Please give your expense a title.";
  if (title.length > TITLE_MAX) return `Keep the title under ${TITLE_MAX} characters.`;
  const amount = Number(amountRaw);
  if (amountRaw.trim().length === 0 || Number.isNaN(amount))
    return "Please enter an amount.";
  if (amount < 0) return "Amount can't be negative.";
  if (category.length > CATEGORY_MAX)
    return `Keep the category under ${CATEGORY_MAX} characters.`;
  if (note.length > NOTE_MAX) return `Keep the note under ${NOTE_MAX} characters.`;
  return null;
}

export default function ExpenseForm({
  onSubmit,
}: {
  onSubmit: (
    title: string,
    amount: number,
    category: string,
    note: string,
    spentOn: string,
  ) => Promise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [spentOn, setSpentOn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateExpense(title, amount, category, note);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const submitError = await onSubmit(
      title.trim(),
      Number(amount),
      category.trim(),
      note.trim(),
      spentOn,
    );
    setBusy(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setTitle("");
    setAmount("");
    setCategory("");
    setNote("");
    setSpentOn("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="pg-card space-y-3 rounded-2xl p-5"
    >
      <div>
        <label htmlFor="expense-title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="expense-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Coffee"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="expense-amount" className="block text-sm font-medium">
          Amount
        </label>
        <input
          id="expense-amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 12.50"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="expense-category" className="block text-sm font-medium">
          Category <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Food"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="expense-date" className="block text-sm font-medium">
          Date <span className="font-normal text-gray-500">(optional, defaults to today)</span>
        </label>
        <input
          id="expense-date"
          type="date"
          value={spentOn}
          onChange={(e) => setSpentOn(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="expense-note" className="block text-sm font-medium">
          Note <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="expense-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Any details you want to remember"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="pg-gradient-btn rounded-lg px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy ? "Adding…" : "Add expense"}
      </button>
    </form>
  );
}
