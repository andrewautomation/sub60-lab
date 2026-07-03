-- Baseline for swim_tests.
--
-- swim_tests predates any migration file in this repo — it was created
-- directly on the remote project before migrations were adopted. Later
-- migrations (garmin_import_schema, test_modules_fields) ALTER this table
-- assuming it already exists, which only holds on the remote. This
-- baseline recreates its pre-migration shape so a fresh local/CI database
-- can replay the full migration history from scratch.
create table if not exists swim_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  test_date date not null,
  test_type text not null default '400m TT',
  distance_m numeric not null,
  time_seconds numeric not null,
  pace_per_100m text,
  swolf numeric,
  total_strokes numeric,
  stroke_rate numeric
);

alter table swim_tests enable row level security;

create policy "Users can read own swim tests" on swim_tests for select using (auth.uid() = user_id);
create policy "Users can insert own swim tests" on swim_tests for insert with check (auth.uid() = user_id);
create policy "Users can update own swim tests" on swim_tests for update using (auth.uid() = user_id);
create policy "Users can delete own swim tests" on swim_tests for delete using (auth.uid() = user_id);
