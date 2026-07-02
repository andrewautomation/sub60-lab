import { ParsedSwimActivity, SwimDraft, ValidationResult } from "@/types/import";
import { warnIfOutOfRange } from "./shared";

/**
 * Gates a SwimDraft into a save-ready ParsedSwimActivity. Required fields
 * (date, distance, time) missing or non-positive are hard errors. Optional
 * fields with implausible values are soft warnings — still importable.
 */
export function validateSwim(
  draft: SwimDraft,
  row: number
): ValidationResult<ParsedSwimActivity> {
  if (!draft.test_date) {
    return {
      ok: false,
      issue: { row, field: "Date", message: "Missing or unreadable date." },
    };
  }

  if (draft.distance_m === null || draft.distance_m <= 0) {
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
    warnIfOutOfRange(draft.swolf, 10, 200, "SWOLF", ""),
    warnIfOutOfRange(draft.stroke_rate, 10, 100, "Stroke rate", "spm"),
    warnIfOutOfRange(draft.pool_length_m, 10, 100, "Pool length", "m"),
  ].filter((warning): warning is string => warning !== null);

  return {
    ok: true,
    warnings,
    activity: {
      kind: "swim",
      title: draft.title,
      test_date: draft.test_date,
      distance_m: draft.distance_m,
      time_seconds: draft.time_seconds,
      pace_per_100m: draft.pace_per_100m,
      swolf: draft.swolf,
      total_strokes: draft.total_strokes,
      stroke_rate: draft.stroke_rate,
      avg_hr: draft.avg_hr,
      max_hr: draft.max_hr,
      pool_length_m: draft.pool_length_m,
      warnings,
    },
  };
}
