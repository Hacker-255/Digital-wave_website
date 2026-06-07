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

create table if not exists public.crm_records (
  module text not null,
  record_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (module, record_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'Employee',
  token_hash text not null unique,
  invited_by text not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'Employee',
  clerk_invitation_id text,
  invited_by text not null,
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_meetings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  meeting_time timestamptz not null,
  reschedule_id text not null unique,
  reschedule_url text not null,
  reminder_60_sent boolean not null default false,
  reminder_30_sent boolean not null default false,
  reminder_15_sent boolean not null default false,
  title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid(),
  owner_id text not null default (auth.jwt()->>'sub'),
  name text not null,
  description text,
  trigger_type text,
  trigger_config jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  enabled boolean not null default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.crm_records enable row level security;
alter table public.invitations enable row level security;
alter table public.team_invites enable row level security;
alter table public.customer_meetings enable row level security;
alter table public.workflows enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.profiles to anon, authenticated;
grant select, insert, update, delete on table public.companies to anon, authenticated;
grant select, insert, update, delete on table public.crm_records to anon, authenticated;
grant select, insert, update, delete on table public.invitations to anon, authenticated;
grant select, insert, update, delete on table public.team_invites to authenticated;
grant select, insert, update, delete on table public.customer_meetings to authenticated;
grant select, insert, update, delete on table public.workflows to anon, authenticated;

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

drop policy if exists "CRM records are readable by signed-in users" on public.crm_records;
create policy "CRM records are readable by signed-in users"
on public.crm_records for select
using (auth.jwt()->>'sub' is not null);

drop policy if exists "CRM records are insertable by signed-in users" on public.crm_records;
create policy "CRM records are insertable by signed-in users"
on public.crm_records for insert
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "CRM records are updatable by signed-in users" on public.crm_records;
create policy "CRM records are updatable by signed-in users"
on public.crm_records for update
using (auth.jwt()->>'sub' is not null)
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "CRM records are deletable by signed-in users" on public.crm_records;
create policy "CRM records are deletable by signed-in users"
on public.crm_records for delete
using (auth.jwt()->>'sub' is not null);

drop policy if exists "Invitations are readable by signed-in users" on public.invitations;
create policy "Invitations are readable by signed-in users"
on public.invitations for select
using (auth.jwt()->>'sub' is not null);

drop policy if exists "Managers can create invitations" on public.invitations;
create policy "Managers can create invitations"
on public.invitations for insert
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.jwt()->>'sub'
      and profiles.role in ('Owner', 'Admin', 'Manager')
  )
);

drop policy if exists "Signed-in users can accept invitations" on public.invitations;
create policy "Signed-in users can accept invitations"
on public.invitations for update
using (auth.jwt()->>'sub' is not null)
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "Managers can read team invites" on public.team_invites;
create policy "Managers can read team invites"
on public.team_invites for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.jwt()->>'sub'
      and profiles.role in ('Owner', 'Admin', 'Manager')
  )
);

drop policy if exists "Managers can create team invites" on public.team_invites;
create policy "Managers can create team invites"
on public.team_invites for insert
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.jwt()->>'sub'
      and profiles.role in ('Owner', 'Admin', 'Manager')
  )
);

drop policy if exists "Managers can update team invites" on public.team_invites;
create policy "Managers can update team invites"
on public.team_invites for update
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.jwt()->>'sub'
      and profiles.role in ('Owner', 'Admin', 'Manager')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.jwt()->>'sub'
      and profiles.role in ('Owner', 'Admin', 'Manager')
  )
);

drop policy if exists "Signed-in users can read customer meetings" on public.customer_meetings;
create policy "Signed-in users can read customer meetings"
on public.customer_meetings for select
using (auth.jwt()->>'sub' is not null);

drop policy if exists "Signed-in users can create customer meetings" on public.customer_meetings;
create policy "Signed-in users can create customer meetings"
on public.customer_meetings for insert
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "Signed-in users can update customer meetings" on public.customer_meetings;
create policy "Signed-in users can update customer meetings"
on public.customer_meetings for update
using (auth.jwt()->>'sub' is not null)
with check (auth.jwt()->>'sub' is not null);

drop policy if exists "Users can read own workflows" on public.workflows;
create policy "Users can read own workflows"
on public.workflows for select
using (
  user_id = auth.uid()
  or owner_id = auth.jwt()->>'sub'
);

drop policy if exists "Users can create own workflows" on public.workflows;
create policy "Users can create own workflows"
on public.workflows for insert
with check (
  auth.jwt()->>'sub' is not null
  and (user_id is null or user_id = auth.uid())
  and owner_id = auth.jwt()->>'sub'
);

drop policy if exists "Users can update own workflows" on public.workflows;
create policy "Users can update own workflows"
on public.workflows for update
using (
  user_id = auth.uid()
  or owner_id = auth.jwt()->>'sub'
)
with check (
  user_id = auth.uid()
  or owner_id = auth.jwt()->>'sub'
);

drop policy if exists "Users can delete own workflows" on public.workflows;
create policy "Users can delete own workflows"
on public.workflows for delete
using (
  user_id = auth.uid()
  or owner_id = auth.jwt()->>'sub'
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

drop trigger if exists crm_records_set_updated_at on public.crm_records;
create trigger crm_records_set_updated_at
before update on public.crm_records
for each row execute function public.set_updated_at();

drop trigger if exists team_invites_set_updated_at on public.team_invites;
create trigger team_invites_set_updated_at
before update on public.team_invites
for each row execute function public.set_updated_at();

drop trigger if exists customer_meetings_set_updated_at on public.customer_meetings;
create trigger customer_meetings_set_updated_at
before update on public.customer_meetings
for each row execute function public.set_updated_at();

drop trigger if exists workflows_set_updated_at on public.workflows;
create trigger workflows_set_updated_at
before update on public.workflows
for each row execute function public.set_updated_at();
