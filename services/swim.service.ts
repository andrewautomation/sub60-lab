import { supabase } from "@/lib/supabase";
import { NewSwimTest, SwimTest } from "@/types/swim";

const SWIM_TEST_COLUMNS =
  "id, test_date, test_type, distance_m, time_seconds, pace_per_100m, swolf, total_strokes, stroke_rate, avg_hr, max_hr, pool_length_m, notes";

export async function fetchSwimTests(): Promise<SwimTest[]> {
  const { data, error } = await supabase
    .from("swim_tests")
    .select(SWIM_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error || !data) return [];
  return data;
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
