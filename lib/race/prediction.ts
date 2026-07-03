import { BikeTest } from "@/types/bike";
import { RunTest } from "@/types/run";
import { SwimTest } from "@/types/swim";
import { sortByDateAscending } from "@/lib/analytics/shared";
import { Discipline, PredictionMode, RaceFormat, RacePrediction, SensitivityResult, WhatIfInput } from "./models";
import { getRaceTargets } from "./targets";
import {
  applyBikePowerWhatIf,
  applyBikeSpeedWhatIf,
  applyRunWhatIf,
  applySwimWhatIf,
  projectBikeSplit,
  projectRunSplit,
  projectSwimSplit,
  resolveBikeBasis,
  resolveRunBasis,
  resolveSwimBasis,
} from "./splits";
import { getConfidence } from "./score";

const DEFAULT_ROLLING_WINDOW = 3;

/** Percentage improvement applied to each discipline's basis, independently,
 * to measure its leverage on total race time. A percentage (rather than a
 * fixed absolute unit like "15 seconds" or "20 watts") keeps the comparison
 * fair across disciplines measured in different units. */
const SENSITIVITY_STEP_PERCENT = 2;

export interface PredictRaceInput {
  swimTests: SwimTest[];
  bikeTests: BikeTest[];
  runTests: RunTest[];
  format: RaceFormat;
  mode: PredictionMode;
  /** Number of most-recent tests averaged when mode is "rolling_average";
   * also the window used for the confidence model's consistency factor. */
  rollingWindow?: number;
  /** Defaults to the format's target transition times (targets.ts). */
  transitions?: { t1Seconds?: number; t2Seconds?: number };
  whatIf?: WhatIfInput;
  /** Injectable for deterministic testing of the confidence model's
   * recency factor; defaults to the actual current time. */
  referenceDate?: Date;
}

function mostRecentPower(bikeTests: BikeTest[]): number | null {
  const withPower = sortByDateAscending(bikeTests).filter(
    (t): t is BikeTest & { avg_power: number } => t.avg_power !== null
  );
  if (withPower.length === 0) return null;
  return withPower[withPower.length - 1].avg_power;
}

/**
 * Prediction Engine.
 *
 * Combines swim/bike/run fitness (per the selected PredictionMode),
 * transitions, and a race format's targets into a full race prediction:
 * every leg split, the total time, the gap to that format's goal, and a
 * confidence rating. Returns null only when at least one discipline has no
 * usable test data — there's no meaningful race prediction without all
 * three legs.
 */
export function predictRace(input: PredictRaceInput): RacePrediction | null {
  const {
    swimTests,
    bikeTests,
    runTests,
    format,
    mode,
    rollingWindow = DEFAULT_ROLLING_WINDOW,
    transitions,
    whatIf,
    referenceDate = new Date(),
  } = input;

  const target = getRaceTargets(format);

  const swimBasis = resolveSwimBasis(swimTests, mode, rollingWindow);
  const bikeBasisRaw = resolveBikeBasis(bikeTests, mode, rollingWindow);
  const runBasis = resolveRunBasis(runTests, mode, rollingWindow);

  if (!swimBasis || !bikeBasisRaw || !runBasis) return null;

  let bikeBasis = whatIf?.bikeSpeedKmhImprovement
    ? applyBikeSpeedWhatIf(bikeBasisRaw, whatIf.bikeSpeedKmhImprovement)
    : bikeBasisRaw;
  if (whatIf?.bikePowerWattsImprovement) {
    bikeBasis = applyBikePowerWhatIf(bikeBasis, mostRecentPower(bikeTests), whatIf.bikePowerWattsImprovement);
  }

  const runBasisAdjusted = whatIf?.runPaceSecondsPerKmImprovement
    ? applyRunWhatIf(runBasis, whatIf.runPaceSecondsPerKmImprovement)
    : runBasis;

  const swimSplitRaw = projectSwimSplit(swimBasis, target.distances.swimMeters);
  const swim = whatIf?.swimSecondsImprovement
    ? applySwimWhatIf(swimSplitRaw, whatIf.swimSecondsImprovement)
    : swimSplitRaw;

  const bike = projectBikeSplit(bikeBasis, target.distances.bikeKm);
  const run = projectRunSplit(runBasisAdjusted, target.distances.runKm);

  const t1_seconds = Math.max(
    0,
    (transitions?.t1Seconds ?? target.targetT1Seconds) - (whatIf?.t1SecondsImprovement ?? 0)
  );
  const t2_seconds = Math.max(
    0,
    (transitions?.t2Seconds ?? target.targetT2Seconds) - (whatIf?.t2SecondsImprovement ?? 0)
  );

  const total_seconds = swim.time_seconds + t1_seconds + bike.time_seconds + t2_seconds + run.time_seconds;

  const confidence = getConfidence(swimTests, bikeTests, runTests, rollingWindow, referenceDate);

  return {
    format,
    mode,
    swim,
    t1_seconds,
    bike,
    t2_seconds,
    run,
    total_seconds,
    gapToGoalSeconds: total_seconds - target.goalSeconds,
    confidence,
    ...(whatIf ? { whatIf } : {}),
  };
}

/**
 * Sensitivity Analysis.
 *
 * Applies a uniform SENSITIVITY_STEP_PERCENT improvement to each discipline
 * in isolation and measures the resulting drop in total race time, ranked
 * descending. The discipline at the top is the one currently offering the
 * biggest reduction for the same relative effort — the input this app's
 * future AI coaching recommendations are meant to consume.
 */
export function getSensitivityAnalysis(
  input: Omit<PredictRaceInput, "whatIf">,
  stepPercent: number = SENSITIVITY_STEP_PERCENT
): SensitivityResult[] {
  const { swimTests, bikeTests, runTests, mode, rollingWindow = DEFAULT_ROLLING_WINDOW } = input;

  const baseline = predictRace(input);
  if (!baseline) return [];

  const swimBasis = resolveSwimBasis(swimTests, mode, rollingWindow);
  const bikeBasis = resolveBikeBasis(bikeTests, mode, rollingWindow);
  const runBasis = resolveRunBasis(runTests, mode, rollingWindow);
  if (!swimBasis || !bikeBasis || !runBasis) return [];

  const swimStepSeconds = Math.round(baseline.swim.time_seconds * (stepPercent / 100));
  const bikeStepKmh = bikeBasis.avg_speed_kmh * (stepPercent / 100);
  const runStepSecPerKm = (runBasis.time_seconds / runBasis.distance_km) * (stepPercent / 100);

  const scenarios: { discipline: Discipline; whatIf: WhatIfInput; method: string }[] = [
    {
      discipline: "swim",
      whatIf: { swimSecondsImprovement: swimStepSeconds },
      method: `${stepPercent}% faster swim split (-${swimStepSeconds}s)`,
    },
    {
      discipline: "bike",
      whatIf: { bikeSpeedKmhImprovement: bikeStepKmh },
      method: `${stepPercent}% faster average bike speed (+${bikeStepKmh.toFixed(1)} km/h)`,
    },
    {
      discipline: "run",
      whatIf: { runPaceSecondsPerKmImprovement: runStepSecPerKm },
      method: `${stepPercent}% faster run pace (-${runStepSecPerKm.toFixed(1)} s/km)`,
    },
  ];

  return scenarios
    .map(({ discipline, whatIf, method }) => {
      const scenario = predictRace({ ...input, whatIf });
      const potentialGainSeconds = scenario ? baseline.total_seconds - scenario.total_seconds : 0;
      return { discipline, potentialGainSeconds, method };
    })
    .sort((a, b) => b.potentialGainSeconds - a.potentialGainSeconds);
}

/** The single discipline with the greatest potential time reduction, or
 * null if there isn't enough data to run the analysis. */
export function getBiggestOpportunity(
  input: Omit<PredictRaceInput, "whatIf">,
  stepPercent: number = SENSITIVITY_STEP_PERCENT
): SensitivityResult | null {
  const [top] = getSensitivityAnalysis(input, stepPercent);
  return top ?? null;
}
