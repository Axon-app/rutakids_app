-- Ejecuta este script en Supabase SQL Editor

create table if not exists public.rutakids_data (
	user_id uuid primary key references auth.users(id) on delete cascade,
	payload jsonb not null default '{}'::jsonb,
	updated_at timestamptz not null default now()
);

alter table public.rutakids_data enable row level security;

drop policy if exists "Users can read own rutakids data" on public.rutakids_data;
create policy "Users can read own rutakids data"
on public.rutakids_data
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own rutakids data" on public.rutakids_data;
create policy "Users can insert own rutakids data"
on public.rutakids_data
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own rutakids data" on public.rutakids_data;
create policy "Users can update own rutakids data"
on public.rutakids_data
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
