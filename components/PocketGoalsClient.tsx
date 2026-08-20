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

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  goal_id: string | null;
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

  const loadAll = useCallback(async () => {
    if (!supabase) return;
    const [goalsRes, expensesRes, incomesRes] = await Promise.all([
      supabase
        .from("goals")
        .select("id, name, target_amount, currency, notes, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("expenses")
        .select(
          "id, goal_id, title, amount, currency, category, note, spent_on, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("incomes")
        .select("id, title, amount, currency, source, note, received_on, created_at")
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
    notes: string,
  ) {
    if (!supabase) return "Backend not connected.";
    // user_id comes from the server-verified session — NEVER from the form.
    const { error } = await supabase.from("goals").insert({
      user_id: userId,
      name,
      target_amount: targetAmount,
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
    notes: string,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("goals")
      .update({ name, target_amount: targetAmount, notes: notes || null })
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
    goalId: string | null,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      goal_id: goalId,
      title,
      amount,
      category: category || null,
      note: note || null,
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
    goalId: string | null,
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("expenses")
      .update({
        title,
        amount,
        category: category || null,
        note: note || null,
        goal_id: goalId,
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
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase.from("incomes").insert({
      user_id: userId,
      title,
      amount,
      source: source || null,
      note: note || null,
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
  ) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("incomes")
      .update({ title, amount, source: source || null, note: note || null })
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

  // Sum of expenses linked to each goal, for progress display.
  const savedByGoal = expenses.reduce<Record<string, number>>((acc, e) => {
    if (e.goal_id) acc[e.goal_id] = (acc[e.goal_id] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  // Overview totals for the chart.
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const overviewCurrency =
    incomes[0]?.currency ?? expenses[0]?.currency ?? goals[0]?.currency ?? "MYR";

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: brand.primaryColor }}
          >
            <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
            {brand.name}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

        {/* ── Overview chart ───────────────────────────── */}
        {!loading && (
          <section className="mb-12">
            <OverviewChart
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              currency={overviewCurrency}
            />
          </section>
        )}

        {/* ── Saving goals ─────────────────────────────── */}
        <section>
          <h1 className="text-2xl font-bold">Saving goals</h1>
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
          <h2 className="text-2xl font-bold">Expense notes</h2>
          <div className="mt-6">
            <ExpenseForm goals={goals} onSubmit={handleCreateExpense} />
          </div>
          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : expenses.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No expenses yet — add your first.
              </p>
            ) : (
              expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  goals={goals}
                  onUpdate={handleUpdateExpense}
                  onDelete={handleDeleteExpense}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Income notes ─────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Income notes</h2>
          <div className="mt-6">
            <IncomeForm onSubmit={handleCreateIncome} />
          </div>
          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : incomes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No income yet — add your first.
              </p>
            ) : (
              incomes.map((income) => (
                <IncomeCard
                  key={income.id}
                  income={income}
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
