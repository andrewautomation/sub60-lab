import { formatTime } from "@/lib/format/time";
import { resolveGoalTargetSeconds } from "./targets";
import { GoalGapResult, PerformanceEngineInput, RacePredictionResult } from "./types";

/**
 * Goal Gap — projected finish time minus the athlete's *own selected*
 * goal target, not the app's generic per-format default. This is why it
 * takes the already-computed RacePredictionResult rather than recomputing
 * a projection itself: predictRace()'s own gapToGoalSeconds compares
 * against a fixed round number per race format (e.g. Super Sprint's
 * built-in "Sub-60"), which isn't necessarily the level the athlete
 * actually picked in onboarding (they might have picked "Sub-75").
 */
export function computeGoalGap(input: PerformanceEngineInput, racePrediction: RacePredictionResult): GoalGapResult {
  if (!input.goal) {
    return { gapSeconds: null, explanation: "No active goal is set for this event." };
  }

  const targetSeconds = resolveGoalTargetSeconds(input.goal);
  if (targetSeconds === null) {
    return {
      gapSeconds: null,
      explanation: 'The current goal has no time target to measure a gap against (e.g. a "Finish" level just requires completing the distance).',
    };
  }

  if (!racePrediction.supported || racePrediction.totalSeconds === undefined) {
    return {
      gapSeconds: null,
      explanation: racePrediction.unsupportedReason ?? "Not enough test data yet to project a finish time to compare against the goal.",
    };
  }

  const gapSeconds = racePrediction.totalSeconds - targetSeconds;
  return {
    gapSeconds,
    explanation:
      gapSeconds <= 0
        ? `Projected finish time is ${formatTime(Math.abs(gapSeconds))} faster than the goal.`
        : `Projected finish time is ${formatTime(gapSeconds)} slower than the goal.`,
  };
}
