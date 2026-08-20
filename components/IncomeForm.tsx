"use client";

import { useState } from "react";
import type { Goal } from "./PocketGoalsClient";

export const TITLE_MAX = 120;
export const SOURCE_MAX = 60;
export const NOTE_MAX = 2000;

/** Returns a friendly error message, or null when the input is valid. */
export function validateIncome(
  title: string,
  amountRaw: string,
  source: string,
  note: string,
): string | null {
  if (title.trim().length === 0) return "Please give your income a title.";
  if (title.length > TITLE_MAX) return `Keep the title under ${TITLE_MAX} characters.`;
  const amount = Number(amountRaw);
  if (amountRaw.trim().length === 0 || Number.isNaN(amount))
    return "Please enter an amount.";
  if (amount < 0) return "Amount can't be negative.";
  if (source.length > SOURCE_MAX)
    return `Keep the source under ${SOURCE_MAX} characters.`;
  if (note.length > NOTE_MAX) return `Keep the note under ${NOTE_MAX} characters.`;
  return null;
}

export default function IncomeForm({
  goals,
  onSubmit,
}: {
  goals: Goal[];
  onSubmit: (
    title: string,
    amount: number,
    source: string,
    note: string,
    goalId: string | null,
    receivedOn: string,
  ) => Promise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [goalId, setGoalId] = useState("");
  const [receivedOn, setReceivedOn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateIncome(title, amount, source, note);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const submitError = await onSubmit(
      title.trim(),
      Number(amount),
      source.trim(),
      note.trim(),
      goalId || null,
      receivedOn,
    );
    setBusy(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setTitle("");
    setAmount("");
    setSource("");
    setNote("");
    setGoalId("");
    setReceivedOn("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="pg-card space-y-3 rounded-2xl p-5"
    >
      <div>
        <label htmlFor="income-title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="income-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Monthly salary"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="income-amount" className="block text-sm font-medium">
          Amount
        </label>
        <input
          id="income-amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 3500"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="income-source" className="block text-sm font-medium">
          Source <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="income-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. Employer, Freelance"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="income-goal" className="block text-sm font-medium">
          Link to goal <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <select
          id="income-goal"
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
        <label htmlFor="income-date" className="block text-sm font-medium">
          Date <span className="font-normal text-gray-500">(optional, defaults to today)</span>
        </label>
        <input
          id="income-date"
          type="date"
          value={receivedOn}
          onChange={(e) => setReceivedOn(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="income-note" className="block text-sm font-medium">
          Note <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="income-note"
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
        {busy ? "Adding…" : "Add income"}
      </button>
    </form>
  );
}
