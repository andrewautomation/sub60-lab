-- Optional rest duration between reps for interval-style test types
-- (20260703190000_test_types_intervals.sql) — purely descriptive, shown
-- back to the athlete when logging a test under this type, never used in
-- the Distance/Time lock math.
alter table test_types add column if not exists rest_seconds numeric;
