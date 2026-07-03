import { supabase } from "@/lib/supabase";
import { NewRunTest, RunTest } from "@/types/run";

const RUN_TEST_COLUMNS =
  "id, test_date, test_type, test_type_id, distance_km, time_seconds, pace_per_km, avg_hr, max_hr, avg_cadence, stride_length_m, notes";

/** `error` is only set for a genuine fetch failure — never for the
 * legitimate "no tests logged yet" case (`tests: [], error: null`).
 * Callers must check `error` before rendering an empty-state, or a
 * network blip reads to the athlete as lost history. */
export async function fetchRunTests(): Promise<{ tests: RunTest[]; error: string | null }> {
  const { data, error } = await supabase
    .from("run_tests")
    .select(RUN_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error) return { tests: [], error: error.message };
  return { tests: data ?? [], error: null };
}

export async function insertRunTest(
  input: NewRunTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("run_tests").insert(input);
  return { error: error?.message ?? null };
}

export async function updateRunTest(
  id: string,
  input: NewRunTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("run_tests").update(input).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteRunTest(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("run_tests").delete().eq("id", id);
  return { error: error?.message ?? null };
}
