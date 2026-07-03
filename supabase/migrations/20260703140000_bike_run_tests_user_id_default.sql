-- bike_tests/run_tests.user_id had no default on the live database, despite
-- 20260702_garmin_import_schema.sql declaring `default auth.uid()` — that
-- migration used `create table if not exists`, which was a no-op because
-- the tables already existed, so the default never actually applied. The
-- bike/run test insert paths (services/bike.service.ts, services/run.service.ts)
-- never set user_id explicitly, relying on that (missing) default — so every
-- insert was silently rejected by the RLS insert policy (user_id NULL !=
-- auth.uid()). Same bug as 20260703130000_swim_tests_user_id_default.sql.
alter table bike_tests alter column user_id set default auth.uid();
alter table run_tests alter column user_id set default auth.uid();
