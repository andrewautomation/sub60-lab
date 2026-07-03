import { getPrimaryRaceFormat } from "@/lib/athlete/domain";
import { computeCurrentLevel } from "./currentLevel";
import { computeRacePrediction } from "./racePrediction";
import { computeBottleneck } from "./bottleneck";
import { computeROI } from "./roi";
import { computeTrend } from "./trend";
import { PerformanceEngineInput, PerformanceEngineResult } from "./types";

/**
 * Performance Engine v1.
 *
 * Turns an athlete's profile and logged tests into exactly five outputs —
 * Current Level, Race Prediction, Biggest Bottleneck, ROI by Discipline,
 * and Trend — and nothing else. That's a deliberate ceiling, not an
 * oversight: this is meant to ship as a "Performance Engine v1 (Preview)"
 * that a real athlete validates with three questions (does the race
 * prediction look realistic, do you agree with the bottleneck, would this
 * change your training) before any of it grows a single additional
 * output. Real feedback on five numbers beats speculative correctness on
 * seventeen.
 *
 * Design rules this module (and everything under lib/performance-engine/)
 * is built to:
 *
 * - **Deterministic and explainable.** Every output is a fixed formula
 *   over plain input data — no ML, no hidden state, same inputs always
 *   produce the same outputs. Every non-obvious constant (score
 *   thresholds, weights) is a named constant with a doc comment
 *   explaining it, never a magic number buried in an expression.
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
 *   number quietly computed from the wrong model.
 * - **Goal-independent.** The athlete's Goal is a standalone piece of
 *   information (see app/dashboard/goals/page.tsx) — it never feeds any
 *   calculation here. Every target this engine scores against comes from
 *   targets.ts's race-format/app-default resolution only.
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
  const bottleneck = computeBottleneck(input);
  const roi = computeROI(input);

  const assumptions = [
    "Current Level and Race Prediction are both based on each discipline's personal best, not the latest test — recent trajectory is Trend's job, not theirs.",
    "Targets are resolved goal-independently: race-format leg targets when the athlete's primary event is a triathlon format, falling back to this app's Sub-60 Sprint defaults otherwise — see targets.ts.",
    ...roi.assumptions,
  ];

  return {
    version: "v1",
    generatedAt: (input.referenceDate ?? new Date()).toISOString(),
    raceFormat,
    currentLevel,
    racePrediction,
    bottleneck,
    roi,
    trend,
    assumptions,
  };
}
