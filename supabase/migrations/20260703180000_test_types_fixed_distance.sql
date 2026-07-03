-- A Test Type's whole purpose is to keep tests comparable over time (see
-- 20260703150000_test_types.sql) — that guarantee only holds if every test
-- logged under "5K Time Trial" is actually 5K. Nothing enforced that
-- before: the athlete could create a type once and then log a 400m test,
-- an 800m test, whatever, all under the same bucket, quietly breaking the
-- Goal %/chart comparisons built on top of it.
--
-- distance is nullable so existing (pre-this-migration) test types keep
-- today's free-entry behavior — only newly-created types are asked for
-- (and locked to) a distance. Convention matches EventLeg elsewhere in
-- this codebase: meters for swim, kilometers for bike/run.

alter table test_types add column if not exists distance numeric;
