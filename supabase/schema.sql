-- Project Looper MVP live schema for Supabase

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  name text not null default '',
  bio text not null default '',
  profile_photo text not null default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  skills_needed text[] not null default '{}',
  category text not null default 'general' check (category in ('design', 'dev', 'writing', 'general')),
  category_label text not null default 'General',
  category_icon text not null default 'general',
  team_size_mode text not null default 'fixed' check (team_size_mode in ('fixed', 'unlimited')),
  team_size_value integer check (team_size_value is null or team_size_value > 0),
  duration_type text not null default 'fixed' check (duration_type in ('fixed', 'open')),
  duration_value text,
  repository_url text not null default '',
  project_url text not null default '',
  cover_image text not null default '',
  is_demo_project boolean not null default false,
  status text not null default 'open' check (status in ('open', 'active', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  constraint fixed_projects_require_team_size
    check (team_size_mode = 'unlimited' or team_size_value is not null),
  constraint fixed_projects_require_duration
    check (duration_type = 'open' or coalesce(duration_value, '') <> '')
);

alter table public.projects add column if not exists is_demo_project boolean not null default false;

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'Member',
  status text not null default 'accepted' check (status in ('accepted', 'pending', 'declined')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique (project_id, user_id)
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_key text not null check (community_key in ('design', 'dev', 'writing', 'general')),
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  unique (community_key, user_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  community_key text not null check (community_key in ('design', 'dev', 'writing', 'general')),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_owner_id_idx on public.projects (owner_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_category_idx on public.projects (category);
create index if not exists project_members_project_id_idx on public.project_members (project_id);
create index if not exists project_members_user_id_idx on public.project_members (user_id);
create index if not exists project_updates_project_id_idx on public.project_updates (project_id);
create index if not exists project_chat_messages_project_id_idx on public.project_chat_messages (project_id);
create index if not exists community_members_community_key_idx on public.community_members (community_key);
create index if not exists community_posts_community_key_idx on public.community_posts (community_key);

do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.project_chat_messages';
  exception
    when duplicate_object then null;
  end;

  begin
    execute 'alter publication supabase_realtime add table public.community_posts';
  exception
    when duplicate_object then null;
  end;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_chat_messages enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "projects are readable by everyone" on public.projects;
create policy "projects are readable by everyone"
on public.projects
for select
using (true);

drop policy if exists "authenticated users can create projects" on public.projects;
create policy "authenticated users can create projects"
on public.projects
for insert
with check (auth.uid() = owner_id);

drop policy if exists "owners can update their own projects" on public.projects;
create policy "owners can update their own projects"
on public.projects
for update
using (auth.uid() = owner_id);

drop policy if exists "memberships are readable by everyone" on public.project_members;
create policy "memberships are readable by everyone"
on public.project_members
for select
using (true);

drop policy if exists "users can join projects as themselves" on public.project_members;
create policy "users can join projects as themselves"
on public.project_members
for insert
with check (
  auth.uid() = user_id
  and status = 'accepted'
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.owner_id <> auth.uid()
      and (
        p.team_size_mode = 'unlimited'
        or (
          select count(*)
          from public.project_members pm
          where pm.project_id = p.id
            and pm.status = 'accepted'
        ) < coalesce(p.team_size_value, 0)
      )
  )
);

drop policy if exists "owners can add memberships" on public.project_members;
create policy "owners can add memberships"
on public.project_members
for insert
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "project updates are readable by everyone" on public.project_updates;
create policy "project updates are readable by everyone"
on public.project_updates
for select
using (true);

drop policy if exists "accepted members can post updates" on public.project_updates;
create policy "accepted members can post updates"
on public.project_updates
for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.status = 'accepted'
  )
);

drop policy if exists "project chat is readable by project members" on public.project_chat_messages;
create policy "project chat is readable by project members"
on public.project_chat_messages
for select
using (
  exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.status = 'accepted'
  )
);

drop policy if exists "project chat can be posted by project members" on public.project_chat_messages;
create policy "project chat can be posted by project members"
on public.project_chat_messages
for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.project_members pm
    where pm.project_id = project_id
      and pm.user_id = auth.uid()
      and pm.status = 'accepted'
  )
);

drop policy if exists "community memberships are readable by everyone" on public.community_members;
create policy "community memberships are readable by everyone"
on public.community_members
for select
using (true);

drop policy if exists "users can join communities as themselves" on public.community_members;
create policy "users can join communities as themselves"
on public.community_members
for insert
with check (auth.uid() = user_id);

drop policy if exists "community posts are readable by everyone" on public.community_posts;
create policy "community posts are readable by everyone"
on public.community_posts
for select
using (true);

drop policy if exists "community members can post to joined communities" on public.community_posts;
create policy "community members can post to joined communities"
on public.community_posts
for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.community_members cm
    where cm.community_key = community_key
      and cm.user_id = auth.uid()
  )
);
