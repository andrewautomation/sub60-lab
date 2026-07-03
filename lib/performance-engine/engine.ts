import { getPrimaryRaceFormat } from "@/lib/athlete/domain";
import { computeCurrentLevel } from "./currentLevel";
import { computeGoalGap } from "./goalGap";
import { computeGoalConfidence } from "./goalConfidence";
import { computeRacePrediction } from "./racePrediction";
import { computeBottleneck } from "./bottleneck";
import { computeROI } from "./roi";
import { computeTrend } from "./trend";
import { PerformanceEngineInput, PerformanceEngineResult } from "./types";

/**
 * Performance Engine v1.
 *
 * Turns an athlete's profile, active goal, and logged tests into exactly
 * seven outputs — Current Level, Goal Gap, Goal Confidence, Race
 * Prediction, Biggest Bottleneck, ROI by Discipline, and Trend — and
 * nothing else. That's a deliberate ceiling, not an oversight: this is
 * meant to ship as a "Performance Engine v1 (Preview)" that a real athlete
 * validates with three questions (does the race prediction look
 * realistic, do you agree with the bottleneck, would this change your
 * training) before any of it grows a single additional output. Real
 * feedback on seven numbers beats speculative correctness on seventeen.
 *
 * Design rules this module (and everything under lib/performance-engine/)
 * is built to:
 *
 * - **Deterministic and explainable.** Every output is a fixed formula
 *   over plain input data — no ML, no hidden state, same inputs always
 *   produce the same outputs. Every non-obvious constant (score
 *   thresholds, confidence weights, the pace-to-deadline minimum-days
 *   assumption) is a named constant with a doc comment explaining it,
 *   never a magic number buried in an expression.
 * - **Traceable.** Every result either carries the raw values it came
 *   from (source test dates, which target was used and why — see
 *   targets.ts) or an explicit reason it couldn't be computed. Nothing is
 *   silently null; every null/unsupported case has an explanation string
 *   a UI can show verbatim.
 * - **Pure.** No Supabase, no React, no dates from `new Date()` unless a
 *   caller didn't supply `referenceDate` — everything here takes plain
 *   data in and returns plain data out, exactly like the existing
 *   lib/analytics/ and lib/race/ modules this engine builds on rather
 *   than duplicates. That means it's independently testable without a
 *   database or a browser, even though this repo doesn't have a test
 *   runner configured yet (a natural next step, not done here).
 * - **Honest about its limits.** Duathlon and Aquathlon athletes get a
 *   clear "not supported in v1" on Race Prediction and ROI rather than a
 *   number quietly computed from the wrong model. A goal with no numeric
 *   target (a "Finish" level) gets an explanation, not a fabricated gap.
 *
 * This module intentionally has no callers yet (no page, no API route) —
 * wiring it into the dashboard as the "Performance Engine v1 (Preview)"
 * surface, plus the three-question feedback prompt, is follow-up work.
 */
export function runPerformanceEngine(input: PerformanceEngineInput): PerformanceEngineResult {
  const raceFormat = getPrimaryRaceFormat(input.athlete);

  const currentLevel = computeCurrentLevel(input);
  const racePrediction = computeRacePrediction(input);
  const trend = computeTrend(input);
  const goalGap = computeGoalGap(input, racePrediction);
  const goalConfidence = computeGoalConfidence(input, racePrediction, trend, goalGap.gapSeconds);
  const bottleneck = computeBottleneck(input);
  const roi = computeROI(input);

  const assumptions = [
    "Current Level and Race Prediction are both based on each discipline's personal best, not the latest test — recent trajectory is Trend's job, not theirs.",
    "Targets are resolved goal-first: the athlete's own goal (race-format leg targets, or a single-discipline goal's numeric target) is used when available, falling back to this app's Sub-60 Sprint defaults otherwise — see targets.ts.",
    ...roi.assumptions,
    ...(goalConfidence?.assumptions ?? []),
  ];

  return {
    version: "v1",
    generatedAt: (input.referenceDate ?? new Date()).toISOString(),
    raceFormat,
    currentLevel,
    goalGap,
    goalConfidence,
    racePrediction,
    bottleneck,
    roi,
    trend,
    assumptions,
  };
}
