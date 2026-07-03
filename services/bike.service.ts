import { supabase } from "@/lib/supabase";
import { BikeTest, NewBikeTest } from "@/types/bike";

const BIKE_TEST_COLUMNS =
  "id, test_date, test_type, distance_km, time_seconds, avg_power, normalized_power, max_power, avg_hr, max_hr, avg_cadence, avg_speed_kmh, notes";

/** `error` is only set for a genuine fetch failure — never for the
 * legitimate "no tests logged yet" case (`tests: [], error: null`).
 * Callers must check `error` before rendering an empty-state, or a
 * network blip reads to the athlete as lost history. */
export async function fetchBikeTests(): Promise<{ tests: BikeTest[]; error: string | null }> {
  const { data, error } = await supabase
    .from("bike_tests")
    .select(BIKE_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error) return { tests: [], error: error.message };
  return { tests: data ?? [], error: null };
}

export async function insertBikeTest(
  input: NewBikeTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bike_tests").insert(input);
  return { error: error?.message ?? null };
}

export async function updateBikeTest(
  id: string,
  input: NewBikeTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bike_tests").update(input).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteBikeTest(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bike_tests").delete().eq("id", id);
  return { error: error?.message ?? null };
}
