import { supabase } from "@/lib/supabase";
import { NewSwimTest, SwimTest, SwimTestSummary } from "@/types/swim";

const SWIM_TEST_COLUMNS =
  "id, test_date, test_type, distance_m, time_seconds, pace_per_100m, swolf, total_strokes, stroke_rate, avg_hr, max_hr, pool_length_m";

const SWIM_TEST_SUMMARY_COLUMNS =
  "test_date, distance_m, time_seconds, pace_per_100m, swolf";

export async function fetchSwimTests(): Promise<SwimTest[]> {
  const { data, error } = await supabase
    .from("swim_tests")
    .select(SWIM_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function fetchLatestSwimTest(): Promise<SwimTestSummary | null> {
  const { data, error } = await supabase
    .from("swim_tests")
    .select(SWIM_TEST_SUMMARY_COLUMNS)
    .order("test_date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

export async function insertSwimTest(
  input: NewSwimTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("swim_tests").insert(input);
  return { error: error?.message ?? null };
}
