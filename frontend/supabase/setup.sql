-- Run once in your Supabase project's SQL Editor. No public write permissions.
create table if not exists public.portfolio_content (
 kind text primary key check (kind in ('projects','profile')),
 data jsonb not null,
 revision text not null default gen_random_uuid()::text
);
create table if not exists public.portfolio_sessions (
 token_hash text primary key,
 credential text not null,
 expires_at timestamptz not null
);
create index if not exists portfolio_session_expiry on public.portfolio_sessions(expires_at);
create table if not exists public.portfolio_login_limit (
 id integer primary key check (id=1), attempts integer not null, window_end timestamptz not null
);
alter table public.portfolio_content enable row level security;
alter table public.portfolio_sessions enable row level security;
alter table public.portfolio_login_limit enable row level security;
revoke all on public.portfolio_content, public.portfolio_sessions, public.portfolio_login_limit from anon, authenticated;
grant all on public.portfolio_content, public.portfolio_sessions, public.portfolio_login_limit to service_role;

create or replace function public.portfolio_login_attempt() returns boolean
language plpgsql security invoker set search_path = '' as $$
declare permitted boolean;
begin
 insert into public.portfolio_login_limit values (1,0,now()+interval '15 minutes') on conflict do nothing;
 update public.portfolio_login_limit
 set attempts = case when window_end <= now() then 1 else attempts+1 end,
 window_end = case when window_end <= now() then now()+interval '15 minutes' else window_end end
 where id=1 and (attempts < 5 or window_end <= now()) returning true into permitted;
 delete from public.portfolio_sessions where expires_at <= now();
 return coalesce(permitted,false);
end $$;

create or replace function public.portfolio_save(p_kind text, p_data jsonb, p_revision text) returns text
language plpgsql security invoker set search_path = '' as $$
declare new_revision text;
begin
 if p_revision = 'initial' then
  insert into public.portfolio_content(kind,data) values (p_kind,p_data)
  on conflict do nothing returning revision into new_revision;
 else
  update public.portfolio_content set data=p_data, revision=gen_random_uuid()::text
  where kind=p_kind and revision=p_revision returning revision into new_revision;
 end if;
 return new_revision;
end $$;
revoke all on function public.portfolio_login_attempt() from public, anon, authenticated;
revoke all on function public.portfolio_save(text,jsonb,text) from public, anon, authenticated;
grant execute on function public.portfolio_login_attempt() to service_role;
grant execute on function public.portfolio_save(text,jsonb,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-images','portfolio-images',true,524288,array['image/jpeg'])
on conflict (id) do nothing;
