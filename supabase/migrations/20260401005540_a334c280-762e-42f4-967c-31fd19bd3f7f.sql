
-- Create role enum
create type public.app_role as enum ('super_admin', 'admin', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer function to check roles (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Function to get current user's role
create or replace function public.get_my_role()
returns text language sql stable security definer set search_path = public
as $$
  select role::text from public.user_roles where user_id = auth.uid() limit 1
$$;

-- user_roles RLS policies
create policy "Users can view own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'admin'));

create policy "Super admins can insert roles" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can update roles" on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can delete roles" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar_url text,
  plan text not null default 'free',
  status text not null default 'active',
  last_active timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'admin'));

create policy "Users can insert own profile" on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "Users can update own profile" on public.profiles for update to authenticated
  using (id = auth.uid());

create policy "Admins can update any profile" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete profiles" on public.profiles for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
