-- Deleting a test type must never delete the athlete's logged tests — it
-- should only remove the label, dropping those tests back to "Unsorted"
-- (test_type_id null), same as tests that never had a type assigned.
-- The FK added in 20260703150000_test_types.sql defaulted to NO ACTION
-- (blocks deletion while any test still references it); switch it to
-- ON DELETE SET NULL instead.

alter table swim_tests drop constraint if exists swim_tests_test_type_id_fkey;
alter table swim_tests
  add constraint swim_tests_test_type_id_fkey
  foreign key (test_type_id) references test_types (id) on delete set null;

alter table bike_tests drop constraint if exists bike_tests_test_type_id_fkey;
alter table bike_tests
  add constraint bike_tests_test_type_id_fkey
  foreign key (test_type_id) references test_types (id) on delete set null;

alter table run_tests drop constraint if exists run_tests_test_type_id_fkey;
alter table run_tests
  add constraint run_tests_test_type_id_fkey
  foreign key (test_type_id) references test_types (id) on delete set null;
