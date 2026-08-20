"use client";

import { useState } from "react";

export const NAME_MAX = 120;
export const NOTES_MAX = 2000;

/** Returns a friendly error message, or null when the input is valid. */
export function validateGoal(
  name: string,
  amountRaw: string,
  notes: string,
): string | null {
  if (name.trim().length === 0) return "Please give your goal a name.";
  if (name.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
  const amount = Number(amountRaw);
  if (amountRaw.trim().length === 0 || Number.isNaN(amount))
    return "Please enter a target amount.";
  if (amount < 0) return "Target amount can't be negative.";
  if (notes.length > NOTES_MAX) return `Keep the notes under ${NOTES_MAX} characters.`;
  return null;
}

export default function GoalForm({
  onSubmit,
}: {
  onSubmit: (
    name: string,
    targetAmount: number,
    targetDate: string,
    notes: string,
  ) => Promise<string | null>;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateGoal(name, amount, notes);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const submitError = await onSubmit(
      name.trim(),
      Number(amount),
      targetDate,
      notes.trim(),
    );
    setBusy(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setName("");
    setAmount("");
    setTargetDate("");
    setNotes("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="pg-card space-y-3 rounded-2xl p-5"
    >
      <div>
        <label htmlFor="goal-name" className="block text-sm font-medium">
          Goal name
        </label>
        <input
          id="goal-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. New laptop"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="goal-amount" className="block text-sm font-medium">
          Target amount
        </label>
        <input
          id="goal-amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 3000"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="goal-date" className="block text-sm font-medium">
          Target date <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="goal-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="goal-notes" className="block text-sm font-medium">
          Notes <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="goal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
        {busy ? "Adding…" : "Add goal"}
      </button>
    </form>
  );
}
