import { Athlete } from "@/types/athlete";
import { PerformanceProfile } from "@/types/performanceProfile";
import { SportKey } from "@/lib/sports/types";
import { ageFromDateOfBirth } from "@/lib/athlete/domain";
import { BENCHMARK_FIELDS_BY_SPORT, BenchmarkFieldConfig } from "@/lib/benchmarks/fields";
import { BadgeSex, BadgeTier, percentileLabel, scoreBenchmark, scoreBikeWkg, tierForGrade } from "./standards";

const SPORT_IDENTITY_LABEL: Record<SportKey, string> = {
  running: "Runner",
  swimming: "Swimmer",
  cycling: "Cyclist",
  triathlon: "Triathlete",
  duathlon: "Duathlete",
  aquathlon: "Aquathlete",
};

/** Direct event-catalog-key → benchmark-field mapping, for the handful of
 * standard distances/formats that exist in both places — lets the badge
 * prefer whichever benchmark matches the athlete's actual chosen event
 * over just picking their best-scoring one. */
const EVENT_KEY_TO_BENCHMARK_FIELD: Record<string, keyof PerformanceProfile> = {
  "running:run_5k": "run_5k_seconds",
  "running:run_10k": "run_10k_seconds",
  "running:run_half_marathon": "run_half_marathon_seconds",
  "running:run_marathon": "run_marathon_seconds",
  "swimming:swim_100m": "swim_100m_seconds",
  "swimming:swim_400m": "swim_400m_seconds",
  "swimming:swim_1500m": "swim_1500m_seconds",
  "triathlon:super_sprint": "triathlon_super_sprint_seconds",
  "triathlon:sprint": "triathlon_sprint_seconds",
  "triathlon:olympic": "triathlon_olympic_seconds",
  "triathlon:half_iron": "triathlon_half_iron_seconds",
  "triathlon:full_iron": "triathlon_full_iron_seconds",
  "duathlon:duathlon_sprint": "duathlon_sprint_seconds",
  "duathlon:duathlon_standard": "duathlon_standard_seconds",
  "aquathlon:aquathlon_sprint": "aquathlon_sprint_seconds",
  "aquathlon:aquathlon_standard": "aquathlon_standard_seconds",
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

/**
 * The dashboard identity badge — "as a Runner/Swimmer/Cyclist/Triathlete/
 * Duathlete/Aquathlete," estimated from the athlete's own self-reported
 * standard-distance/format benchmarks (never from logged test history —
 * see lib/benchmarks/fields.ts for which fields apply to which sport).
 * Every branch that can't produce a real number returns a graceful
 * `available: false` with a specific reason rather than a fabricated
 * default.
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

  if (sportKey === "cycling") {
    if (profile.ftp_watts === null) {
      return unavailable("Add your 20-min power in Settings to see this.", sportLabel);
    }
    if (athlete.weight_kg === null) {
      return unavailable("Add your weight in Settings to see this.", sportLabel);
    }
    const wkg = profile.ftp_watts / athlete.weight_kg;
    return available(scoreBikeWkg(wkg, sex), sportLabel, age);
  }

  const fields = BENCHMARK_FIELDS_BY_SPORT[sportKey];
  const filled = fields
    .map((field) => ({ field, seconds: profile[field.key] as number | null }))
    .filter((f): f is { field: BenchmarkFieldConfig; seconds: number } => f.seconds !== null && f.seconds > 0);

  if (filled.length === 0) {
    return unavailable("Add a benchmark time in Settings to see this.", sportLabel);
  }

  const scored = filled
    .map((f) => ({ ...f, grade: scoreBenchmark(f.field.key, f.seconds, sex, age) }))
    .filter((f): f is { field: BenchmarkFieldConfig; seconds: number; grade: number } => f.grade !== null);

  if (scored.length === 0) {
    return unavailable("Add a benchmark time in Settings to see this.", sportLabel);
  }

  const preferredField = EVENT_KEY_TO_BENCHMARK_FIELD[athlete.primary_event_id];
  const preferred = scored.find((f) => f.field.key === preferredField);
  const chosen = preferred ?? scored.reduce((best, current) => (current.grade > best.grade ? current : best));

  return available(chosen.grade, sportLabel, age);
}
