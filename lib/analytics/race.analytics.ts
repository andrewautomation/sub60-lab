import { SwimTest } from "@/types/swim";
import { BikeTest } from "@/types/bike";
import { RunTest } from "@/types/run";
import { RaceFormat, RacePrediction, TransitionEstimate } from "@/types/analytics";
import { SUB_60_SPRINT_TARGETS } from "./targets";
import { riegelPredict, scoreAgainstTarget } from "./shared";
import { getPersonalBest as getSwimPersonalBest } from "./swim.analytics";
import { getBestSpeed as getBikeBestSpeed } from "./bike.analytics";
import { getBestPace as getRunBestPace } from "./run.analytics";

/**
 * Race distance presets. "Super Sprint" matches this app's own test
 * distances (swim 400m / bike 10km / run 2.5km, see ARCHITECTURE.md and
 * lib/analytics/targets.ts); Sprint and Olympic are standard ITU distances,
 * projected from the athlete's best efforts via Riegel's formula.
 */
const SUPER_SPRINT_DISTANCES = { swimMeters: 400, bikeKm: 10, runKm: 2.5 };
const SPRINT_DISTANCES = { swimMeters: 750, bikeKm: 20, runKm: 5 };
const OLYMPIC_DISTANCES = { swimMeters: 1500, bikeKm: 40, runKm: 10 };

const DEFAULT_T1_SECONDS = 90;
const DEFAULT_T2_SECONDS = 60;

export function estimateTransitions(overrides?: {
  t1Seconds?: number;
  t2Seconds?: number;
}): TransitionEstimate {
  const t1_seconds = overrides?.t1Seconds ?? DEFAULT_T1_SECONDS;
  const t2_seconds = overrides?.t2Seconds ?? DEFAULT_T2_SECONDS;
  return { t1_seconds, t2_seconds, total_seconds: t1_seconds + t2_seconds };
}

function predictForDistances(
  swimTests: SwimTest[],
  bikeTests: BikeTest[],
  runTests: RunTest[],
  distances: { swimMeters: number; bikeKm: number; runKm: number },
  format: RaceFormat,
  transitions: TransitionEstimate
): RacePrediction | null {
  const swimPb = getSwimPersonalBest(swimTests);
  const bikeBasis = getBikeBestSpeed(bikeTests);
  const runBasis = getRunBestPace(runTests);

  if (!swimPb || !bikeBasis || !bikeBasis.avg_speed_kmh || !runBasis) {
    return null;
  }

  const swimTimeSeconds = riegelPredict(
    swimPb.time_seconds,
    swimPb.distance_m,
    distances.swimMeters
  );

  // Constant-speed model: short/moderate multisport bike legs don't show
  // the same fatigue-with-distance curve running and swimming do.
  const bikeTimeSeconds = (distances.bikeKm / bikeBasis.avg_speed_kmh) * 3600;

  const runTimeSeconds = riegelPredict(
    runBasis.time_seconds,
    runBasis.distance_km,
    distances.runKm
  );

  // Round each leg first so total_seconds always equals the sum of the
  // displayed legs — summing the unrounded values first can be off by a
  // second from what the individual leg times add up to.
  const swim = { distance: distances.swimMeters, time_seconds: Math.round(swimTimeSeconds) };
  const bike = { distance: distances.bikeKm, time_seconds: Math.round(bikeTimeSeconds) };
  const run = { distance: distances.runKm, time_seconds: Math.round(runTimeSeconds) };

  return {
    format,
    swim,
    t1_seconds: transitions.t1_seconds,
    bike,
    t2_seconds: transitions.t2_seconds,
    run,
    total_seconds:
      swim.time_seconds + transitions.t1_seconds + bike.time_seconds + transitions.t2_seconds + run.time_seconds,
  };
}

export function estimateSuperSprintTime(
  swimTests: SwimTest[],
  bikeTests: BikeTest[],
  runTests: RunTest[],
  transitions: TransitionEstimate = estimateTransitions()
): RacePrediction | null {
  return predictForDistances(
    swimTests,
    bikeTests,
    runTests,
    SUPER_SPRINT_DISTANCES,
    "super_sprint",
    transitions
  );
}

export function estimateSprintTime(
  swimTests: SwimTest[],
  bikeTests: BikeTest[],
  runTests: RunTest[],
  transitions: TransitionEstimate = estimateTransitions()
): RacePrediction | null {
  return predictForDistances(
    swimTests,
    bikeTests,
    runTests,
    SPRINT_DISTANCES,
    "sprint",
    transitions
  );
}

export function estimateOlympicTime(
  swimTests: SwimTest[],
  bikeTests: BikeTest[],
  runTests: RunTest[],
  transitions: TransitionEstimate = estimateTransitions()
): RacePrediction | null {
  return predictForDistances(
    swimTests,
    bikeTests,
    runTests,
    OLYMPIC_DISTANCES,
    "olympic",
    transitions
  );
}

/** 0-100: how close a predicted race total is to the target finish time
 * (defaults to the Sub-60 goal). Null when there isn't enough data to
 * produce a prediction. */
export function estimateRaceScore(
  prediction: RacePrediction | null,
  targetTotalSeconds: number = SUB_60_SPRINT_TARGETS.totalTimeSeconds
): number | null {
  if (!prediction) return null;
  return scoreAgainstTarget(prediction.total_seconds, targetTotalSeconds, "lowerIsBetter");
}

/**
 * Blends the three discipline performance scores into one 0-100 athlete
 * score. Not part of the literal Race Analytics spec, but this is the only
 * module that spans all three disciplines, so it's the natural home for
 * the "Overall Athlete Score" the Performance Score model calls for.
 * Averages whichever scores are available — a discipline with no tests
 * yet doesn't drag the average to zero.
 */
export function getOverallAthleteScore(
  swimScore: number | null,
  bikeScore: number | null,
  runScore: number | null
): number | null {
  const scores = [swimScore, bikeScore, runScore].filter(
    (s): s is number => s !== null
  );
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}
