import { SwimDraft } from "@/types/import";
import {
  findField,
  parseDateToIso,
  parseDurationToSeconds,
  parseInteger,
  parseNumber,
} from "@/lib/parser/fieldUtils";

const DATE_ALIASES = ["Date"];
const TITLE_ALIASES = ["Title"];
const DISTANCE_ALIASES = ["Distance"];
const TIME_ALIASES = ["Time", "Moving Time", "Elapsed Time"];
const PACE_ALIASES = ["Avg Pace"];
const SWOLF_ALIASES = ["Avg Swolf", "Avg. Swolf", "Swolf"];
const STROKES_ALIASES = ["Total Strokes", "Number of Strokes"];
const STROKE_RATE_ALIASES = ["Avg Swim Cadence", "Avg. Swim Cadence"];
const AVG_HR_ALIASES = ["Avg HR"];
const MAX_HR_ALIASES = ["Max HR"];
const POOL_LENGTH_ALIASES = ["Pool Length"];

/**
 * Best-effort field extraction only — nothing is rejected here. Missing or
 * unparseable values simply become `null`; lib/validators/validateSwim.ts
 * decides what's actually required to save the activity.
 */
export function normalizeSwimRecord(record: Record<string, string>): SwimDraft {
  const distanceKm = parseNumber(findField(record, DISTANCE_ALIASES));

  return {
    title: findField(record, TITLE_ALIASES),
    test_date: parseDateToIso(findField(record, DATE_ALIASES)),
    // Garmin's Distance column is exported in kilometers regardless of
    // activity type; pool swims are stored in meters throughout the app.
    distance_m: distanceKm === null ? null : Math.round(distanceKm * 1000),
    time_seconds: parseDurationToSeconds(findField(record, TIME_ALIASES)),
    pace_per_100m: findField(record, PACE_ALIASES),
    swolf: parseInteger(findField(record, SWOLF_ALIASES)),
    total_strokes: parseInteger(findField(record, STROKES_ALIASES)),
    stroke_rate: parseInteger(findField(record, STROKE_RATE_ALIASES)),
    avg_hr: parseInteger(findField(record, AVG_HR_ALIASES)),
    max_hr: parseInteger(findField(record, MAX_HR_ALIASES)),
    pool_length_m: parseInteger(findField(record, POOL_LENGTH_ALIASES)),
  };
}
