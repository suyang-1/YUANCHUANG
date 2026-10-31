-- Portfolio image storage: public read, owner-scoped writes.
-- Apply after 202610310001_auth_and_storage.sql.
-- Files must be stored under {auth.uid()}/... to satisfy the write policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio images are publicly readable" on storage.objects;
create policy "portfolio images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "users upload own portfolio images" on storage.objects;
create policy "users upload own portfolio images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own portfolio images" on storage.objects;
create policy "users update own portfolio images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own portfolio images" on storage.objects;
create policy "users delete own portfolio images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
