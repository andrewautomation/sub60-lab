import { ActivityParseResult, ParsedActivity } from "@/types/import";
import { parseCsvRecords } from "./csvParser";
import { detectActivity } from "./activityDetector";
import { normalizeSwimRecord } from "@/lib/normalizers/swimNormalizer";
import { normalizeBikeRecord } from "@/lib/normalizers/bikeNormalizer";
import { normalizeRunRecord } from "@/lib/normalizers/runNormalizer";
import { validateSwim } from "@/lib/validators/validateSwim";
import { validateBike } from "@/lib/validators/validateBike";
import { validateRun } from "@/lib/validators/validateRun";

/**
 * Parses a Garmin Connect "Activities" CSV export into typed, normalized
 * activities. Pure function: no Supabase, no React, no file/DOM APIs —
 * callers are responsible for turning a File into text.
 *
 * Pipeline per row: detect (Activity Type -> Title -> distance heuristic)
 * -> normalize (best-effort field extraction, lib/normalizers/) -> validate
 * (required-field gate + sanity warnings, lib/validators/).
 */
export function parseGarminCsv(csvText: string): ActivityParseResult {
  const records = parseCsvRecords(csvText);

  const activities: ParsedActivity[] = [];
  const issues: ActivityParseResult["issues"] = [];

  if (records.length === 0) {
    issues.push({
      row: 0,
      message: "The file does not contain any activity rows.",
    });
    return { activities, issues };
  }

  records.forEach((record, index) => {
    const row = index + 2; // +1 for header row, +1 for 1-based indexing
    const detection = detectActivity(record);

    if (!detection) {
      issues.push({
        row,
        message:
          "Could not determine activity type (expected Pool Swim, Cycling, or Running).",
      });
      return;
    }

    const detectionWarning = detection.confident
      ? null
      : `Activity type guessed as "${detection.kind}" (${detection.note}) — please verify.`;

    const result =
      detection.kind === "swim"
        ? validateSwim(normalizeSwimRecord(record), row)
        : detection.kind === "bike"
        ? validateBike(normalizeBikeRecord(record), row)
        : validateRun(normalizeRunRecord(record), row);

    if (!result.ok) {
      issues.push(result.issue);
      return;
    }

    const warnings = detectionWarning
      ? [detectionWarning, ...result.warnings]
      : result.warnings;

    activities.push({ ...result.activity, warnings });
  });

  return { activities, issues };
}
