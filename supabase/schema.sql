-- Run this in Supabase: SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists public.souls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reacher_id text not null,
  saved boolean not null default false,
  filled boolean not null default false,
  healed boolean not null default false,
  notes text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists souls_reacher_id_idx on public.souls (reacher_id);
create index if not exists souls_date_idx on public.souls (date desc);
create index if not exists souls_created_at_idx on public.souls (created_at desc);

alter table public.souls enable row level security;

-- Shared team app (no login yet): allow read/write with the anon key.
-- Tighten this later when you add auth.
drop policy if exists "Allow anon read souls" on public.souls;
drop policy if exists "Allow anon insert souls" on public.souls;
drop policy if exists "Allow anon update souls" on public.souls;
drop policy if exists "Allow anon delete souls" on public.souls;

create policy "Allow anon read souls"
  on public.souls for select
  to anon, authenticated
  using (true);

create policy "Allow anon insert souls"
  on public.souls for insert
  to anon, authenticated
  with check (true);

create policy "Allow anon update souls"
  on public.souls for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow anon delete souls"
  on public.souls for delete
  to anon, authenticated
  using (true);

-- Live sync across phones/browsers
alter publication supabase_realtime add table public.souls;

-- Profiles (addable reachers) + healed column for existing DBs
alter table public.souls
  add column if not exists healed boolean not null default false;

create table if not exists public.profiles (
  id text primary key,
  name text not null,
  initials text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Allow anon read profiles" on public.profiles;
drop policy if exists "Allow anon insert profiles" on public.profiles;
drop policy if exists "Allow anon update profiles" on public.profiles;
drop policy if exists "Allow anon delete profiles" on public.profiles;

create policy "Allow anon read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Allow anon insert profiles"
  on public.profiles for insert
  to anon, authenticated
  with check (true);

create policy "Allow anon update profiles"
  on public.profiles for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow anon delete profiles"
  on public.profiles for delete
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.profiles;
