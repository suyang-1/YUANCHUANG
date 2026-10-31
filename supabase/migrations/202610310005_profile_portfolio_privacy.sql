-- Explicit public/private controls for profile and portfolio data.
-- Existing profiles and portfolio items remain private by default.
alter table public.profiles
  add column if not exists is_public boolean not null default false;

alter table public.portfolio_items
  add column if not exists is_public boolean not null default false;

-- Keep the existing owner-managed profile policy, and allow public reads
-- only when the account owner has explicitly opted in.
drop policy if exists "public profiles are readable when enabled" on public.profiles;
create policy "public profiles are readable when enabled"
  on public.profiles for select
  using (is_public = true);

-- Portfolio metadata must not be globally readable by default.
drop policy if exists "public portfolios readable" on public.portfolio_items;
drop policy if exists "portfolios are readable when public or owned" on public.portfolio_items;
create policy "portfolios are readable when public or owned"
  on public.portfolio_items for select
  using (is_public = true or owner_id = auth.uid());

create index if not exists idx_public_portfolios_created
  on public.portfolio_items(created_at desc)
  where is_public = true;
create index if not exists idx_public_profiles
  on public.profiles(display_name)
  where is_public = true;
