-- Account-specific profile identity for students and teachers.
alter table public.profiles
  add column if not exists account_type text not null default 'student';

alter table public.profiles
  drop constraint if exists profiles_account_type_check;
alter table public.profiles
  add constraint profiles_account_type_check
  check (account_type in ('student','teacher'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
 insert into public.profiles (id,display_name,account_type,major)
 values (
   new.id,
   coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1),'设计学习者'),
   case when new.raw_user_meta_data->>'account_type'='teacher' then 'teacher' else 'student' end,
   nullif(new.raw_user_meta_data->>'major','')
 )
 on conflict (id) do nothing;
 return new;
end;
$$;
