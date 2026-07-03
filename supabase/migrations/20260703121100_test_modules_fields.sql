-- Test Modules epic: align swim_tests/bike_tests/run_tests with the fields
-- the manual Add/Edit test forms need (see types/swim.ts, types/bike.ts,
-- types/run.ts). Additive only — nothing is dropped, so existing imported
-- data and the CSV import pipeline keep working unchanged. Legacy columns
-- (bike_tests.ftp, bike_tests.cadence, run_tests.cadence,
-- run_tests.threshold_pace) are superseded by the columns added below but
-- left in place rather than dropped.

alter table swim_tests
  add column if not exists notes text;

alter table bike_tests
  add column if not exists notes text,
  add column if not exists max_power integer,
  add column if not exists avg_cadence integer;

-- Backfill the renamed cadence column so existing imported rides don't
-- silently lose their cadence in the new UI. Guarded because the legacy
-- "cadence" column doesn't exist everywhere this migration runs (e.g. a
-- fresh local db, or a remote where avg_cadence was already added directly).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'bike_tests' and column_name = 'cadence'
  ) then
    update bike_tests set avg_cadence = cadence where avg_cadence is null and cadence is not null;
  end if;
end $$;

alter table run_tests
  add column if not exists notes text,
  add column if not exists avg_cadence integer,
  add column if not exists stride_length_m numeric;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'run_tests' and column_name = 'cadence'
  ) then
    update run_tests set avg_cadence = cadence where avg_cadence is null and cadence is not null;
  end if;
end $$;
