import { BikeTest } from "@/types/bike";
import { PerformanceScore, TrendResult } from "@/types/analytics";
import { SUB_60_SPRINT_TARGETS } from "./targets";
import {
  average,
  consistencyFromValues,
  detectTrend,
  scoreAgainstTarget,
  sortByDateAscending,
  trendToScore,
  weightedScore,
} from "./shared";

/** Relative weights for getPerformanceScore's composite 0-100 score. */
const SCORE_WEIGHTS = { target: 0.5, trend: 0.3, consistency: 0.2 };

export function getFTPTrend(tests: BikeTest[], windowSize = 3): TrendResult {
  const withFtp = sortByDateAscending(tests).filter(
    (t): t is BikeTest & { ftp: number } => t.ftp !== null
  );
  return detectTrend(withFtp.map((t) => t.ftp), "higherIsBetter", windowSize);
}

export function getBestPower(tests: BikeTest[]): BikeTest | null {
  const withPower = tests.filter((t) => t.avg_power !== null);
  if (withPower.length === 0) return null;
  return withPower.reduce((best, current) =>
    (current.avg_power as number) > (best.avg_power as number) ? current : best
  );
}

export function getAveragePower(tests: BikeTest[]): number | null {
  const values = tests
    .map((t) => t.avg_power)
    .filter((v): v is number => v !== null);
  return average(values);
}

export function getAverageCadence(tests: BikeTest[]): number | null {
  const values = tests
    .map((t) => t.cadence)
    .filter((v): v is number => v !== null);
  return average(values);
}

/** Fastest test within `toleranceKm` of a 10km distance (real-world GPS
 * distances rarely land exactly on 10.00). */
export function getBest10km(tests: BikeTest[], toleranceKm = 0.5): BikeTest | null {
  const candidates = tests.filter(
    (t) => Math.abs(t.distance_km - 10) <= toleranceKm
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((best, current) =>
    current.time_seconds < best.time_seconds ? current : best
  );
}

/** Fastest average speed across all tests, used as the "personal best"
 * basis for scoring and race prediction (bike PB is speed, not a single
 * fixed distance the way swim/run tests usually are). */
export function getBestSpeed(tests: BikeTest[]): BikeTest | null {
  const withSpeed = tests.filter((t) => t.avg_speed_kmh !== null);
  if (withSpeed.length === 0) return null;
  return withSpeed.reduce((best, current) =>
    (current.avg_speed_kmh as number) > (best.avg_speed_kmh as number)
      ? current
      : best
  );
}

export function getSpeedTrend(tests: BikeTest[], windowSize = 3): TrendResult {
  const withSpeed = sortByDateAscending(tests).filter(
    (t): t is BikeTest & { avg_speed_kmh: number } => t.avg_speed_kmh !== null
  );
  return detectTrend(
    withSpeed.map((t) => t.avg_speed_kmh),
    "higherIsBetter",
    windowSize
  );
}

/** Watts improved between the first and latest test with recorded power
 * (positive = stronger). */
export function getPowerImprovement(tests: BikeTest[]): number | null {
  const withPower = sortByDateAscending(tests).filter(
    (t): t is BikeTest & { avg_power: number } => t.avg_power !== null
  );
  if (withPower.length < 2) return null;
  return (
    withPower[withPower.length - 1].avg_power - withPower[0].avg_power
  );
}

/** No default target — unlike time/speed/pace, this app has no canonical
 * FTP/power goal, so the caller must supply one explicitly. */
export function getGapToTargetPower(
  tests: BikeTest[],
  targetWatts: number
): number | null {
  const best = getBestPower(tests);
  if (!best || best.avg_power === null) return null;
  return targetWatts - best.avg_power;
}

/** Positive = still slower than target speed; negative = already beating it. */
export function getGapToTargetSpeed(
  tests: BikeTest[],
  targetSpeedKmh: number = SUB_60_SPRINT_TARGETS.bike.avg_speed_kmh
): number | null {
  const best = getBestSpeed(tests);
  if (!best || best.avg_speed_kmh === null) return null;
  return targetSpeedKmh - best.avg_speed_kmh;
}

/** 0-100, weighted from gap-to-target-speed (50%, the app's canonical bike
 * target), recent speed trend (30%), and consistency (20%). Power isn't
 * always recorded (e.g. indoor trainers without a power meter), so speed
 * is used as the always-available basis for scoring. */
export function getPerformanceScore(
  tests: BikeTest[],
  targetSpeedKmh: number = SUB_60_SPRINT_TARGETS.bike.avg_speed_kmh
): PerformanceScore | null {
  const best = getBestSpeed(tests);
  if (!best || best.avg_speed_kmh === null) return null;

  const targetScore = scoreAgainstTarget(
    best.avg_speed_kmh,
    targetSpeedKmh,
    "higherIsBetter"
  );
  const trendScore = trendToScore(getSpeedTrend(tests));
  const speedValues = tests
    .map((t) => t.avg_speed_kmh)
    .filter((v): v is number => v !== null);
  const consistencyScore = consistencyFromValues(speedValues).score ?? 60;

  const breakdown = { targetScore, trendScore, consistencyScore };

  const score = weightedScore([
    { score: targetScore, weight: SCORE_WEIGHTS.target },
    { score: trendScore, weight: SCORE_WEIGHTS.trend },
    { score: consistencyScore, weight: SCORE_WEIGHTS.consistency },
  ]);

  return { score, breakdown };
}
