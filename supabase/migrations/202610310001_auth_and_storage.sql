-- YUANCHUANG production foundation: profile bootstrap and safer defaults.
-- Apply once in Supabase SQL Editor. Safe to re-run.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
 insert into public.profiles (id,display_name)
 values (new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1),'设计学习者'))
 on conflict (id) do nothing;
 return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
 after insert on auth.users
 for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
 for each row execute procedure public.set_updated_at();

-- Only authenticated members can read community profiles; each member edits only their own.
drop policy if exists "profiles are viewable by everyone" on public.profiles;
drop policy if exists "authenticated profiles are readable" on public.profiles;
create policy "authenticated profiles are readable" on public.profiles
 for select to authenticated using (true);

create index if not exists idx_learning_paths_user_created on public.learning_paths(user_id,created_at desc);
create index if not exists idx_path_nodes_path_order on public.path_nodes(path_id,sort_order);
create index if not exists idx_projects_owner_created on public.projects(owner_id,created_at desc);
create index if not exists idx_resources_owner_created on public.resources(owner_id,created_at desc);
create index if not exists idx_learning_records_user_created on public.learning_records(user_id,created_at desc);

-- Profile storage bucket: public read for avatars, authenticated owner writes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('avatars','avatars',true,5242880,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
drop policy if exists "avatar images are publicly readable" on storage.objects;
create policy "avatar images are publicly readable" on storage.objects
 for select using (bucket_id='avatars');
drop policy if exists "users upload own avatar" on storage.objects;
create policy "users upload own avatar" on storage.objects
 for insert to authenticated with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar" on storage.objects
 for update to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text)
 with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "users delete own avatar" on storage.objects;
create policy "users delete own avatar" on storage.objects
 for delete to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
