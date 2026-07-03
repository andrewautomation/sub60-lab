-- Athlete Domain schema.
--
-- Normalized per the Athlete Performance Platform design: identity
-- (profiles), sport/event reference data (sports, events), and per-athlete
-- child records (goals, equipment, performance_profiles) each own their
-- own table rather than one wide "athletes" row with jsonb blobs. Raw test
-- history stays in the existing swim_tests / bike_tests / run_tests tables
-- — it is not duplicated here.
--
-- Sports and Events are reference/catalog tables, not per-user data. They
-- are seeded below from lib/sports/catalog.ts and used purely for
-- referential integrity: profiles.primary_sport_id / primary_event_id and
-- goals.event_id are real foreign keys, so adding a new sport or event is
-- an insert into these tables (kept in sync with the TS catalog) rather
-- than a schema migration or a check-constraint edit. See
-- lib/sports/registry.ts eventId() for how an event's id is derived —
-- events.id and goals.event_id use that exact same string, so application
-- code resolves a foreign key straight back into the catalog with no join.

-- ---------------------------------------------------------------------
-- Reference tables
-- ---------------------------------------------------------------------

create table if not exists sports (
  id text primary key,
  name text not null,
  emoji text not null,
  disciplines text[] not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  sport_id text not null references sports (id),
  key text not null,
  name text not null,
  kind text not null default 'race' check (kind in ('race', 'test')),
  -- [{"discipline": "swim", "distance": 400}, ...]; null for is_custom
  -- rows — the athlete supplies their own legs (see
  -- profiles.primary_event_custom_legs).
  legs jsonb,
  is_custom boolean not null default false,
  sort_order integer not null default 0,
  unique (sport_id, key)
);

alter table sports enable row level security;
alter table events enable row level security;

create policy "Anyone can read the sport catalog" on sports for select using (true);
create policy "Anyone can read the event catalog" on events for select using (true);

-- ---------------------------------------------------------------------
-- Athlete aggregate
-- ---------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  -- Deliberately not the primary key: a separate id lets one account own
  -- more than one athlete profile later (a coach, a family account)
  -- without a schema change.
  user_id uuid not null unique references auth.users (id),
  first_name text not null,
  last_name text not null,
  birth_date date,
  sex text not null default 'unspecified' check (sex in ('male', 'female', 'unspecified')),
  height_cm numeric,
  weight_kg numeric,
  country text,
  timezone text,
  primary_sport_id text not null references sports (id),
  primary_event_id text not null references events (id),
  primary_event_custom_legs jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  event_id text not null references events (id),
  -- Exactly one of level_key / custom_target_value is set: a goal is
  -- always a real, comparable number, never free text.
  level_key text,
  custom_target_value numeric,
  target_date date,
  status text not null default 'active' check (status in ('active', 'achieved', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (level_key is not null and custom_target_value is null)
    or (level_key is null and custom_target_value is not null)
  )
);

create table if not exists equipment (
  profile_id uuid primary key references profiles (id) on delete cascade,
  bike_type text check (bike_type in ('road', 'tt', 'gravel', 'indoor')),
  has_power_meter boolean not null default false,
  has_smart_trainer boolean not null default false,
  pool_length_m integer check (pool_length_m in (25, 50)),
  running_surface text check (running_surface in ('road', 'track', 'trail')),
  updated_at timestamptz not null default now()
);

create table if not exists performance_profiles (
  profile_id uuid primary key references profiles (id) on delete cascade,
  ftp_watts numeric,
  critical_power_watts numeric,
  css_seconds_per_100m numeric,
  threshold_pace_seconds_per_km numeric,
  vo2max numeric,
  resting_hr integer,
  max_hr integer,
  lactate_threshold_hr integer,
  lactate_threshold_pace_seconds_per_km numeric,
  lactate_threshold_power_watts numeric,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table goals enable row level security;
alter table equipment enable row level security;
alter table performance_profiles enable row level security;

create policy "Individuals manage their own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Individuals manage their own goals"
  on goals for all
  using (exists (select 1 from profiles p where p.id = goals.profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from profiles p where p.id = goals.profile_id and p.user_id = auth.uid()));

create policy "Individuals manage their own equipment"
  on equipment for all
  using (exists (select 1 from profiles p where p.id = equipment.profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from profiles p where p.id = equipment.profile_id and p.user_id = auth.uid()));

create policy "Individuals manage their own performance profile"
  on performance_profiles for all
  using (exists (select 1 from profiles p where p.id = performance_profiles.profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from profiles p where p.id = performance_profiles.profile_id and p.user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- Seed: sports & events
--
-- Mirrors lib/sports/catalog.ts SPORT_CATALOG exactly. If the two drift,
-- the TS catalog wins for application behavior (it's what pure code reads)
-- but profiles/goals FKs will fail to insert until this seed catches up —
-- treat that as a signal to add the missing row here, not to special-case
-- the catalog. See ARCHITECTURE.md for the planned codegen script that
-- will generate this block from the TS catalog automatically.
-- ---------------------------------------------------------------------

insert into sports (id, name, emoji, disciplines) values
  ('swimming', 'Swimming', '🏊', array['swim']),
  ('cycling', 'Cycling', '🚴', array['bike']),
  ('running', 'Running', '🏃', array['run']),
  ('duathlon', 'Duathlon', '🏃🚴', array['run', 'bike']),
  ('aquathlon', 'Aquathlon', '🏊🏃', array['swim', 'run']),
  ('triathlon', 'Triathlon', '🏊🚴🏃', array['swim', 'bike', 'run'])
on conflict (id) do nothing;

insert into events (id, sport_id, key, name, kind, legs, is_custom, sort_order) values
  ('swimming:swim_100m', 'swimming', 'swim_100m', '100 m', 'race', '[{"discipline":"swim","distance":100}]', false, 0),
  ('swimming:swim_200m', 'swimming', 'swim_200m', '200 m', 'race', '[{"discipline":"swim","distance":200}]', false, 1),
  ('swimming:swim_400m', 'swimming', 'swim_400m', '400 m', 'race', '[{"discipline":"swim","distance":400}]', false, 2),
  ('swimming:swim_800m', 'swimming', 'swim_800m', '800 m', 'race', '[{"discipline":"swim","distance":800}]', false, 3),
  ('swimming:swim_1500m', 'swimming', 'swim_1500m', '1500 m', 'race', '[{"discipline":"swim","distance":1500}]', false, 4),
  ('swimming:swim_css', 'swimming', 'swim_css', 'CSS (Critical Swim Speed) Test', 'test', '[{"discipline":"swim","distance":400}]', false, 5),
  ('swimming:custom', 'swimming', 'custom', 'Custom', 'race', null, true, 6),

  ('cycling:bike_ftp', 'cycling', 'bike_ftp', 'FTP Test', 'test', '[{"discipline":"bike","distance":20}]', false, 0),
  ('cycling:bike_10k', 'cycling', 'bike_10k', '10K Time Trial', 'race', '[{"discipline":"bike","distance":10}]', false, 1),
  ('cycling:bike_20k', 'cycling', 'bike_20k', '20K Time Trial', 'race', '[{"discipline":"bike","distance":20}]', false, 2),
  ('cycling:bike_40k', 'cycling', 'bike_40k', '40K Time Trial', 'race', '[{"discipline":"bike","distance":40}]', false, 3),
  ('cycling:bike_hill_climb', 'cycling', 'bike_hill_climb', 'Hill Climb', 'race', '[{"discipline":"bike","distance":10}]', false, 4),
  ('cycling:custom', 'cycling', 'custom', 'Custom', 'race', null, true, 5),

  ('running:run_800m', 'running', 'run_800m', '800 m', 'race', '[{"discipline":"run","distance":0.8}]', false, 0),
  ('running:run_1500m', 'running', 'run_1500m', '1500 m', 'race', '[{"discipline":"run","distance":1.5}]', false, 1),
  ('running:run_3000m', 'running', 'run_3000m', '3000 m', 'race', '[{"discipline":"run","distance":3}]', false, 2),
  ('running:run_5k', 'running', 'run_5k', '5K', 'race', '[{"discipline":"run","distance":5}]', false, 3),
  ('running:run_10k', 'running', 'run_10k', '10K', 'race', '[{"discipline":"run","distance":10}]', false, 4),
  ('running:run_half_marathon', 'running', 'run_half_marathon', 'Half Marathon', 'race', '[{"discipline":"run","distance":21.1}]', false, 5),
  ('running:run_marathon', 'running', 'run_marathon', 'Marathon', 'race', '[{"discipline":"run","distance":42.2}]', false, 6),
  ('running:custom', 'running', 'custom', 'Custom', 'race', null, true, 7),

  ('duathlon:duathlon_sprint', 'duathlon', 'duathlon_sprint', 'Sprint (5K-20K-2.5K)', 'race',
    '[{"discipline":"run","distance":5},{"discipline":"bike","distance":20},{"discipline":"run","distance":2.5}]', false, 0),
  ('duathlon:duathlon_standard', 'duathlon', 'duathlon_standard', 'Standard (10K-40K-5K)', 'race',
    '[{"discipline":"run","distance":10},{"discipline":"bike","distance":40},{"discipline":"run","distance":5}]', false, 1),
  ('duathlon:custom', 'duathlon', 'custom', 'Custom', 'race', null, true, 2),

  ('aquathlon:aquathlon_sprint', 'aquathlon', 'aquathlon_sprint', 'Sprint (500 m Swim - 2.5K Run)', 'race',
    '[{"discipline":"swim","distance":500},{"discipline":"run","distance":2.5}]', false, 0),
  ('aquathlon:aquathlon_standard', 'aquathlon', 'aquathlon_standard', 'Standard (1K Swim - 5K Run)', 'race',
    '[{"discipline":"swim","distance":1000},{"discipline":"run","distance":5}]', false, 1),
  ('aquathlon:custom', 'aquathlon', 'custom', 'Custom', 'race', null, true, 2),

  ('triathlon:super_sprint', 'triathlon', 'super_sprint', 'Super Sprint', 'race',
    '[{"discipline":"swim","distance":400},{"discipline":"bike","distance":10},{"discipline":"run","distance":2.5}]', false, 0),
  ('triathlon:sprint', 'triathlon', 'sprint', 'Sprint', 'race',
    '[{"discipline":"swim","distance":750},{"discipline":"bike","distance":20},{"discipline":"run","distance":5}]', false, 1),
  ('triathlon:olympic', 'triathlon', 'olympic', 'Olympic', 'race',
    '[{"discipline":"swim","distance":1500},{"discipline":"bike","distance":40},{"discipline":"run","distance":10}]', false, 2),
  ('triathlon:half_iron', 'triathlon', 'half_iron', '70.3', 'race',
    '[{"discipline":"swim","distance":1900},{"discipline":"bike","distance":90},{"discipline":"run","distance":21.1}]', false, 3),
  ('triathlon:full_iron', 'triathlon', 'full_iron', '140.6', 'race',
    '[{"discipline":"swim","distance":3800},{"discipline":"bike","distance":180},{"discipline":"run","distance":42.2}]', false, 4),
  ('triathlon:custom', 'triathlon', 'custom', 'Custom', 'race', null, true, 5)
on conflict (id) do nothing;
