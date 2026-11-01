-- Move portfolio images behind Storage RLS and issue short-lived signed URLs.
-- Public visitors can sign only images belonging to explicitly public portfolio items.
update storage.buckets
set public = false
where id = 'portfolio';

drop policy if exists "portfolio images are publicly readable" on storage.objects;
drop policy if exists "public portfolio images are readable" on storage.objects;
create policy "public portfolio images are readable"
  on storage.objects for select
  using (
    bucket_id = 'portfolio'
    and exists (
      select 1
      from public.portfolio_items p
      where p.owner_id::text = (storage.foldername(name))[1]
        and p.is_public = true
        and p.cover_url is not null
        and (
          p.cover_url like '%' || name
          or p.cover_url like '%' || replace(name, ' ', '%20')
        )
    )
  );

-- Owners retain access to their own portfolio files, including private items.
drop policy if exists "users read own portfolio images" on storage.objects;
create policy "users read own portfolio images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
