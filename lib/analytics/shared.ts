import { BetterDirection, ConsistencyResult, Trend, TrendResult } from "@/types/analytics";

/**
 * Statistical and scoring primitives shared by every lib/analytics/*.ts
 * file. Kept internal to the analytics engine — nothing here is Garmin-,
 * Supabase-, or discipline-specific.
 */

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null;

  const mean = average(values) as number;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length;

  return Math.sqrt(variance);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Amateur endurance test times/speeds typically vary run-to-run by roughly
 * 0-20%. That range is mapped linearly onto a 100-0 consistency score.
 */
export function consistencyFromValues(values: number[]): ConsistencyResult {
  const stdDev = standardDeviation(values);
  const mean = average(values);

  if (stdDev === null || mean === null || mean === 0) {
    return { standardDeviation: stdDev, coefficientOfVariation: null, score: null };
  }

  const coefficientOfVariation = stdDev / mean;
  const score = clamp(Math.round(100 - coefficientOfVariation * 500), 0, 100);

  return { standardDeviation: stdDev, coefficientOfVariation, score };
}

/**
 * Compares a chronologically-ordered recent window against the window
 * immediately before it and classifies the change as improving / stable /
 * declining relative to `stableThresholdPercent`.
 */
export function detectTrend(
  chronologicalValues: number[],
  direction: BetterDirection,
  windowSize = 3,
  stableThresholdPercent = 3
): TrendResult {
  if (chronologicalValues.length < 2) {
    return {
      trend: "stable",
      changePercent: null,
      recentAverage: chronologicalValues[0] ?? null,
      priorAverage: null,
    };
  }

  const effectiveWindow = Math.max(
    1,
    Math.min(windowSize, Math.floor(chronologicalValues.length / 2))
  );
  const recentSlice = chronologicalValues.slice(-effectiveWindow);
  const priorSlice = chronologicalValues.slice(
    -2 * effectiveWindow,
    -effectiveWindow
  );

  const recentAverage = average(recentSlice);
  const priorAverage = average(priorSlice);

  if (recentAverage === null || priorAverage === null || priorAverage === 0) {
    return { trend: "stable", changePercent: null, recentAverage, priorAverage };
  }

  const changePercent = ((recentAverage - priorAverage) / priorAverage) * 100;
  const signedImprovement =
    direction === "lowerIsBetter" ? -changePercent : changePercent;

  const trend: Trend =
    signedImprovement > stableThresholdPercent
      ? "improving"
      : signedImprovement < -stableThresholdPercent
      ? "declining"
      : "stable";

  return { trend, changePercent, recentAverage, priorAverage };
}

/** Maps a TrendResult onto a 0-100 score, capped at ±10% change magnitude
 * so a single volatile session can't dominate the composite performance
 * score (trend is one of three weighted inputs, see getPerformanceScore). */
export function trendToScore(trend: TrendResult): number {
  const magnitude =
    trend.changePercent === null ? 0 : Math.min(Math.abs(trend.changePercent), 10);

  if (trend.trend === "improving") return clamp(Math.round(60 + magnitude * 4), 0, 100);
  if (trend.trend === "declining") return clamp(Math.round(60 - magnitude * 4), 0, 100);
  return 60;
}

/** 0-100: 100 once `actual` reaches/beats `target`, scaling down smoothly
 * the further away it is (never negative, never exceeds 100). */
export function scoreAgainstTarget(
  actual: number,
  target: number,
  direction: BetterDirection
): number {
  if (target <= 0 || actual <= 0) return 0;

  const ratio = direction === "lowerIsBetter" ? target / actual : actual / target;
  if (ratio >= 1) return 100;

  return clamp(Math.round(ratio * 100), 0, 100);
}

export function weightedScore(
  components: { score: number; weight: number }[]
): number {
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;

  const weighted = components.reduce((sum, c) => sum + c.score * c.weight, 0);
  return clamp(Math.round(weighted / totalWeight), 0, 100);
}

/**
 * Peter Riegel's endurance race-time prediction formula (1977):
 * T2 = T1 x (D2/D1)^exponent. Used to project a known effort onto a
 * different race distance. Accuracy degrades at extreme extrapolation
 * ratios (e.g. 400m swim -> 1500m) — treat results as rough estimates.
 */
export function riegelPredict(
  knownTimeSeconds: number,
  knownDistance: number,
  targetDistance: number,
  exponent = 1.06
): number {
  if (knownDistance <= 0 || targetDistance <= 0) return knownTimeSeconds;
  return knownTimeSeconds * Math.pow(targetDistance / knownDistance, exponent);
}

export function sortByDateAscending<T extends { test_date: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => a.test_date.localeCompare(b.test_date));
}

/**
 * Drops interval-style reps (a Test Type with `reps` set — see
 * lib/benchmarks/fields.ts / components/tests/TestForm.tsx) from any
 * "personal best / continuous effort" calculation. A 400m rep pace run at
 * track speed is not a fair personal-best/current-level/race-prediction
 * input alongside a continuous 5K time trial — the same reason the
 * per-row Goal % column already skips interval tests. Shared across
 * RunTest/SwimTest/BikeTest since all three carry the same test_type_id
 * shape; a test with no type (legacy/unsorted) is always kept.
 */
export function excludeIntervalTests<T extends { test_type_id: string | null }>(
  tests: T[],
  testTypes: { id: string; reps: number | null }[]
): T[] {
  const intervalTypeIds = new Set(testTypes.filter((t) => t.reps !== null).map((t) => t.id));
  return tests.filter((t) => !t.test_type_id || !intervalTypeIds.has(t.test_type_id));
}

export function takeMostRecent<T extends { test_date: string }>(
  items: T[],
  count: number
): T[] {
  return sortByDateAscending(items).slice(-count);
}

/** Most recently dated test, or null for an empty list — the "latest
 * result" every discipline's dashboard/history view needs. */
export function getLatestTest<T extends { test_date: string }>(items: T[]): T | null {
  if (items.length === 0) return null;
  const chronological = sortByDateAscending(items);
  return chronological[chronological.length - 1];
}

export function groupByMonth<T extends { test_date: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const month = item.test_date.slice(0, 7);
    const existing = groups.get(month);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(month, [item]);
    }
  }

  return groups;
}
