import { SwimTest } from "@/types/swim";
import {
  ConsistencyResult,
  MonthlySummary,
  PerformanceScore,
  TrendResult,
} from "@/types/analytics";
import { SUB_60_SPRINT_TARGETS } from "./targets";
import {
  average,
  consistencyFromValues,
  detectTrend,
  groupByMonth,
  median,
  scoreAgainstTarget,
  sortByDateAscending,
  takeMostRecent,
  trendToScore,
  weightedScore,
} from "./shared";

/** Relative weights for getPerformanceScore's composite 0-100 score. */
const SCORE_WEIGHTS = { target: 0.5, trend: 0.3, consistency: 0.2 };

export function getPersonalBest(tests: SwimTest[]): SwimTest | null {
  if (tests.length === 0) return null;
  return tests.reduce((best, current) =>
    current.time_seconds < best.time_seconds ? current : best
  );
}

export function getWorstPerformance(tests: SwimTest[]): SwimTest | null {
  if (tests.length === 0) return null;
  return tests.reduce((worst, current) =>
    current.time_seconds > worst.time_seconds ? current : worst
  );
}

export function getAverageTime(tests: SwimTest[]): number | null {
  return average(tests.map((t) => t.time_seconds));
}

export function getMedianTime(tests: SwimTest[]): number | null {
  return median(tests.map((t) => t.time_seconds));
}

/** Average pace in seconds per 100m, derived from distance/time rather than
 * the imported `pace_per_100m` string (which may be null or inconsistent). */
export function getAveragePace(tests: SwimTest[]): number | null {
  const paces = tests
    .filter((t) => t.distance_m > 0)
    .map((t) => (t.time_seconds / t.distance_m) * 100);
  return average(paces);
}

export function getAverageSwolf(tests: SwimTest[]): number | null {
  const values = tests
    .map((t) => t.swolf)
    .filter((v): v is number => v !== null);
  return average(values);
}

/** Seconds improved between the first and latest test (positive = faster). */
export function getImprovement(tests: SwimTest[]): number | null {
  if (tests.length < 2) return null;
  const chronological = sortByDateAscending(tests);
  const first = chronological[0];
  const latest = chronological[chronological.length - 1];
  return first.time_seconds - latest.time_seconds;
}

export function getImprovementPercentage(tests: SwimTest[]): number | null {
  if (tests.length < 2) return null;
  const chronological = sortByDateAscending(tests);
  const first = chronological[0];
  const improvement = getImprovement(tests);
  if (improvement === null || first.time_seconds === 0) return null;
  return (improvement / first.time_seconds) * 100;
}

/** Positive = still slower than target; negative = already beating it. */
export function getGapToTarget(
  tests: SwimTest[],
  targetSeconds: number = SUB_60_SPRINT_TARGETS.swim.time_seconds
): number | null {
  const pb = getPersonalBest(tests);
  if (!pb) return null;
  return pb.time_seconds - targetSeconds;
}

export function getConsistency(tests: SwimTest[], windowSize = 5): ConsistencyResult {
  const recent = takeMostRecent(tests, windowSize);
  return consistencyFromValues(recent.map((t) => t.time_seconds));
}

export function getBestMonth(tests: SwimTest[]): MonthlySummary | null {
  if (tests.length === 0) return null;

  const groups = groupByMonth(tests);
  let best: MonthlySummary | null = null;

  for (const [month, monthTests] of groups) {
    const averageValue = average(monthTests.map((t) => t.time_seconds));
    if (averageValue === null) continue;
    if (!best || averageValue < best.averageValue) {
      best = { month, averageValue, sampleSize: monthTests.length };
    }
  }

  return best;
}

export function getLatestTrend(tests: SwimTest[], windowSize = 3): TrendResult {
  const chronological = sortByDateAscending(tests);
  return detectTrend(
    chronological.map((t) => t.time_seconds),
    "lowerIsBetter",
    windowSize
  );
}

/** 0-100, weighted from gap-to-target (50%), recent trend (30%), and
 * consistency (20%). Returns null when there isn't at least one test. */
export function getPerformanceScore(
  tests: SwimTest[],
  targetSeconds: number = SUB_60_SPRINT_TARGETS.swim.time_seconds
): PerformanceScore | null {
  const pb = getPersonalBest(tests);
  if (!pb) return null;

  const targetScore = scoreAgainstTarget(pb.time_seconds, targetSeconds, "lowerIsBetter");
  const trendScore = trendToScore(getLatestTrend(tests));
  const consistencyScore = getConsistency(tests).score ?? 60;

  const breakdown = { targetScore, trendScore, consistencyScore };

  const score = weightedScore([
    { score: targetScore, weight: SCORE_WEIGHTS.target },
    { score: trendScore, weight: SCORE_WEIGHTS.trend },
    { score: consistencyScore, weight: SCORE_WEIGHTS.consistency },
  ]);

  return { score, breakdown };
}
