-- YUANCHUANG initial production schema (Supabase/PostgreSQL)
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '设计学习者',
 major text, school text, grade text, avatar_url text,
 career_goal text, bio text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.career_directions (
 id uuid primary key default gen_random_uuid(), name text not null, category text not null,
 description text, match_rate numeric(5,2) default 0, color text default '#8738f5',
 skills jsonb not null default '[]', created_at timestamptz not null default now()
);
create table if not exists public.learning_paths (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
 title text not null, target_role text, description text, status text not null default 'active',
 created_at timestamptz not null default now()
);
create table if not exists public.path_nodes (
 id uuid primary key default gen_random_uuid(), path_id uuid not null references public.learning_paths(id) on delete cascade,
 title text not null, category text, description text, sort_order int not null default 0,
 status text not null default 'todo', completed_at timestamptz
);
create table if not exists public.resources (
 id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete cascade,
 title text not null, resource_type text not null default 'article', url text, description text,
 tags text[] not null default '{}', visibility text not null default 'private',
 created_at timestamptz not null default now()
);
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete cascade,
 title text not null, description text, category text, status text not null default 'planning',
 start_date date, end_date date, cover_url text, created_at timestamptz not null default now()
);
create table if not exists public.learning_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, record_type text not null, minutes int default 0, note text,
 created_at timestamptz not null default now()
);
create table if not exists public.portfolio_items (
 id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete cascade,
 title text not null, cover_url text, description text, tags text[] not null default '{}',
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.learning_paths enable row level security;
alter table public.path_nodes enable row level security;
alter table public.resources enable row level security;
alter table public.projects enable row level security;
alter table public.learning_records enable row level security;
alter table public.portfolio_items enable row level security;
create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users manage own profile" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "users manage own paths" on public.learning_paths for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "users manage own path nodes" on public.path_nodes for all using (exists(select 1 from public.learning_paths p where p.id=path_id and p.user_id=auth.uid())) with check (exists(select 1 from public.learning_paths p where p.id=path_id and p.user_id=auth.uid()));
create policy "public resources readable" on public.resources for select using (visibility='public' or owner_id=auth.uid());
create policy "users manage own resources" on public.resources for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "users manage own projects" on public.projects for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "users manage own learning records" on public.learning_records for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "public portfolios readable" on public.portfolio_items for select using (true);
create policy "users manage own portfolio" on public.portfolio_items for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

-- Career direction catalogue is public; personal plans remain user-scoped.
alter table public.career_directions enable row level security;
drop policy if exists "career directions are publicly readable" on public.career_directions;
create policy "career directions are publicly readable"
  on public.career_directions for select using (true);

-- Add integrity constraints without changing existing user data.
alter table public.learning_paths
  add column if not exists target_date date,
  add column if not exists progress numeric(5,2) not null default 0;
alter table public.path_nodes
  add column if not exists estimated_minutes int not null default 60,
  add column if not exists resource_url text;


-- Knowledge graph catalogue and user-owned competency self-assessments.
create table if not exists public.knowledge_nodes (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 title text not null,
 category text not null,
 description text,
 difficulty smallint not null default 1 check (difficulty between 1 and 5),
 created_at timestamptz not null default now()
);
create table if not exists public.knowledge_edges (
 id uuid primary key default gen_random_uuid(),
 source_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
 target_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
 relation_type text not null default 'related',
 unique(source_node_id,target_node_id,relation_type),
 check(source_node_id <> target_node_id)
);
create table if not exists public.skill_assessments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 knowledge_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
 self_rating smallint not null check(self_rating between 1 and 5),
 note text,
 assessed_at timestamptz not null default now(),
 unique(user_id,knowledge_node_id)
);
alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;
alter table public.skill_assessments enable row level security;
drop policy if exists "knowledge nodes are readable" on public.knowledge_nodes;
create policy "knowledge nodes are readable" on public.knowledge_nodes for select using (true);
drop policy if exists "knowledge edges are readable" on public.knowledge_edges;
create policy "knowledge edges are readable" on public.knowledge_edges for select using (true);
drop policy if exists "users manage own skill assessments" on public.skill_assessments;
create policy "users manage own skill assessments" on public.skill_assessments for all
 using (auth.uid()=user_id) with check (auth.uid()=user_id);
create index if not exists idx_skill_assessments_user on public.skill_assessments(user_id);
create index if not exists idx_knowledge_edges_source on public.knowledge_edges(source_node_id);
