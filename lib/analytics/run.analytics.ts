import { RunTest } from "@/types/run";
import { PerformanceScore, TrendResult } from "@/types/analytics";
import { SUB_60_SPRINT_TARGETS } from "./targets";
import {
  consistencyFromValues,
  detectTrend,
  scoreAgainstTarget,
  sortByDateAscending,
  trendToScore,
  weightedScore,
} from "./shared";

/** Relative weights for getPerformanceScore's composite 0-100 score. */
const SCORE_WEIGHTS = { target: 0.5, trend: 0.3, consistency: 0.2 };

function paceSecondsPerKm(test: RunTest): number {
  return test.time_seconds / test.distance_km;
}

/** Fastest test within `toleranceKm` of a 5km distance. */
export function getBest5k(tests: RunTest[], toleranceKm = 0.5): RunTest | null {
  const candidates = tests.filter((t) => Math.abs(t.distance_km - 5) <= toleranceKm);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, current) =>
    current.time_seconds < best.time_seconds ? current : best
  );
}

/** Fastest test within `toleranceKm` of this app's 2.5km target test
 * distance (tighter tolerance than getBest5k since it's the primary test). */
export function getBest2_5k(tests: RunTest[], toleranceKm = 0.3): RunTest | null {
  const candidates = tests.filter((t) => Math.abs(t.distance_km - 2.5) <= toleranceKm);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, current) =>
    current.time_seconds < best.time_seconds ? current : best
  );
}

/** Average pace in seconds per km, derived from distance/time rather than
 * the imported `pace_per_km` string (which may be null or inconsistent). */
export function getAveragePace(tests: RunTest[]): number | null {
  if (tests.length === 0) return null;
  const paces = tests.filter((t) => t.distance_km > 0).map(paceSecondsPerKm);
  if (paces.length === 0) return null;
  return paces.reduce((sum, p) => sum + p, 0) / paces.length;
}

export function getCadenceTrend(tests: RunTest[], windowSize = 3): TrendResult {
  const withCadence = sortByDateAscending(tests).filter(
    (t): t is RunTest & { cadence: number } => t.cadence !== null
  );
  return detectTrend(withCadence.map((t) => t.cadence), "higherIsBetter", windowSize);
}

/** Seconds/km improved between the first and latest test, comparable across
 * differing test distances since it's pace-based rather than raw time. */
export function getImprovement(tests: RunTest[]): number | null {
  if (tests.length < 2) return null;
  const chronological = sortByDateAscending(tests);
  const first = paceSecondsPerKm(chronological[0]);
  const latest = paceSecondsPerKm(chronological[chronological.length - 1]);
  return first - latest;
}

/** Fastest pace overall regardless of test distance — the run "personal
 * best" basis for scoring and race prediction. */
export function getBestPace(tests: RunTest[]): RunTest | null {
  const withDistance = tests.filter((t) => t.distance_km > 0);
  if (withDistance.length === 0) return null;
  return withDistance.reduce((best, current) =>
    paceSecondsPerKm(current) < paceSecondsPerKm(best) ? current : best
  );
}

/** Positive = still slower than target pace; negative = already beating it. */
export function getGapToTargetPace(
  tests: RunTest[],
  targetPaceSecondsPerKm: number = SUB_60_SPRINT_TARGETS.run.pace_seconds_per_km
): number | null {
  const best = getBestPace(tests);
  if (!best) return null;
  return paceSecondsPerKm(best) - targetPaceSecondsPerKm;
}

/** 0-100, weighted from gap-to-target-pace (50%), recent pace trend (30%),
 * and consistency (20%). */
export function getPerformanceScore(
  tests: RunTest[],
  targetPaceSecondsPerKm: number = SUB_60_SPRINT_TARGETS.run.pace_seconds_per_km
): PerformanceScore | null {
  const best = getBestPace(tests);
  if (!best) return null;

  const bestPace = paceSecondsPerKm(best);
  const targetScore = scoreAgainstTarget(bestPace, targetPaceSecondsPerKm, "lowerIsBetter");

  const chronologicalPaces = sortByDateAscending(tests).map(paceSecondsPerKm);
  const trendScore = trendToScore(detectTrend(chronologicalPaces, "lowerIsBetter"));
  const consistencyScore = consistencyFromValues(chronologicalPaces).score ?? 60;

  const breakdown = { targetScore, trendScore, consistencyScore };

  const score = weightedScore([
    { score: targetScore, weight: SCORE_WEIGHTS.target },
    { score: trendScore, weight: SCORE_WEIGHTS.trend },
    { score: consistencyScore, weight: SCORE_WEIGHTS.consistency },
  ]);

  return { score, breakdown };
}
