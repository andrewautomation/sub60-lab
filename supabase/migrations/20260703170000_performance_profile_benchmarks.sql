-- Self-reported standard-distance/format benchmark times, entered once at
-- onboarding (skippable) and editable in Settings. Distinct from raw test
-- history (swim_tests/bike_tests/run_tests) — these are the athlete's own
-- declared "here's what I can do at the standard distances," used only to
-- estimate a sport-identity ranking badge (lib/ranking), not analytics.
-- Additive to the existing performance_profiles table (already has
-- ftp_watts, which doubles as the cycling benchmark — 20-min power).

alter table performance_profiles
  add column if not exists run_5k_seconds numeric,
  add column if not exists run_10k_seconds numeric,
  add column if not exists run_half_marathon_seconds numeric,
  add column if not exists run_marathon_seconds numeric,
  add column if not exists swim_50m_seconds numeric,
  add column if not exists swim_100m_seconds numeric,
  add column if not exists swim_400m_seconds numeric,
  add column if not exists swim_1500m_seconds numeric,
  add column if not exists triathlon_super_sprint_seconds numeric,
  add column if not exists triathlon_sprint_seconds numeric,
  add column if not exists triathlon_olympic_seconds numeric,
  add column if not exists triathlon_half_iron_seconds numeric,
  add column if not exists triathlon_full_iron_seconds numeric,
  add column if not exists duathlon_sprint_seconds numeric,
  add column if not exists duathlon_standard_seconds numeric,
  add column if not exists aquathlon_sprint_seconds numeric,
  add column if not exists aquathlon_standard_seconds numeric;
