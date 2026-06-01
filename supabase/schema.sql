create table if not exists public.profiles (
  id text primary key,
  full_name text,
  email text not null,
  avatar_url text,
  role text not null default 'Employee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id text primary key,
  name text not null,
  domain text not null default '',
  created_by text not null default '',
  owner text not null default '',
  created_at_label text not null default '',
  employees integer,
  linkedin text not null default '',
  color text not null default 'bg-blue-600',
  icon text not null default 'C',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;

drop policy if exists "Profiles are readable by signed-in users" on public.profiles;
create policy "Profiles are readable by signed-in users"
on public.profiles for select
using (auth.jwt()->>'sub' is not null);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (id = auth.jwt()->>'sub');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (id = auth.jwt()->>'sub')
with check (id = auth.jwt()->>'sub');

drop policy if exists "Companies are readable by signed-in users" on public.companies;
create policy "Companies are readable by signed-in users"
on public.companies for select
using (auth.jwt()->>'sub' is not null);

drop policy if exists "Companies are insertable by signed-in users" on public.companies;
create policy "Companies are insertable by signed-in users"
on public.companies for insert
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "Companies are updatable by signed-in users" on public.companies;
create policy "Companies are updatable by signed-in users"
on public.companies for update
using (auth.jwt()->>'sub' is not null)
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "Companies are deletable by managers" on public.companies;
create policy "Companies are deletable by managers"
on public.companies for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.jwt()->>'sub'
      and profiles.role in ('Owner', 'Admin', 'Manager')
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();
