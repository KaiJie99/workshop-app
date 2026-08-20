"use client";

import type { Expense } from "./PocketGoalsClient";

const PALETTE = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
];

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

export default function CategoryChart({
  expenses,
  currency,
}: {
  expenses: Expense[];
  currency: string;
}) {
  // Group expense totals by category.
  const totals = expenses.reduce<Record<string, number>>((acc, e) => {
    const key = e.category?.trim() || "Uncategorised";
    acc[key] = (acc[key] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  const rows = Object.entries(totals)
    .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.value - a.value);

  const grandTotal = rows.reduce((sum, r) => sum + r.value, 0);

  if (rows.length === 0) {
    return null;
  }

  // Build conic-gradient stops for the pie (no mutation — compute cumulative
  // offsets functionally so it stays pure during render).
  const cumulative = rows.reduce<number[]>(
    (arr, r) => [...arr, (arr[arr.length - 1] ?? 0) + r.value],
    [],
  );
  const stops = rows
    .map((r, i) => {
      const start = ((cumulative[i] - r.value) / grandTotal) * 100;
      const end = (cumulative[i] / grandTotal) * 100;
      return `${r.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="pg-card rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span className="text-xl">🏷️</span> Spending by category
      </h2>
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <div
          className="h-32 w-32 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label="Spending by category pie chart"
        />
        <ul className="w-full max-w-xs space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: r.color }}
              />
              <span className="flex-1 truncate text-gray-700">{r.label}</span>
              <span className="font-medium text-gray-800">
                {formatMoney(r.value, currency)}
              </span>
              <span className="w-10 text-right text-xs text-gray-400">
                {Math.round((r.value / grandTotal) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
