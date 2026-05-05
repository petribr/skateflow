-- Skateflow initial schema
-- Run via `supabase db push` or paste into the SQL editor.

create extension if not exists "pgcrypto";

create type skill_level as enum ('beginner', 'intermediate', 'advanced');
create type session_type as enum ('casual', 'training', 'class');
create type report_target as enum ('user', 'session', 'comment');
create type report_reason as enum ('spam', 'harassment', 'inappropriate', 'other');

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null,
  username     text unique not null,
  avatar_url   text,
  skill_level  skill_level not null default 'beginner',
  city         text,
  instagram    text,
  flagged      int  not null default 0,
  created_at   timestamptz not null default now()
);

create table sessions (
  id                 uuid primary key default gen_random_uuid(),
  creator_id         uuid not null references profiles (id) on delete cascade,
  title              text not null,
  description        text,
  location_name      text not null,
  lat                double precision not null,
  lng                double precision not null,
  starts_at          timestamptz not null,
  type               session_type not null default 'casual',
  max_participants   int,
  recurring_weekly   boolean not null default false,
  created_at         timestamptz not null default now()
);
create index sessions_starts_at_idx on sessions (starts_at);
create index sessions_creator_idx   on sessions (creator_id);

create table attendance (
  session_id uuid references sessions (id) on delete cascade,
  user_id    uuid references profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  body       text not null check (length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index comments_session_idx on comments (session_id, created_at);

create table reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references profiles (id) on delete cascade,
  target_type  report_target not null,
  target_id    uuid not null,
  reason       report_reason not null,
  details      text,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user_' || substr(new.id::text, 1, 8),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment flagged counter when reports target a user.
create or replace function public.bump_flagged()
returns trigger as $$
begin
  if new.target_type = 'user' then
    update public.profiles set flagged = flagged + 1 where id = new.target_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_report_inserted on reports;
create trigger on_report_inserted
  after insert on reports
  for each row execute procedure public.bump_flagged();

-- Moderation queue (for an admin app to consume later).
create or replace view moderation_queue as
  select id, name, username, flagged
  from profiles
  where flagged >= 3
  order by flagged desc;

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles   enable row level security;
alter table sessions   enable row level security;
alter table attendance enable row level security;
alter table comments   enable row level security;
alter table reports    enable row level security;

-- profiles: anyone authenticated can read; only owner can update.
create policy profiles_read on profiles
  for select using (auth.role() = 'authenticated');
create policy profiles_update on profiles
  for update using (auth.uid() = id);

-- sessions: read by any auth'd user; write by creator.
create policy sessions_read on sessions
  for select using (auth.role() = 'authenticated');
create policy sessions_insert on sessions
  for insert with check (auth.uid() = creator_id);
create policy sessions_update on sessions
  for update using (auth.uid() = creator_id);
create policy sessions_delete on sessions
  for delete using (auth.uid() = creator_id);

-- attendance: read by any auth'd; write only your own row.
create policy attendance_read on attendance
  for select using (auth.role() = 'authenticated');
create policy attendance_insert on attendance
  for insert with check (auth.uid() = user_id);
create policy attendance_delete on attendance
  for delete using (auth.uid() = user_id);

-- comments: read by any auth'd; write by author.
create policy comments_read on comments
  for select using (auth.role() = 'authenticated');
create policy comments_insert on comments
  for insert with check (auth.uid() = user_id);
create policy comments_delete on comments
  for delete using (auth.uid() = user_id);

-- reports: insert-only by reporter, no read for normal users.
create policy reports_insert on reports
  for insert with check (auth.uid() = reporter_id);
