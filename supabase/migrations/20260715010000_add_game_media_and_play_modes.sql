alter table public.games
  add column play_modes text[] not null default '{}',
  add column screenshots text[] not null default '{}',
  add column movie_url text,
  add column movie_thumbnail_url text,
  add column summary text;

create index games_play_modes_idx on public.games using gin (play_modes);
