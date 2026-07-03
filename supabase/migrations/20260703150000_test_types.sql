-- Structured Test Types: replaces free-text test_type as the grouping key
-- for swim/bike/run tests. Distinct from `events` (a fixed, seeded catalog
-- of race distances shared by every athlete) — test_types is per-athlete
-- and free-form, since an athlete's own repeatable protocol ("400m
-- Intervals", "Riverside Loop TT") has no place in a shared catalog.
-- event_id is an optional tie-in for a type that happens to match a
-- catalog distance, not a requirement.
--
-- Additive only: the existing free-text test_type column on each test
-- table stays, now just a display mirror of the selected type's name so
-- legacy code (TestHistoryTable columns) needs no changes. Legacy rows
-- keep test_type_id null ("Unsorted") — deliberately not backfilled by
-- guessing a match, the athlete reconciles them via the Edit form.

create table if not exists test_types (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  discipline text not null check (discipline in ('swim', 'bike', 'run')),
  name text not null,
  event_id text references events (id),
  created_at timestamptz not null default now(),
  unique (profile_id, discipline, name)
);

alter table test_types enable row level security;

create policy "Individuals manage their own test types"
  on test_types for all
  using (exists (select 1 from profiles p where p.id = test_types.profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from profiles p where p.id = test_types.profile_id and p.user_id = auth.uid()));

alter table swim_tests add column if not exists test_type_id uuid references test_types (id);
alter table bike_tests add column if not exists test_type_id uuid references test_types (id);
alter table run_tests  add column if not exists test_type_id uuid references test_types (id);
