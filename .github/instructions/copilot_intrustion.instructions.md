---
applyTo: '**'
---

# PocketGoals — From Junior to Senior

> A guided tour of a **real, production-shaped** Next.js + Supabase app.
> Read top to bottom. Each level builds on the one before it. By the end you
> should be able to explain *every* file, extend a feature safely, and ship it.

This file is also the **AI context guide**: it tells GitHub Copilot how this
project is structured and the conventions to follow when generating or
reviewing code. Keep it up to date when the architecture changes.

---

## 0. What is this app?

**PocketGoals** — *"Private expense notes. Clearer saving goals."*

A personal-finance tracker where a signed-in user can:

- Record **income** and **expenses** (private to them).
- Create **saving goals** (e.g. "Travel", target MYR 10,000).
- Link income to a goal so its progress bar fills up.
- See an **Overview** (Income / Expenses / Savings), charts and CSV export.

The core financial rule:

```
Savings = Income − Expenses
Goal progress = (income linked to that goal) × (Savings ÷ Income)
```

Expenses are *global* (not tied to one goal), so we spread them across goals in
proportion to the income allocated to each. That keeps the sum of every goal's
progress equal to real total savings.

---

## 1. Tech stack (the "what runs this")

| Layer            | Choice                        | Why it matters |
| ---------------- | ----------------------------- | -------------- |
| Framework        | **Next.js 16** (App Router)   | Server + client components, routing, API routes |
| Language         | **TypeScript 5**              | Types catch bugs before runtime |
| UI               | **React 19**                  | Component model |
| Styling          | **Tailwind CSS 4**            | Utility classes, no CSS files to hunt through |
| Backend / DB     | **Supabase** (Postgres + Auth)| Database, auth, and Row Level Security |
| Bundler          | **Turbopack**                 | Fast dev server |
| Hosting          | **Vercel**                    | Git push → deploy |
| Runtime          | **Node 22.x** (`engines`)     | Match this locally to avoid surprises |

---

## 2. Project map (learn the folders)

```
app/                  ← Pages & routes (App Router). Folder = URL.
  page.tsx            ← Homepage  ("/")
  layout.tsx          ← Wraps every page (fonts, <html>, global CSS)
  globals.css         ← Tailwind + custom .pg-* helper classes
  login/page.tsx      ← "/login"
  signup/page.tsx     ← "/signup"
  auth/confirm/route.ts ← Email-confirmation callback (API route)
  app/page.tsx        ← "/app" the signed-in dashboard (server component)

components/           ← Reusable UI (client components)
  PocketGoalsClient.tsx  ← The dashboard "brain": state + data + handlers
  GoalForm / GoalCard    ← Create & display saving goals
  ExpenseForm / ExpenseCard
  IncomeForm / IncomeCard
  OverviewChart / CategoryChart / MonthlyTrendChart
  BrandHeader / LoginForm / SignupForm / BackendNotConnected

lib/
  config/brand.ts     ← One place to change name, color, logo, tagline
  supabase/client.ts  ← Browser Supabase client
  supabase/server.ts  ← Server Supabase client (reads cookies)

supabase/
  pocketgoals-schema.sql ← The database: tables, RLS policies, triggers

proxy.ts              ← Auth gate for /app + no-cache headers (middleware)
public/               ← Static files (logo.svg, hero illustration)
```

**Rule of thumb:** logic and data live in `PocketGoalsClient.tsx`; the
`*Form`/`*Card` components are "dumb" — they only render and call callbacks.

---

## 3. JUNIOR — Run it and read it

### 3.1 Get it running
```bash
nvm use            # picks Node 22 from .nvmrc
npm install
cp .env.example .env.local   # then paste your Supabase URL + key
npm run dev        # http://localhost:3000
```

### 3.2 The mental model of a request
1. Browser asks for `/app`.
2. **`proxy.ts`** runs first: is there a valid Supabase session? If not →
   redirect to `/login`. It also sets `Cache-Control: no-store`.
3. **`app/app/page.tsx`** (a *server* component) double-checks auth with
   `getUser()` and renders `<PocketGoalsClient>`.
4. **`PocketGoalsClient`** (a *client* component, note `"use client"`) loads
   goals/expenses/income from Supabase and renders the forms and cards.

### 3.3 Server vs Client components (the #1 thing juniors miss)
- **Server component** (default): runs on the server, can read cookies/secrets,
  *cannot* use `useState`/`onClick`.
- **Client component**: has `"use client"` at the top, runs in the browser,
  can hold state and handle events.
- We keep secrets and the first auth check on the server; interactivity on the
  client.

### 3.4 Your first change
Open `lib/config/brand.ts`, change `primaryColor` or `name`, save, and watch
the whole app update. Nothing here touches the database — a safe first edit.

---

## 4. MID — Understand the data flow

### 4.1 Reading data (in `PocketGoalsClient.tsx`)
```ts
const { data } = await supabase
  .from("incomes")
  .select("id, goal_id, title, amount, ...")
  .order("created_at", { ascending: false });
```
Only pull the columns you use. Results go into React state (`setIncomes`).

### 4.2 The CRUD pattern (every entity follows it)
For each of goals / expenses / income there are four handlers:
`handleCreateX`, `handleUpdateX`, `handleDeleteX`, and a shared `loadAll()`
that re-fetches after any write. A handler returns a **friendly error string
or `null`**; the form shows the string if present. Example:
```ts
async function handleCreateIncome(title, amount, source, note, goalId, receivedOn) {
  if (!supabase) return "Backend not connected.";
  const { error } = await supabase.from("incomes").insert({ user_id: userId, goal_id: goalId, ... });
  if (error) return "Couldn't save that income. Please try again.";
  await loadAll();
  return null;
}
```

### 4.3 Derived values, not duplicated state
Totals and per-goal progress are **computed** from state on every render — we
never store them separately (which could drift out of sync):
```ts
const totalIncome  = incomes.reduce((s, i) => s + Number(i.amount), 0);
const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
const savedByGoal  = incomes.reduce((acc, i) => {
  if (i.goal_id) acc[i.goal_id] = (acc[i.goal_id] ?? 0) + Number(i.amount) * savingsRatio;
  return acc;
}, {});
```

### 4.4 Forms & validation
Each form validates input (e.g. `validateIncome`) before calling its
`onSubmit`. Validation lives *next to* the form and is exported so the matching
Card can reuse it in edit mode. Keep the callback **signatures in sync** across
Form → Card → `PocketGoalsClient` — a change in one means changing all three.

---

## 5. SENIOR — Security, correctness, conventions

### 5.1 Row Level Security (RLS) is the real guard
Never trust the client. `supabase/pocketgoals-schema.sql` enables RLS and adds
four policies per table so a user can only read/write **their own** rows:
```sql
create policy incomes_select_own on public.incomes
  for select using (auth.uid() = user_id);
```
Even a hacked frontend or a raw API call cannot cross users. The UI filtering is
convenience; the database is the enforcement.

### 5.2 The schema is idempotent
Every statement is guarded (`create table if not exists`, `add column if not
exists`, policy existence checks). It is **safe to re-run** and contains **no
destructive** statements. When you add a column, add it both as a normal column
*and* via `alter table ... add column if not exists` so existing databases
upgrade cleanly. **After editing the schema, re-run it in the Supabase SQL
editor** — the app won't create columns for you.

### 5.3 Auth hardening (already in place)
- `proxy.ts` redirects signed-out users away from `/app`.
- `/app` page also verifies `getUser()` server-side (defense in depth).
- `Cache-Control: no-store` stops the Back button from showing a protected page
  after sign-out (the browser bfcache trap).

### 5.4 Lint rules we must satisfy
The React compiler lint is strict. Common gotchas:
- **Purity:** don't call `Date.now()`/`Math.random()` during render — read the
  clock once in `useEffect`.
- **Immutability:** don't mutate props/state; use functional `reduce`/`map`,
  not `acc += ...` on external objects.
- **No setState in render/effect loops.**
Run `npx eslint components app --quiet` — it must pass with zero warnings.

### 5.5 Escaping & safety
User text is rendered as plain React children (auto-escaped) — never via
`dangerouslySetInnerHTML`. Money is formatted with `Intl.NumberFormat`.

---

## 6. PRODUCTION — Ship it

### 6.1 The pre-flight checklist (run before every push)
```bash
npx tsc --noEmit          # types must pass  → TYPECHECK_OK
npx eslint components app  # lint must pass    → LINT_OK
npm run build             # production build must succeed
```
If all three are green, you're safe to deploy.

### 6.2 Environment variables
| Variable | Where | Notes |
| -------- | ----- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Public, safe in browser |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` + Vercel | Public "anon" key; RLS protects data |
- `.env.local` is git-ignored. **Never commit secrets.**
- Anything `NEXT_PUBLIC_*` is shipped to the browser — only put safe values there.
- Set the same vars in **Vercel → Project → Settings → Environment Variables**.

### 6.3 Deploy flow
1. Push to your branch → open a PR → review the diff.
2. Merge to `main`.
3. Vercel auto-builds and deploys. A failed `next build` blocks the deploy.
4. Verify the live site (sign up, add income, check the Overview totals).

### 6.4 Git hygiene
- Small, focused commits with clear messages ("feat: link income to goals").
- Never commit `.env.local`, tokens, or keys. If a token leaks, **revoke it**.
- Keep `main` deployable at all times.

---

## 7. Guided exercises (do these in order)

1. **Junior:** Change the accent color and app name in `brand.ts`.
2. **Junior:** Add a new expense in the running app; watch the Overview update.
3. **Mid:** Add a `currency` selector to `IncomeForm` (thread it through the
   Form → handler → `insert`). Remember to keep signatures in sync.
4. **Mid:** Add a "This month" filter to the expenses list (derive it, don't
   store it).
5. **Senior:** Add a new `tags` column to `incomes` — update the schema
   (guarded), re-run it, extend the type, the select, the form, and the card.
6. **Senior:** Write the RLS policy for the new feature and explain why the UI
   filter alone is not enough.
7. **Production:** Run the pre-flight checklist and open a PR.

---

## 8. Conventions for Copilot (and humans)

- **Keep logic in `PocketGoalsClient.tsx`; keep `*Form`/`*Card` presentational.**
- **Handlers return `string | null`** (friendly error or success).
- **Derive, don't duplicate** — compute totals/progress from state.
- **Only select the columns you use.**
- **Every DB access must respect RLS** (`user_id` on insert; policies on the table).
- **Schema edits must be idempotent** and re-run in Supabase.
- **Match Node 22** locally (`.nvmrc`).
- **Green before push:** `tsc --noEmit`, `eslint`, `next build`.
- **User-configurable branding lives in `lib/config/brand.ts`.**
- **Never commit secrets;** public config uses the `NEXT_PUBLIC_` prefix.