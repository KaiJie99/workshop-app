"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import GoalForm from "./GoalForm";
import GoalCard from "./GoalCard";
import ExpenseForm from "./ExpenseForm";
import ExpenseCard from "./ExpenseCard";
import IncomeForm from "./IncomeForm";
import IncomeCard from "./IncomeCard";
import OverviewChart from "./OverviewChart";
import CategoryChart from "./CategoryChart";
import MonthlyTrendChart from "./MonthlyTrendChart";

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string | null;
  note: string | null;
  spent_on: string;
  created_at: string;
};

export type Income = {
  id: string;
  goal_id: string | null;
  title: string;
  amount: number;
  currency: string;
  source: string | null;
  note: string | null;
  received_on: string;
  created_at: string;
};

export default function PocketGoalsClient({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search / filter / sort controls.
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseSort, setExpenseSort] = useState("newest");
  const [incomeSearch, setIncomeSearch] = useState("");
  const [incomeSort, setIncomeSort] = useState("newest");

  const loadAll = useCallback(async () => {
    if (!supabase) return;
    const [goalsRes, expensesRes, incomesRes] = await Promise.all([
      supabase
        .from("goals")
        .select("id, name, target_amount, target_date, currency, notes, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("expenses")
        .select(
          "id, title, amount, currency, category, note, spent_on, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("incomes")
        .select(
          "id, goal_id, title, amount, currency, source, note, received_on, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);
    if (goalsRes.error || expensesRes.error || incomesRes.error) {
      setError("Couldn't load your data. Refresh the page to try again.");
    } else {
      setGoals(goalsRes.data ?? []);
      setExpenses(expensesRes.data ?? []);
      setIncomes(incomesRes.data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    void loadAll();
  }, [loadAll]);

  // ── Goals ────────────────────────────────────────────────
  async function handleCreateGoal(
    name: string,
    targetAmount: number,
    targetDate: string,
    notes: string,
  ) {
    if (!supabase) return "Backend not connected.";
    // user_id comes from the server-verified session — NEVER from the form.
    const { error } = await supabase.from("goals").insert({
      user_id: userId,
      name,
      target_amount: targetAmount,
      target_date: targetDate || null,
      notes: notes || null,
    });
    if (error) return "Couldn't save that goal. Please try again.";
    await loadAll();
    return null;
  }

  async function handleUpdateGoal(
    id: string,
    name: string,
    targetAmount: number,
    targetDate: string,
    notes: string,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("goals")
      .update({
        name,
        target_amount: targetAmount,
        target_date: targetDate || null,
        notes: notes || null,
      })
      .eq("id", id);
    if (error) return "Couldn't update that goal. Please try again.";
    await loadAll();
    return null;
  }

  async function handleDeleteGoal(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete that goal. Please try again.");
      return;
    }
    setError(null);
    await loadAll();
  }

  // ── Expenses ─────────────────────────────────────────────
  async function handleCreateExpense(
    title: string,
    amount: number,
    category: string,
    note: string,
    spentOn: string,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      title,
      amount,
      category: category || null,
      note: note || null,
      spent_on: spentOn || undefined,
    });
    if (error) return "Couldn't save that expense. Please try again.";
    await loadAll();
    return null;
  }

  async function handleUpdateExpense(
    id: string,
    title: string,
    amount: number,
    category: string,
    note: string,
    spentOn: string,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("expenses")
      .update({
        title,
        amount,
        category: category || null,
        note: note || null,
        spent_on: spentOn || undefined,
      })
      .eq("id", id);
    if (error) return "Couldn't update that expense. Please try again.";
    await loadAll();
    return null;
  }

  async function handleDeleteExpense(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete that expense. Please try again.");
      return;
    }
    setError(null);
    await loadAll();
  }

  // ── Income ───────────────────────────────────────────────
  async function handleCreateIncome(
    title: string,
    amount: number,
    source: string,
    note: string,
    goalId: string | null,
    receivedOn: string,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase.from("incomes").insert({
      user_id: userId,
      goal_id: goalId,
      title,
      amount,
      source: source || null,
      note: note || null,
      received_on: receivedOn || undefined,
    });
    if (error) return "Couldn't save that income. Please try again.";
    await loadAll();
    return null;
  }

  async function handleUpdateIncome(
    id: string,
    title: string,
    amount: number,
    source: string,
    note: string,
    goalId: string | null,
    receivedOn: string,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("incomes")
      .update({
        title,
        amount,
        source: source || null,
        note: note || null,
        goal_id: goalId,
        received_on: receivedOn || undefined,
      })
      .eq("id", id);
    if (error) return "Couldn't update that income. Please try again.";
    await loadAll();
    return null;
  }

  async function handleDeleteIncome(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("incomes").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete that income. Please try again.");
      return;
    }
    setError(null);
    await loadAll();
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Overview totals for the chart.
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Progress toward each goal = income linked to it, minus its fair share of
  // expenses. Expenses aren't linked to a goal, so we spread them across goals
  // in proportion to the income allocated to each. This keeps the sum of goal
  // progress equal to real savings (income − expenses).
  const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
  const savedByGoal = incomes.reduce<Record<string, number>>((acc, i) => {
    if (i.goal_id) {
      acc[i.goal_id] = (acc[i.goal_id] ?? 0) + Number(i.amount) * savingsRatio;
    }
    return acc;
  }, {});

  const overviewCurrency =
    incomes[0]?.currency ?? expenses[0]?.currency ?? goals[0]?.currency ?? "MYR";

  // Distinct categories for the filter dropdown.
  const categories = Array.from(
    new Set(expenses.map((e) => e.category?.trim()).filter(Boolean) as string[]),
  ).sort();

  // Apply search + category filter + sort to expenses.
  const visibleExpenses = expenses
    .filter((e) => {
      const q = expenseSearch.trim().toLowerCase();
      const matchesText =
        q === "" ||
        e.title.toLowerCase().includes(q) ||
        (e.note ?? "").toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q);
      const matchesCategory =
        expenseCategory === "" || (e.category ?? "") === expenseCategory;
      return matchesText && matchesCategory;
    })
    .sort((a, b) => {
      switch (expenseSort) {
        case "oldest":
          return a.spent_on.localeCompare(b.spent_on);
        case "highest":
          return Number(b.amount) - Number(a.amount);
        case "lowest":
          return Number(a.amount) - Number(b.amount);
        default: // newest
          return b.spent_on.localeCompare(a.spent_on);
      }
    });

  // Apply search + sort to income.
  const visibleIncomes = incomes
    .filter((i) => {
      const q = incomeSearch.trim().toLowerCase();
      return (
        q === "" ||
        i.title.toLowerCase().includes(q) ||
        (i.note ?? "").toLowerCase().includes(q) ||
        (i.source ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (incomeSort) {
        case "oldest":
          return a.received_on.localeCompare(b.received_on);
        case "highest":
          return Number(b.amount) - Number(a.amount);
        case "lowest":
          return Number(a.amount) - Number(b.amount);
        default:
          return b.received_on.localeCompare(a.received_on);
      }
    });

  // Export all data as a CSV file (client-side, no dependencies).
  function exportCsv() {
    const esc = (v: string | number | null) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines: string[] = ["type,title,amount,currency,category_or_source,date,note"];
    incomes.forEach((i) =>
      lines.push(
        [
          "income",
          esc(i.title),
          i.amount,
          i.currency,
          esc(i.source),
          i.received_on,
          esc(i.note),
        ].join(","),
      ),
    );
    expenses.forEach((e) =>
      lines.push(
        [
          "expense",
          esc(e.title),
          e.amount,
          e.currency,
          esc(e.category),
          e.spent_on,
          esc(e.note),
        ].join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pocketgoals-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pg-gradient-bg min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold"
            style={{ color: brand.primaryColor }}
          >
            <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
            {brand.name}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
            <button
              onClick={exportCsv}
              className="hidden rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-gray-700 transition hover:bg-white sm:inline-block"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-gray-700 transition hover:bg-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* ── Overview chart ───────────────────────────── */}
        {!loading && (
          <section className="mb-12 space-y-6 pg-fade-up">
            <OverviewChart
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              currency={overviewCurrency}
            />
            <MonthlyTrendChart
              expenses={expenses}
              incomes={incomes}
              currency={overviewCurrency}
            />
            <CategoryChart expenses={expenses} currency={overviewCurrency} />
          </section>
        )}

        {/* ── Saving goals ─────────────────────────────── */}
        <section>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">🎯</span> Saving goals
          </h1>
          <div className="mt-6">
            <GoalForm onSubmit={handleCreateGoal} />
          </div>
          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : goals.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No goals yet — add your first.
              </p>
            ) : (
              goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  saved={savedByGoal[goal.id] ?? 0}
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Expense notes ────────────────────────────── */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">💸</span> Expense notes
          </h2>
          <div className="mt-6">
            <ExpenseForm onSubmit={handleCreateExpense} />
          </div>
          {expenses.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <input
                type="search"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="🔍 Search expenses…"
                className="min-w-[8rem] flex-1 rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-sm focus:outline-2"
              />
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-sm focus:outline-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={expenseSort}
                onChange={(e) => setExpenseSort(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-sm focus:outline-2"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>
          )}
          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : expenses.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No expenses yet — add your first.
              </p>
            ) : visibleExpenses.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No expenses match your filters.
              </p>
            ) : (
              visibleExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onUpdate={handleUpdateExpense}
                  onDelete={handleDeleteExpense}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Income notes ─────────────────────────────── */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-2xl">💰</span> Income notes
          </h2>
          <div className="mt-6">
            <IncomeForm goals={goals} onSubmit={handleCreateIncome} />
          </div>
          {incomes.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <input
                type="search"
                value={incomeSearch}
                onChange={(e) => setIncomeSearch(e.target.value)}
                placeholder="🔍 Search income…"
                className="min-w-[8rem] flex-1 rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-sm focus:outline-2"
              />
              <select
                value={incomeSort}
                onChange={(e) => setIncomeSort(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white/70 px-3 py-1.5 text-sm focus:outline-2"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>
          )}
          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : incomes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No income yet — add your first.
              </p>
            ) : visibleIncomes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No income matches your search.
              </p>
            ) : (
              visibleIncomes.map((income) => (
                <IncomeCard
                  key={income.id}
                  income={income}
                  goals={goals}
                  onUpdate={handleUpdateIncome}
                  onDelete={handleDeleteIncome}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
