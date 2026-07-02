import { RunDraft } from "@/types/import";
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
const CADENCE_ALIASES = ["Avg Run Cadence"];
const AVG_HR_ALIASES = ["Avg HR"];
const MAX_HR_ALIASES = ["Max HR"];

/**
 * Best-effort field extraction only — nothing is rejected here. Missing or
 * unparseable values simply become `null`; lib/validators/validateRun.ts
 * decides what's actually required to save the activity.
 */
export function normalizeRunRecord(record: Record<string, string>): RunDraft {
  return {
    title: findField(record, TITLE_ALIASES),
    test_date: parseDateToIso(findField(record, DATE_ALIASES)),
    distance_km: parseNumber(findField(record, DISTANCE_ALIASES)),
    time_seconds: parseDurationToSeconds(findField(record, TIME_ALIASES)),
    pace_per_km: findField(record, PACE_ALIASES),
    cadence: parseInteger(findField(record, CADENCE_ALIASES)),
    avg_hr: parseInteger(findField(record, AVG_HR_ALIASES)),
    max_hr: parseInteger(findField(record, MAX_HR_ALIASES)),
  };
}
