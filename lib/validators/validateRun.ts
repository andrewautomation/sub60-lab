import { ParsedRunActivity, RunDraft, ValidationResult } from "@/types/import";
import { warnIfOutOfRange } from "./shared";

/**
 * Gates a RunDraft into a save-ready ParsedRunActivity. Required fields
 * (date, distance, time) missing or non-positive are hard errors. Optional
 * fields with implausible values are soft warnings — still importable.
 */
export function validateRun(
  draft: RunDraft,
  row: number
): ValidationResult<ParsedRunActivity> {
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
    warnIfOutOfRange(draft.cadence, 60, 250, "Cadence", "spm"),
  ].filter((warning): warning is string => warning !== null);

  return {
    ok: true,
    warnings,
    activity: {
      kind: "run",
      title: draft.title,
      test_date: draft.test_date,
      distance_km: draft.distance_km,
      time_seconds: draft.time_seconds,
      pace_per_km: draft.pace_per_km,
      cadence: draft.cadence,
      avg_hr: draft.avg_hr,
      max_hr: draft.max_hr,
      warnings,
    },
  };
}
