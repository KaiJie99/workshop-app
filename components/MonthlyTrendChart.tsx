"use client";

import type { Expense, Income } from "./PocketGoalsClient";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

/** Returns a "YYYY-MM" key from a date string. */
function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export default function MonthlyTrendChart({
  expenses,
  incomes,
  currency,
}: {
  expenses: Expense[];
  incomes: Income[];
  currency: string;
}) {
  // Collect totals per month for both series.
  const incomeByMonth: Record<string, number> = {};
  const expenseByMonth: Record<string, number> = {};

  incomes.forEach((i) => {
    const k = monthKey(i.received_on);
    incomeByMonth[k] = (incomeByMonth[k] ?? 0) + Number(i.amount);
  });
  expenses.forEach((e) => {
    const k = monthKey(e.spent_on);
    expenseByMonth[k] = (expenseByMonth[k] ?? 0) + Number(e.amount);
  });

  // Last 6 months that have any data.
  const months = Array.from(
    new Set([...Object.keys(incomeByMonth), ...Object.keys(expenseByMonth)]),
  )
    .sort()
    .slice(-6);

  if (months.length === 0) return null;

  const max = Math.max(
    1,
    ...months.map((m) => Math.max(incomeByMonth[m] ?? 0, expenseByMonth[m] ?? 0)),
  );

  return (
    <div className="pg-card rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span className="text-xl">📈</span> Monthly trend
      </h2>
      <div className="mt-6 flex items-end justify-between gap-3" style={{ height: 160 }}>
        {months.map((m) => {
          const inc = incomeByMonth[m] ?? 0;
          const exp = expenseByMonth[m] ?? 0;
          return (
            <div key={m} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-full w-full items-end justify-center gap-1">
                <div
                  className="w-3 rounded-t bg-emerald-500 transition-all sm:w-4"
                  style={{ height: `${(inc / max) * 100}%` }}
                  title={`Income: ${formatMoney(inc, currency)}`}
                />
                <div
                  className="w-3 rounded-t bg-red-400 transition-all sm:w-4"
                  style={{ height: `${(exp / max) * 100}%` }}
                  title={`Expenses: ${formatMoney(exp, currency)}`}
                />
              </div>
              <span className="text-[10px] text-gray-500">{monthLabel(m)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" /> Income
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-400" /> Expenses
        </span>
      </div>
    </div>
  );
}
