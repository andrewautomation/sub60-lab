import { ParsedActivity } from "@/types/import";
import { insertSwimTest } from "./swim.service";
import { insertBikeTest } from "./bike.service";
import { insertRunTest } from "./run.service";

/**
 * The single point where a parsed (and user-approved) activity becomes a
 * database write. Dispatches to the existing per-discipline service so the
 * import feature never talks to Supabase directly.
 */
export async function saveParsedActivity(
  activity: ParsedActivity
): Promise<{ error: string | null }> {
  if (activity.kind === "swim") {
    return insertSwimTest({
      test_date: activity.test_date,
      test_type: activity.title ?? "Garmin Import",
      distance_m: activity.distance_m,
      time_seconds: activity.time_seconds,
      pace_per_100m: activity.pace_per_100m,
      swolf: activity.swolf,
      total_strokes: activity.total_strokes,
      stroke_rate: activity.stroke_rate,
      avg_hr: activity.avg_hr,
      max_hr: activity.max_hr,
      pool_length_m: activity.pool_length_m,
      notes: null,
    });
  }

  if (activity.kind === "bike") {
    return insertBikeTest({
      test_date: activity.test_date,
      test_type: activity.title ?? "Garmin Import",
      distance_km: activity.distance_km,
      time_seconds: activity.time_seconds,
      avg_power: activity.avg_power,
      normalized_power: activity.normalized_power,
      max_power: null,
      avg_cadence: activity.cadence,
      avg_hr: activity.avg_hr,
      max_hr: activity.max_hr,
      avg_speed_kmh: activity.avg_speed_kmh,
      notes: null,
    });
  }

  return insertRunTest({
    test_date: activity.test_date,
    test_type: activity.title ?? "Garmin Import",
    distance_km: activity.distance_km,
    time_seconds: activity.time_seconds,
    pace_per_km: activity.pace_per_km,
    avg_cadence: activity.cadence,
    stride_length_m: null,
    avg_hr: activity.avg_hr,
    max_hr: activity.max_hr,
    notes: null,
  });
}
