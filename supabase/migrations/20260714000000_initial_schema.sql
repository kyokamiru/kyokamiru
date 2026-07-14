create type public.approval_status as enum (
  'allowed',
  'conditional',
  'prohibited',
  'unknown'
);

create type public.spoiler_status as enum (
  'none',
  'restricted',
  'unknown'
);

create type public.music_status as enum (
  'ok',
  'partial_mute',
  'restricted',
  'unknown'
);

create type public.application_status as enum (
  'not_required',
  'required',
  'unknown'
);

create type public.source_type as enum (
  'guideline',
  'eula',
  'faq',
  'dev_statement',
  'other'
);

create type public.guideline_scope as enum (
  'publisher_wide',
  'title_specific'
);

create table public.publishers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_en text,
  official_site_url text,
  guideline_url text,
  guideline_summary text,
  default_streaming_status public.approval_status,
  default_monetization_status public.approval_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_en text,
  publisher_id uuid not null references public.publishers(id),
  release_date date,
  genres text[] not null default '{}',
  steam_app_id integer unique,
  header_image_url text,
  guideline_scope public.guideline_scope not null default 'title_specific',
  streaming_status public.approval_status not null default 'unknown',
  monetization_status public.approval_status not null default 'unknown',
  spoiler_restriction public.spoiler_status not null default 'unknown',
  music_restriction public.music_status not null default 'unknown',
  clip_archive_status public.approval_status not null default 'unknown',
  prior_application public.application_status not null default 'unknown',
  notes text,
  last_verified_at date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index games_publisher_id_idx on public.games(publisher_id);
create index games_published_idx on public.games(published)
  where published = true;

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  url text not null,
  source_type public.source_type not null,
  label text,
  noted_at date,
  created_at timestamptz not null default now()
);

create index sources_game_id_idx on public.sources(game_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger publishers_updated_at
before update on public.publishers
for each row execute function public.set_updated_at();

create trigger games_updated_at
before update on public.games
for each row execute function public.set_updated_at();

alter table public.publishers enable row level security;
alter table public.games enable row level security;
alter table public.sources enable row level security;

create policy "public read publishers"
on public.publishers
for select
to anon, authenticated
using (true);

create policy "public read published games"
on public.games
for select
to anon, authenticated
using (published = true);

create policy "public read sources of published games"
on public.sources
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.games
    where games.id = sources.game_id
      and games.published = true
  )
);

grant usage on schema public to anon, authenticated;
grant select on table public.publishers to anon, authenticated;
grant select on table public.games to anon, authenticated;
grant select on table public.sources to anon, authenticated;
