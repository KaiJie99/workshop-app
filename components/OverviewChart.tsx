"use client";

import { brand } from "@/lib/config/brand";

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

type Slice = { label: string; value: number; color: string };

export default function OverviewChart({
  totalIncome,
  totalExpense,
  currency,
}: {
  totalIncome: number;
  totalExpense: number;
  currency: string;
}) {
  const balance = totalIncome - totalExpense;
  const max = Math.max(totalIncome, totalExpense, 1);

  const bars: Slice[] = [
    { label: "Income", value: totalIncome, color: "#059669" },
    { label: "Expenses", value: totalExpense, color: "#dc2626" },
  ];

  // Donut: income vs expense share of total activity.
  const total = totalIncome + totalExpense;
  const incomeShare = total > 0 ? totalIncome / total : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const incomeDash = incomeShare * circumference;

  return (
    <div className="pg-card rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span className="text-xl">📊</span> Overview
      </h2>

      {/* Summary numbers */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Income</p>
          <p className="mt-1 font-semibold text-emerald-700">
            {formatMoney(totalIncome, currency)}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-red-700">Expenses</p>
          <p className="mt-1 font-semibold text-red-700">
            {formatMoney(totalExpense, currency)}
          </p>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: `${brand.primaryColor}14` }}
        >
          <p className="text-xs" style={{ color: brand.primaryColor }}>
            Balance
          </p>
          <p
            className="mt-1 font-semibold"
            style={{ color: balance >= 0 ? brand.primaryColor : "#dc2626" }}
          >
            {formatMoney(balance, currency)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
        {/* Donut chart */}
        <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Income versus expenses">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#dc2626" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#059669"
            strokeWidth="14"
            strokeDasharray={`${incomeDash} ${circumference - incomeDash}`}
            strokeDashoffset={circumference / 4}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="56" textAnchor="middle" className="fill-gray-700" fontSize="11">
            Saved
          </text>
          <text x="60" y="72" textAnchor="middle" className="fill-gray-900" fontSize="13" fontWeight="700">
            {total > 0 ? `${Math.round(incomeShare * 100)}%` : "—"}
          </text>
        </svg>

        {/* Bar chart */}
        <div className="w-full max-w-xs space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{bar.label}</span>
                <span className="font-medium text-gray-800">
                  {formatMoney(bar.value, currency)}
                </span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(bar.value / max) * 100}%`, backgroundColor: bar.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
