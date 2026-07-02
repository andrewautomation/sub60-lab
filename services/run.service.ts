import { supabase } from "@/lib/supabase";
import { NewRunTest, RunTest } from "@/types/run";

const RUN_TEST_COLUMNS =
  "id, test_date, test_type, distance_km, time_seconds, pace_per_km, threshold_pace, cadence, avg_hr, max_hr";

export async function fetchRunTests(): Promise<RunTest[]> {
  const { data, error } = await supabase
    .from("run_tests")
    .select(RUN_TEST_COLUMNS)
    .order("test_date", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function insertRunTest(
  input: NewRunTest
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("run_tests").insert(input);
  return { error: error?.message ?? null };
}
