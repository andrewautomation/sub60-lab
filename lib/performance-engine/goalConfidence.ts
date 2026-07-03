import { getPrimaryDisciplines, getPrimaryRaceFormat, daysUntilGoal } from "@/lib/athlete/domain";
import { getBikeConfidence, getConfidence, getRunConfidence, getSwimConfidence } from "@/lib/race/score";
import { clamp, scoreAgainstTarget, trendToScore } from "@/lib/analytics/shared";
import { GoalConfidenceResult, PerformanceEngineInput, RacePredictionResult, TrendSummaryResult } from "./types";
import { resolveGoalTargetSeconds } from "./targets";

/**
 * Goal Confidence — the one genuinely new composite in this engine (every
 * other output leans heavily on lib/race/* or lib/analytics/* primitives
 * that already existed). Four equally-documented, independently-inspectable
 * components, weighted and combined:
 *
 * - dataQualityScore (20%): how much to trust the underlying test data —
 *   reuses lib/race/score.ts's existing sample-size/recency/consistency
 *   model, weakest-discipline-wins, same convention as race-prediction
 *   confidence.
 * - gapScore (40%): how close the current projection already is to the
 *   goal. Weighted highest because "how far away are you" is the single
 *   strongest signal for "will you get there."
 * - momentumScore (25%): average of each discipline's existing trend
 *   score (lib/analytics/shared.ts trendToScore) — improving raises this,
 *   declining lowers it.
 * - paceToDeadlineScore (15%): whether there's realistically enough
 *   calendar time left. This is the one component with a hand-picked
 *   constant (MIN_COMFORTABLE_DAYS, below) rather than a value derived
 *   from the athlete's own data — documented explicitly rather than
 *   hidden, per this engine's traceability requirement.
 *
 * Weights are a stated, adjustable assumption, not a fitted model — this
 * is v1 decision support, not a validated predictor (see the module-level
 * docstring in engine.ts).
 */
const CONFIDENCE_WEIGHTS = { gap: 0.4, momentum: 0.25, dataQuality: 0.2, paceToDeadline: 0.15 };
const LEVEL_THRESHOLDS = { high: 75, medium: 45 };

/** Assumed minimum training block (in days) to meaningfully close a
 * nonzero performance gap — roughly 12 weeks. Not derived from this
 * athlete's data; a flat, stated assumption used only when a goal has a
 * target_date to evaluate pace against. */
const MIN_COMFORTABLE_DAYS = 84;

function computeDataQualityScore(input: PerformanceEngineInput, raceFormat: ReturnType<typeof getPrimaryRaceFormat>): number {
  if (raceFormat) {
    return getConfidence(input.swimTests, input.bikeTests, input.runTests, 3, input.referenceDate).score;
  }

  const disciplines = getPrimaryDisciplines(input.athlete);
  const scores: number[] = [];
  if (disciplines.includes("swim")) scores.push(getSwimConfidence(input.swimTests, 3, input.referenceDate).overallScore);
  if (disciplines.includes("bike")) scores.push(getBikeConfidence(input.bikeTests, 3, input.referenceDate).overallScore);
  if (disciplines.includes("run")) scores.push(getRunConfidence(input.runTests, 3, input.referenceDate).overallScore);

  if (scores.length === 0) return 0;
  // Weakest-link, same convention as the triathlon case above.
  return Math.min(...scores);
}

function computeMomentumScore(trend: TrendSummaryResult): number {
  if (trend.perDiscipline.length === 0) return 50;
  const scores = trend.perDiscipline.map((d) => trendToScore(d.trend));
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function computePaceToDeadlineScore(
  targetDate: string | null,
  gapSeconds: number | null,
  momentumScore: number,
  referenceDate: Date
): number {
  if (!targetDate) return 50;

  const daysRemaining = daysUntilGoal({ target_date: targetDate }, referenceDate);
  if (daysRemaining === null) return 50;
  if (daysRemaining < 0) return 0;
  if (gapSeconds !== null && gapSeconds <= 0) return 100;

  const timeAdequacy = clamp(Math.round((daysRemaining / MIN_COMFORTABLE_DAYS) * 100), 0, 100);
  return clamp(Math.round(timeAdequacy * 0.5 + momentumScore * 0.5), 0, 100);
}

export function computeGoalConfidence(
  input: PerformanceEngineInput,
  racePrediction: RacePredictionResult,
  trend: TrendSummaryResult,
  goalGapSeconds: number | null
): GoalConfidenceResult | null {
  if (!input.goal) return null;

  const referenceDate = input.referenceDate ?? new Date();
  const raceFormat = getPrimaryRaceFormat(input.athlete);

  const dataQualityScore = computeDataQualityScore(input, raceFormat);
  const momentumScore = computeMomentumScore(trend);
  const paceToDeadlineScore = computePaceToDeadlineScore(input.goal.target_date, goalGapSeconds, momentumScore, referenceDate);

  const targetSeconds = resolveGoalTargetSeconds(input.goal);
  const gapScore =
    targetSeconds !== null && racePrediction.supported && racePrediction.totalSeconds !== undefined
      ? scoreAgainstTarget(racePrediction.totalSeconds, targetSeconds, "lowerIsBetter")
      : 50;

  const score = clamp(
    Math.round(
      gapScore * CONFIDENCE_WEIGHTS.gap +
        momentumScore * CONFIDENCE_WEIGHTS.momentum +
        dataQualityScore * CONFIDENCE_WEIGHTS.dataQuality +
        paceToDeadlineScore * CONFIDENCE_WEIGHTS.paceToDeadline
    ),
    0,
    100
  );

  const level = score >= LEVEL_THRESHOLDS.high ? "high" : score >= LEVEL_THRESHOLDS.medium ? "medium" : "low";

  const assumptions = [
    `Weighted: gap ${CONFIDENCE_WEIGHTS.gap * 100}%, momentum ${CONFIDENCE_WEIGHTS.momentum * 100}%, data quality ${CONFIDENCE_WEIGHTS.dataQuality * 100}%, pace-to-deadline ${CONFIDENCE_WEIGHTS.paceToDeadline * 100}%.`,
  ];
  if (!input.goal.target_date) {
    assumptions.push("Goal has no target date — pace-to-deadline scored a neutral 50 rather than penalized.");
  } else {
    assumptions.push(`Pace-to-deadline assumes a ${MIN_COMFORTABLE_DAYS}-day minimum training block to close a nonzero gap — a stated constant, not derived from this athlete's own rate of improvement.`);
  }
  if (targetSeconds === null) {
    assumptions.push('The goal has no numeric time target (e.g. "Finish") — gap score defaulted to a neutral 50.');
  }

  return {
    score,
    level,
    breakdown: { dataQualityScore, gapScore, momentumScore, paceToDeadlineScore },
    assumptions,
  };
}
