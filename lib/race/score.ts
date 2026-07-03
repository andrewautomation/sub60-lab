import { BikeTest } from "@/types/bike";
import { RunTest } from "@/types/run";
import { SwimTest } from "@/types/swim";
import { clamp, consistencyFromValues, sortByDateAscending } from "@/lib/analytics/shared";
import { ConfidenceFactorScores, ConfidenceLevel, ConfidenceResult } from "./models";

/**
 * Confidence Model.
 *
 * Relative weights combining the three confidence factors into one
 * per-discipline score. Sample size and recency matter slightly more than
 * raw consistency: a single very consistent test is a weaker basis for
 * predicting a whole race than a handful of recent, reasonably consistent
 * ones.
 */
const CONFIDENCE_WEIGHTS = { sampleSize: 0.35, recency: 0.35, consistency: 0.3 };

/** Tests-in-window count that maps to a full sample-size score of 100. */
const FULL_CONFIDENCE_SAMPLE_SIZE = 5;

/** Days since the most recent test at/under which recency scores 100;
 * scales down linearly to 0 by STALE_AFTER_DAYS. */
const FRESH_WITHIN_DAYS = 14;
const STALE_AFTER_DAYS = 120;

const LEVEL_THRESHOLDS = { high: 75, medium: 45 };

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function sampleSizeScore(count: number): number {
  return clamp(Math.round((count / FULL_CONFIDENCE_SAMPLE_SIZE) * 100), 0, 100);
}

function recencyScore(mostRecentTestDate: string, referenceDate: Date): number {
  const daysSince = Math.max(
    0,
    (referenceDate.getTime() - new Date(mostRecentTestDate).getTime()) / MS_PER_DAY
  );
  if (daysSince <= FRESH_WITHIN_DAYS) return 100;
  if (daysSince >= STALE_AFTER_DAYS) return 0;
  const range = STALE_AFTER_DAYS - FRESH_WITHIN_DAYS;
  return clamp(Math.round(100 - ((daysSince - FRESH_WITHIN_DAYS) / range) * 100), 0, 100);
}

function levelFromScore(score: number): ConfidenceLevel {
  if (score >= LEVEL_THRESHOLDS.high) return "high";
  if (score >= LEVEL_THRESHOLDS.medium) return "medium";
  return "low";
}

function combineFactors(sampleSize: number, recency: number, consistency: number): ConfidenceFactorScores {
  const overallScore = clamp(
    Math.round(
      sampleSize * CONFIDENCE_WEIGHTS.sampleSize +
        recency * CONFIDENCE_WEIGHTS.recency +
        consistency * CONFIDENCE_WEIGHTS.consistency
    ),
    0,
    100
  );
  return { sampleSizeScore: sampleSize, recencyScore: recency, consistencyScore: consistency, overallScore };
}

/** `chronologicalDates`/`chronologicalValues` must already be sorted oldest
 * to newest and index-aligned (one value per date). */
function disciplineConfidence(
  chronologicalDates: string[],
  chronologicalValues: number[],
  rollingWindow: number,
  referenceDate: Date
): ConfidenceFactorScores {
  if (chronologicalDates.length === 0) {
    return { sampleSizeScore: 0, recencyScore: 0, consistencyScore: 0, overallScore: 0 };
  }

  const mostRecentDate = chronologicalDates[chronologicalDates.length - 1];
  const recentValues = chronologicalValues.slice(-rollingWindow);
  const consistency = consistencyFromValues(recentValues).score ?? 0;

  return combineFactors(
    sampleSizeScore(chronologicalDates.length),
    recencyScore(mostRecentDate, referenceDate),
    consistency
  );
}

export function getSwimConfidence(
  tests: SwimTest[],
  rollingWindow = 3,
  referenceDate: Date = new Date()
): ConfidenceFactorScores {
  const chronological = sortByDateAscending(tests);
  return disciplineConfidence(
    chronological.map((t) => t.test_date),
    chronological.map((t) => (t.time_seconds / t.distance_m) * 100),
    rollingWindow,
    referenceDate
  );
}

export function getBikeConfidence(
  tests: BikeTest[],
  rollingWindow = 3,
  referenceDate: Date = new Date()
): ConfidenceFactorScores {
  const chronological = sortByDateAscending(tests).filter(
    (t): t is BikeTest & { avg_speed_kmh: number } => t.avg_speed_kmh !== null
  );
  return disciplineConfidence(
    chronological.map((t) => t.test_date),
    chronological.map((t) => t.avg_speed_kmh),
    rollingWindow,
    referenceDate
  );
}

export function getRunConfidence(
  tests: RunTest[],
  rollingWindow = 3,
  referenceDate: Date = new Date()
): ConfidenceFactorScores {
  const chronological = sortByDateAscending(tests).filter((t) => t.distance_km > 0);
  return disciplineConfidence(
    chronological.map((t) => t.test_date),
    chronological.map((t) => t.time_seconds / t.distance_km),
    rollingWindow,
    referenceDate
  );
}

/**
 * Overall race-prediction confidence is the weakest-link discipline, not
 * an average — a rock-solid swim history can't compensate for a run basis
 * built on a single three-month-old test. `level`/`score` describe
 * whichever discipline is currently the limiting factor; `breakdown` shows
 * all three so the caller can see exactly why.
 */
export function getConfidence(
  swimTests: SwimTest[],
  bikeTests: BikeTest[],
  runTests: RunTest[],
  rollingWindow = 3,
  referenceDate: Date = new Date()
): ConfidenceResult {
  const swim = getSwimConfidence(swimTests, rollingWindow, referenceDate);
  const bike = getBikeConfidence(bikeTests, rollingWindow, referenceDate);
  const run = getRunConfidence(runTests, rollingWindow, referenceDate);

  const score = Math.min(swim.overallScore, bike.overallScore, run.overallScore);

  return { level: levelFromScore(score), score, breakdown: { swim, bike, run } };
}
