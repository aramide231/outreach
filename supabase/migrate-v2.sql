-- Run once in Supabase SQL Editor (after the first schema)

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
