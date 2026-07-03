import { supabase } from "@/lib/supabase";
import { NewPerformanceProfile, PerformanceProfile } from "@/types/performanceProfile";

const PERFORMANCE_PROFILE_COLUMNS =
  "profile_id, ftp_watts, critical_power_watts, css_seconds_per_100m, threshold_pace_seconds_per_km, vo2max, resting_hr, max_hr, lactate_threshold_hr, lactate_threshold_pace_seconds_per_km, lactate_threshold_power_watts, updated_at";

export async function fetchPerformanceProfile(profileId: string): Promise<PerformanceProfile | null> {
  const { data, error } = await supabase
    .from("performance_profiles")
    .select(PERFORMANCE_PROFILE_COLUMNS)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function upsertPerformanceProfile(
  input: NewPerformanceProfile
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("performance_profiles")
    .upsert(input, { onConflict: "profile_id" });

  return { error: error?.message ?? null };
}
