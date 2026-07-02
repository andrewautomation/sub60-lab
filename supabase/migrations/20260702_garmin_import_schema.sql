-- Garmin CSV import support.
--
-- This app has no prior migration files in the repo, so this migration is a
-- best-effort inference from the existing TypeScript types (types/swim.ts,
-- types/bike.ts, types/run.ts), not a diff against the live schema. Review
-- column types, defaults, and RLS policies against your actual Supabase
-- project before applying.

-- swim_tests already exists and is in active use — only add the columns
-- the Garmin import needs, all nullable so nothing already stored breaks.
alter table swim_tests
  add column if not exists avg_hr integer,
  add column if not exists max_hr integer,
  add column if not exists pool_length_m integer;

-- bike_tests / run_tests were referenced in ARCHITECTURE.md but never
-- confirmed to exist — create them to match the app's BikeTest / RunTest
-- types if they aren't already present.
create table if not exists bike_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) default auth.uid(),
  test_date date not null,
  test_type text not null,
  distance_km numeric not null,
  time_seconds integer not null,
  avg_power integer,
  normalized_power integer,
  ftp integer,
  cadence integer,
  avg_hr integer,
  max_hr integer,
  avg_speed_kmh numeric,
  created_at timestamptz not null default now()
);

create table if not exists run_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) default auth.uid(),
  test_date date not null,
  test_type text not null,
  distance_km numeric not null,
  time_seconds integer not null,
  pace_per_km text,
  threshold_pace text,
  cadence integer,
  avg_hr integer,
  max_hr integer,
  created_at timestamptz not null default now()
);

alter table bike_tests enable row level security;
alter table run_tests enable row level security;

create policy "Individuals manage their own bike tests"
  on bike_tests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Individuals manage their own run tests"
  on run_tests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
