-- ════════════════════════════════════════════════════════════════
-- PocketGoals schema — "Private expense notes. Clearer saving goals."
-- Run this ONCE in your Supabase project's SQL editor.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO destructive statements (no drop / truncate / delete).
-- ════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1) SAVING GOALS — one row per goal, owned by exactly one user.
--    e.g. "New laptop", target 3000, saved so far 750.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  target_amount numeric(12, 2) not null check (target_amount >= 0),
  target_date   date,
  currency      text not null default 'MYR' check (char_length(currency) = 3),
  notes         text check (notes is null or char_length(notes) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Safe upgrade for existing databases: add the column if it's missing.
alter table public.goals add column if not exists target_date date;

-- Speeds up "list MY goals, newest first".
create index if not exists goals_user_created_idx
  on public.goals (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 2) EXPENSE NOTES — one row per expense entry, owned by one user.
--    Optionally linked to a goal (e.g. money set aside toward it).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  goal_id     uuid references public.goals (id) on delete set null,
  title       text not null check (char_length(title) between 1 and 120),
  amount      numeric(12, 2) not null check (amount >= 0),
  currency    text not null default 'MYR' check (char_length(currency) = 3),
  category    text check (category is null or char_length(category) <= 60),
  note        text check (note is null or char_length(note) <= 2000),
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Speeds up "list MY expenses, newest first" and "expenses for a goal".
create index if not exists expenses_user_created_idx
  on public.expenses (user_id, created_at desc);
create index if not exists expenses_goal_idx
  on public.expenses (goal_id);

-- ─────────────────────────────────────────────────────────────
-- 2b) INCOME NOTES — one row per income entry, owned by one user.
--     e.g. "Salary", "Freelance", "Gift".
-- ─────────────────────────────────────────────────────────────
create table if not exists public.incomes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  goal_id     uuid references public.goals (id) on delete set null,
  title       text not null check (char_length(title) between 1 and 120),
  amount      numeric(12, 2) not null check (amount >= 0),
  currency    text not null default 'MYR' check (char_length(currency) = 3),
  source      text check (source is null or char_length(source) <= 60),
  note        text check (note is null or char_length(note) <= 2000),
  received_on date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Safe upgrade for existing databases: link savings (income) to a goal.
alter table public.incomes add column if not exists goal_id uuid
  references public.goals (id) on delete set null;

-- Speeds up "list MY income, newest first" and "income for a goal".
create index if not exists incomes_user_created_idx
  on public.incomes (user_id, created_at desc);
create index if not exists incomes_goal_idx
  on public.incomes (goal_id);

-- ─────────────────────────────────────────────────────────────
-- 3) Row Level Security: the DATABASE enforces "you only touch
--    your own rows". Even a modified app or a direct API call
--    cannot cross users.
-- ─────────────────────────────────────────────────────────────
alter table public.goals    enable row level security;
alter table public.expenses enable row level security;
alter table public.incomes  enable row level security;

-- ─────────────────────────────────────────────────────────────
-- 4) Policies — read, create, edit, delete — each limited to the
--    owner. auth.uid() is the id of whoever is signed in right now.
-- ─────────────────────────────────────────────────────────────
do $$
begin
  -- ---- GOALS ----
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'goals'
                   and policyname = 'goals_select_own') then
    create policy goals_select_own on public.goals
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'goals'
                   and policyname = 'goals_insert_own') then
    create policy goals_insert_own on public.goals
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'goals'
                   and policyname = 'goals_update_own') then
    create policy goals_update_own on public.goals
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'goals'
                   and policyname = 'goals_delete_own') then
    create policy goals_delete_own on public.goals
      for delete using (auth.uid() = user_id);
  end if;

  -- ---- EXPENSES ----
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'expenses'
                   and policyname = 'expenses_select_own') then
    create policy expenses_select_own on public.expenses
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'expenses'
                   and policyname = 'expenses_insert_own') then
    create policy expenses_insert_own on public.expenses
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'expenses'
                   and policyname = 'expenses_update_own') then
    create policy expenses_update_own on public.expenses
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'expenses'
                   and policyname = 'expenses_delete_own') then
    create policy expenses_delete_own on public.expenses
      for delete using (auth.uid() = user_id);
  end if;

  -- ---- INCOMES ----
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'incomes'
                   and policyname = 'incomes_select_own') then
    create policy incomes_select_own on public.incomes
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'incomes'
                   and policyname = 'incomes_insert_own') then
    create policy incomes_insert_own on public.incomes
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'incomes'
                   and policyname = 'incomes_update_own') then
    create policy incomes_update_own on public.incomes
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'incomes'
                   and policyname = 'incomes_delete_own') then
    create policy incomes_delete_own on public.incomes
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 5) Keep updated_at fresh whenever a row is edited.
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create or replace trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

create or replace trigger incomes_set_updated_at
  before update on public.incomes
  for each row execute function public.set_updated_at();
