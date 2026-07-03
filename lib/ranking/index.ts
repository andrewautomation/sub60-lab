import { Athlete } from "@/types/athlete";
import { PerformanceProfile } from "@/types/performanceProfile";
import { SportKey } from "@/lib/sports/types";
import { Discipline } from "@/lib/race/models";
import { getDisciplinesForSport } from "@/lib/sports/registry";
import { ageFromDateOfBirth } from "@/lib/athlete/domain";
import { BenchmarkFieldConfig, getFieldsForDiscipline } from "@/lib/benchmarks/fields";
import { BadgeSex, BadgeTier, percentileLabel, scoreBenchmark, scoreBikeWkg, tierForGrade } from "./standards";

const SPORT_IDENTITY_LABEL: Record<SportKey, string> = {
  running: "Runner",
  swimming: "Swimmer",
  cycling: "Cyclist",
  triathlon: "Triathlete",
  duathlon: "Duathlete",
  aquathlon: "Aquathlete",
};

/** Event-catalog-key → benchmark-field mapping for the single-discipline
 * sports only — lets the badge prefer whichever benchmark matches the
 * athlete's actual chosen event over just picking their best-scoring one.
 * Doesn't apply to multi-sport athletes: their primary_event_id names a
 * race *format* (e.g. "triathlon:olympic"), not a single-discipline
 * distance, so there's nothing to prefer — each discipline just uses its
 * own best-scoring filled field. */
const EVENT_KEY_TO_BENCHMARK_FIELD: Record<string, keyof PerformanceProfile> = {
  "running:run_5k": "run_5k_seconds",
  "running:run_10k": "run_10k_seconds",
  "running:run_half_marathon": "run_half_marathon_seconds",
  "running:run_marathon": "run_marathon_seconds",
  "swimming:swim_100m": "swim_100m_seconds",
  "swimming:swim_400m": "swim_400m_seconds",
  "swimming:swim_1500m": "swim_1500m_seconds",
};

export interface RankingBadgeResult {
  available: boolean;
  reason?: string;
  sportLabel: string;
  tier?: BadgeTier;
  percentileLabel?: string;
  ageCategoryLabel?: string;
}

function ageCategoryLabel(age: number): string {
  const bucketStart = Math.floor(age / 5) * 5;
  return `${bucketStart}-${bucketStart + 4}`;
}

function unavailable(reason: string, sportLabel: string): RankingBadgeResult {
  return { available: false, reason, sportLabel };
}

function available(gradePercent: number, sportLabel: string, age: number): RankingBadgeResult {
  return {
    available: true,
    sportLabel,
    tier: tierForGrade(gradePercent),
    percentileLabel: percentileLabel(gradePercent),
    ageCategoryLabel: ageCategoryLabel(age),
  };
}

/** Best age-graded score among this discipline's filled-in fields —
 * preferring the field matching the athlete's own primary event when this
 * is their only discipline (single-sport athletes), since "how close to
 * your own goal event" is more meaningful than "your single best stat." */
function scoreDiscipline(
  discipline: Discipline,
  profile: PerformanceProfile,
  sex: BadgeSex,
  age: number,
  preferredField: keyof PerformanceProfile | undefined
): number | null {
  if (discipline === "bike") return null; // handled separately (watts/kg, not a duration field)

  const scored = getFieldsForDiscipline(discipline)
    .map((field) => ({ field, seconds: profile[field.key] as number | null }))
    .filter((f): f is { field: BenchmarkFieldConfig; seconds: number } => f.seconds !== null && f.seconds > 0)
    .map((f) => ({ ...f, grade: scoreBenchmark(f.field.key, f.seconds, sex, age) }))
    .filter((f): f is { field: BenchmarkFieldConfig; seconds: number; grade: number } => f.grade !== null);

  if (scored.length === 0) return null;

  const preferred = preferredField ? scored.find((f) => f.field.key === preferredField) : undefined;
  return preferred ? preferred.grade : Math.max(...scored.map((f) => f.grade));
}

/**
 * The dashboard identity badge — "as a Runner/Swimmer/Cyclist/Triathlete/
 * Duathlete/Aquathlete," estimated from the athlete's own self-reported
 * standard-distance benchmarks (never from logged test history — see
 * lib/benchmarks/fields.ts). A multi-sport athlete is scored per
 * discipline they actually train, then combined weakest-link (same
 * "weakest discipline wins" convention lib/performance-engine/currentLevel.ts
 * already uses for its own multi-discipline Current Level score) —
 * skipping any discipline they haven't reported a benchmark for, rather
 * than failing the whole badge over one missing number.
 */
export function computeIdentityBadge(athlete: Athlete, profile: PerformanceProfile | null): RankingBadgeResult {
  const sportKey = athlete.primary_sport_id;
  const sportLabel = SPORT_IDENTITY_LABEL[sportKey];

  if (athlete.sex === "unspecified") {
    return unavailable("Add your sex in Settings to see this.", sportLabel);
  }
  const sex = athlete.sex as BadgeSex;

  const age = ageFromDateOfBirth(athlete);
  if (age === null) {
    return unavailable("Add your birth date in Settings to see this.", sportLabel);
  }

  if (!profile) {
    return unavailable("Add a benchmark in Settings to see this.", sportLabel);
  }

  const disciplines = getDisciplinesForSport(sportKey);
  const preferredField = disciplines.length === 1 ? EVENT_KEY_TO_BENCHMARK_FIELD[athlete.primary_event_id] : undefined;

  const grades: number[] = [];
  for (const discipline of disciplines) {
    if (discipline === "bike") {
      if (profile.ftp_watts !== null && athlete.weight_kg !== null) {
        grades.push(scoreBikeWkg(profile.ftp_watts / athlete.weight_kg, sex));
      }
      continue;
    }
    const grade = scoreDiscipline(discipline, profile, sex, age, preferredField);
    if (grade !== null) grades.push(grade);
  }

  if (grades.length === 0) {
    return unavailable("Add a benchmark in Settings to see this.", sportLabel);
  }

  return available(Math.min(...grades), sportLabel, age);
}
