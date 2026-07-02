import { BikeDraft, ParsedBikeActivity, ValidationResult } from "@/types/import";
import { warnIfOutOfRange } from "./shared";

/**
 * Gates a BikeDraft into a save-ready ParsedBikeActivity. Required fields
 * (date, distance, time) missing or non-positive are hard errors. Optional
 * fields with implausible values are soft warnings — still importable.
 */
export function validateBike(
  draft: BikeDraft,
  row: number
): ValidationResult<ParsedBikeActivity> {
  if (!draft.test_date) {
    return {
      ok: false,
      issue: { row, field: "Date", message: "Missing or unreadable date." },
    };
  }

  if (draft.distance_km === null || draft.distance_km <= 0) {
    return {
      ok: false,
      issue: {
        row,
        field: "Distance",
        message: "Missing or unreadable distance.",
      },
    };
  }

  if (draft.time_seconds === null || draft.time_seconds <= 0) {
    return {
      ok: false,
      issue: { row, field: "Time", message: "Missing or unreadable time." },
    };
  }

  const warnings = [
    warnIfOutOfRange(draft.avg_hr, 30, 230, "Avg HR", "bpm"),
    warnIfOutOfRange(draft.max_hr, 30, 230, "Max HR", "bpm"),
    warnIfOutOfRange(draft.avg_power, 0, 600, "Avg power", "W"),
    warnIfOutOfRange(draft.normalized_power, 0, 600, "Normalized power", "W"),
    warnIfOutOfRange(draft.cadence, 20, 140, "Cadence", "rpm"),
    warnIfOutOfRange(draft.avg_speed_kmh, 5, 70, "Avg speed", "km/h"),
  ].filter((warning): warning is string => warning !== null);

  return {
    ok: true,
    warnings,
    activity: {
      kind: "bike",
      title: draft.title,
      test_date: draft.test_date,
      distance_km: draft.distance_km,
      time_seconds: draft.time_seconds,
      avg_power: draft.avg_power,
      normalized_power: draft.normalized_power,
      cadence: draft.cadence,
      avg_hr: draft.avg_hr,
      max_hr: draft.max_hr,
      avg_speed_kmh: draft.avg_speed_kmh,
      warnings,
    },
  };
}
