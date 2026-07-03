import { supabase } from "@/lib/supabase";
import { BikeTest, NewBikeTest } from "@/types/bike";

const BIKE_TEST_COLUMNS =
  "id, test_date, test_type, distance_km, time_seconds, avg_power, normalized_power, max_power, avg_hr, max_hr, avg_cadence, avg_speed_kmh, notes";

export async function fetchBikeTests(): Promise<BikeTest[]> {
  const { data, error } = await supabase
    .from("bike_tests")
    .select(BIKE_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error || !data) return [];
  return data;
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
