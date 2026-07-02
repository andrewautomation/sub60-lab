import { BikeDraft } from "@/types/import";
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
const AVG_POWER_ALIASES = ["Avg Power"];
const NORMALIZED_POWER_ALIASES = [
  "Normalized Power® (NP®)",
  "Normalized Power (NP)",
  "Normalized Power NP",
  "Normalized Power",
];
const CADENCE_ALIASES = ["Avg Bike Cadence"];
const AVG_HR_ALIASES = ["Avg HR"];
const MAX_HR_ALIASES = ["Max HR"];
const AVG_SPEED_ALIASES = ["Avg Speed"];

/**
 * Best-effort field extraction only — nothing is rejected here. Missing or
 * unparseable values simply become `null`; lib/validators/validateBike.ts
 * decides what's actually required to save the activity.
 */
export function normalizeBikeRecord(record: Record<string, string>): BikeDraft {
  return {
    title: findField(record, TITLE_ALIASES),
    test_date: parseDateToIso(findField(record, DATE_ALIASES)),
    distance_km: parseNumber(findField(record, DISTANCE_ALIASES)),
    time_seconds: parseDurationToSeconds(findField(record, TIME_ALIASES)),
    avg_power: parseInteger(findField(record, AVG_POWER_ALIASES)),
    normalized_power: parseInteger(
      findField(record, NORMALIZED_POWER_ALIASES)
    ),
    cadence: parseInteger(findField(record, CADENCE_ALIASES)),
    avg_hr: parseInteger(findField(record, AVG_HR_ALIASES)),
    max_hr: parseInteger(findField(record, MAX_HR_ALIASES)),
    avg_speed_kmh: parseNumber(findField(record, AVG_SPEED_ALIASES)),
  };
}
