import { clamp, scoreAgainstTarget, weightedScore } from "@/lib/analytics/shared";
import { daysUntilGoal } from "@/lib/athlete/domain";
import { LEVEL_THRESHOLDS, MIN_COMFORTABLE_DAYS } from "./goalConfidence";

const PROXIMITY_WEIGHTS = { performance: 0.6, timeAdequacy: 0.4 };

/**
 * Per-test-row analog of goalConfidence.ts's single current-state score:
 * how close *this specific performance* was to the goal, weighted against
 * how much calendar time was left as of *that test's date* (not today) —
 * so an old test logged with months of runway isn't penalized the same
 * way an identical performance right before the deadline would be.
 * Reuses the exact same primitives (scoreAgainstTarget, daysUntilGoal,
 * MIN_COMFORTABLE_DAYS) as the dashboard-level Goal Confidence output so
 * the two numbers stay philosophically consistent.
 */
export function computeTestGoalProximity(
  metricValue: number,
  target: number,
  direction: "lowerIsBetter" | "higherIsBetter",
  testDate: string,
  targetDate: string | null
): number {
  const performanceScore = scoreAgainstTarget(metricValue, target, direction);

  const daysRemaining = targetDate ? daysUntilGoal({ target_date: targetDate }, new Date(testDate)) : null;
  const timeAdequacyScore =
    daysRemaining === null
      ? 50
      : daysRemaining < 0
        ? 0
        : clamp(Math.round((daysRemaining / MIN_COMFORTABLE_DAYS) * 100), 0, 100);

  return weightedScore([
    { score: performanceScore, weight: PROXIMITY_WEIGHTS.performance },
    { score: timeAdequacyScore, weight: PROXIMITY_WEIGHTS.timeAdequacy },
  ]);
}

/** Same high/medium/low banding as goalConfidence.ts's LEVEL_THRESHOLDS,
 * reused here for color consistency between the dashboard-level Goal
 * Confidence score and this per-row equivalent. */
export function proximityColorClass(score: number): string {
  if (score >= LEVEL_THRESHOLDS.high) return "text-emerald-400";
  if (score >= LEVEL_THRESHOLDS.medium) return "text-amber-400";
  return "text-red-400";
}
