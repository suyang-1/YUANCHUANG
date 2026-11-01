-- Community: user-authored posts, comments, reactions and follows.
create table if not exists public.community_posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 160),
 body text not null check (char_length(body) between 1 and 10000),
 category text not null default '设计交流',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.community_comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.community_posts(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 3000),
 created_at timestamptz not null default now()
);
create table if not exists public.community_likes (
 post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
create table if not exists public.user_follows (
 follower_id uuid not null references auth.users(id) on delete cascade,
 following_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(follower_id,following_id),
 check(follower_id <> following_id)
);
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
alter table public.user_follows enable row level security;
drop policy if exists "community posts are readable" on public.community_posts;
create policy "community posts are readable" on public.community_posts for select to authenticated using (true);
drop policy if exists "users create own community posts" on public.community_posts;
create policy "users create own community posts" on public.community_posts for insert to authenticated with check (author_id=auth.uid());
drop policy if exists "users update own community posts" on public.community_posts;
create policy "users update own community posts" on public.community_posts for update to authenticated using (author_id=auth.uid()) with check (author_id=auth.uid());
drop policy if exists "users delete own community posts" on public.community_posts;
create policy "users delete own community posts" on public.community_posts for delete to authenticated using (author_id=auth.uid());
drop policy if exists "comments readable for signed-in users" on public.community_comments;
create policy "comments readable for signed-in users" on public.community_comments for select to authenticated using (exists(select 1 from public.community_posts p where p.id=post_id));
drop policy if exists "users create own comments" on public.community_comments;
create policy "users create own comments" on public.community_comments for insert to authenticated with check (author_id=auth.uid() and exists(select 1 from public.community_posts p where p.id=post_id));
drop policy if exists "users delete own comments" on public.community_comments;
create policy "users delete own comments" on public.community_comments for delete to authenticated using (author_id=auth.uid());
drop policy if exists "community likes readable" on public.community_likes;
create policy "community likes readable" on public.community_likes for select to authenticated using (true);
drop policy if exists "users manage own likes" on public.community_likes;
create policy "users manage own likes" on public.community_likes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "follows readable by participants" on public.user_follows;
create policy "follows readable by participants" on public.user_follows for select to authenticated using (follower_id=auth.uid() or following_id=auth.uid());
drop policy if exists "users manage own follows" on public.user_follows;
create policy "users manage own follows" on public.user_follows for all to authenticated using (follower_id=auth.uid()) with check (follower_id=auth.uid() and follower_id<>following_id);
create index if not exists idx_community_posts_created on public.community_posts(created_at desc);
create index if not exists idx_community_posts_author on public.community_posts(author_id);
create index if not exists idx_community_comments_post on public.community_comments(post_id,created_at);
create index if not exists idx_community_likes_user on public.community_likes(user_id);
create index if not exists idx_user_follows_following on public.user_follows(following_id);
