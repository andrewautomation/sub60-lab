/**
 * DB row for the `performance_profiles` table — one row per athlete, every
 * field optional since these are often unknown when an athlete starts.
 * This is the athlete's self-reported/derived physiological baseline
 * (FTP, CSS, VO2max, HR zones, ...) — distinct from raw test history in
 * swim_tests/bike_tests/run_tests, which is measured, dated, and
 * per-session. Analytics, race prediction, and AI coaching each read
 * whichever of the two is more specific to the calculation at hand.
 */
export interface PerformanceProfile {
  profile_id: string;
  ftp_watts: number | null;
  critical_power_watts: number | null;
  /** Critical Swim Speed pace, seconds per 100m. */
  css_seconds_per_100m: number | null;
  threshold_pace_seconds_per_km: number | null;
  vo2max: number | null;
  resting_hr: number | null;
  max_hr: number | null;
  lactate_threshold_hr: number | null;
  lactate_threshold_pace_seconds_per_km: number | null;
  lactate_threshold_power_watts: number | null;
  /** Self-reported standard-distance/format benchmark times — see
   * lib/benchmarks/fields.ts for which of these apply to which sport, and
   * lib/ranking for how they become the dashboard identity badge. Entered
   * once at onboarding (skippable) or later in Settings, never derived
   * from swim_tests/bike_tests/run_tests. */
  run_5k_seconds: number | null;
  run_10k_seconds: number | null;
  run_half_marathon_seconds: number | null;
  run_marathon_seconds: number | null;
  swim_50m_seconds: number | null;
  swim_100m_seconds: number | null;
  swim_400m_seconds: number | null;
  swim_1500m_seconds: number | null;
  triathlon_super_sprint_seconds: number | null;
  triathlon_sprint_seconds: number | null;
  triathlon_olympic_seconds: number | null;
  triathlon_half_iron_seconds: number | null;
  triathlon_full_iron_seconds: number | null;
  duathlon_sprint_seconds: number | null;
  duathlon_standard_seconds: number | null;
  aquathlon_sprint_seconds: number | null;
  aquathlon_standard_seconds: number | null;
  updated_at: string;
}

export type NewPerformanceProfile = Omit<PerformanceProfile, "updated_at">;
