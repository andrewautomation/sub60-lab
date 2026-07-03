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
  updated_at: string;
}

export type NewPerformanceProfile = Omit<PerformanceProfile, "updated_at">;
