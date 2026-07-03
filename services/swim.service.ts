import { supabase } from "@/lib/supabase";
import { NewSwimTest, SwimTest } from "@/types/swim";

const SWIM_TEST_COLUMNS =
  "id, test_date, test_type, test_type_id, distance_m, time_seconds, pace_per_100m, swolf, total_strokes, stroke_rate, avg_hr, max_hr, pool_length_m, notes";

/** `error` is only set for a genuine fetch failure — never for the
 * legitimate "no tests logged yet" case (`tests: [], error: null`).
 * Callers must check `error` before rendering an empty-state, or a
 * network blip reads to the athlete as lost history. */
export async function fetchSwimTests(): Promise<{ tests: SwimTest[]; error: string | null }> {
  const { data, error } = await supabase
    .from("swim_tests")
    .select(SWIM_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error) return { tests: [], error: error.message };
  return { tests: data ?? [], error: null };
}

export async function insertSwimTest(
  input: NewSwimTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("swim_tests").insert(input);
  return { error: error?.message ?? null };
}

export async function updateSwimTest(
  id: string,
  input: NewSwimTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("swim_tests").update(input).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteSwimTest(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("swim_tests").delete().eq("id", id);
  return { error: error?.message ?? null };
}
