-- swim_tests.user_id had no default, unlike bike_tests/run_tests. The
-- swim test insert path (services/swim.service.ts) never sets user_id
-- explicitly, relying on the column default — so every swim test insert
-- was silently rejected by the RLS insert policy (user_id NULL != auth.uid()).
alter table swim_tests alter column user_id set default auth.uid();
