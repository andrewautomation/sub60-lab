-- Interval-style test types ("6 x 400m") alongside the existing
-- single-distance ones. `distance` (added in
-- 20260703180000_test_types_fixed_distance.sql) stays the authoritative
-- total the Distance field locks to either way — reps/distance_per_rep are
-- purely for describing the structure back to the athlete (e.g. in the
-- "fixed by this test type" hint), computed client-side as
-- reps * distance_per_rep before the row is written.

alter table test_types
  add column if not exists reps numeric,
  add column if not exists distance_per_rep numeric;
