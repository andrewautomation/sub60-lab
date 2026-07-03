import { supabase } from "@/lib/supabase";
import { NewPerformanceProfile, PerformanceProfile } from "@/types/performanceProfile";

const PERFORMANCE_PROFILE_COLUMNS =
  "profile_id, ftp_watts, critical_power_watts, css_seconds_per_100m, threshold_pace_seconds_per_km, vo2max, resting_hr, max_hr, lactate_threshold_hr, lactate_threshold_pace_seconds_per_km, lactate_threshold_power_watts, run_5k_seconds, run_10k_seconds, run_half_marathon_seconds, run_marathon_seconds, swim_50m_seconds, swim_100m_seconds, swim_400m_seconds, swim_1500m_seconds, triathlon_super_sprint_seconds, triathlon_sprint_seconds, triathlon_olympic_seconds, triathlon_half_iron_seconds, triathlon_full_iron_seconds, duathlon_sprint_seconds, duathlon_standard_seconds, aquathlon_sprint_seconds, aquathlon_standard_seconds, updated_at";

export async function fetchPerformanceProfile(profileId: string): Promise<PerformanceProfile | null> {
  const { data, error } = await supabase
    .from("performance_profiles")
    .select(PERFORMANCE_PROFILE_COLUMNS)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/** Partial by design: callers (onboarding's optional Benchmarks step,
 * Settings) usually know only a few fields at a time. Supabase upserts
 * only the columns present in `input` — an unlisted column keeps its
 * existing value on conflict rather than being cleared to null. */
export async function upsertPerformanceProfile(
  input: Partial<NewPerformanceProfile> & Pick<NewPerformanceProfile, "profile_id">
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("performance_profiles")
    .upsert(input, { onConflict: "profile_id" });

  return { error: error?.message ?? null };
}
