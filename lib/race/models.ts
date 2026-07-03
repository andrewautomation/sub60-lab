import { RaceFormat } from "@/types/analytics";

/**
 * Race Intelligence Engine — shared types.
 *
 * This module's `RacePrediction` supersedes the simpler one in
 * types/analytics.ts (used by the earlier lib/analytics/race.analytics.ts
 * PB-only predictor): it adds prediction mode, confidence, gap-to-goal,
 * and what-if tracking. The two coexist — nothing here touches the older
 * module — but new race-prediction work should build on this one.
 */
export type { RaceFormat };

/** How the athlete's current fitness is estimated from historical test
 * data before being projected onto a race distance. */
export type PredictionMode = "latest" | "personal_best" | "rolling_average";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceFactorScores {
  /** 0-100: more tests in the lookback window = higher score. */
  sampleSizeScore: number;
  /** 0-100: a more recent last test = higher score. */
  recencyScore: number;
  /** 0-100: less run-to-run variation = higher score. */
  consistencyScore: number;
  /** 0-100: weighted combination of the three factors above, for this
   * discipline only. */
  overallScore: number;
}

export interface ConfidenceResult {
  level: ConfidenceLevel;
  /** 0-100. Equal to the weakest discipline's overallScore — see score.ts. */
  score: number;
  breakdown: {
    swim: ConfidenceFactorScores;
    bike: ConfidenceFactorScores;
    run: ConfidenceFactorScores;
  };
}

/** A discipline's resolved "current fitness" effort, ready to be projected
 * onto a race distance via splits.ts. */
export interface SwimBasis {
  mode: PredictionMode;
  time_seconds: number;
  distance_m: number;
  sourceTestDates: string[];
}

export interface BikeBasis {
  mode: PredictionMode;
  avg_speed_kmh: number;
  sourceTestDates: string[];
}

export interface RunBasis {
  mode: PredictionMode;
  time_seconds: number;
  distance_km: number;
  sourceTestDates: string[];
}

export interface RaceDistances {
  swimMeters: number;
  bikeKm: number;
  runKm: number;
}

export interface RaceTargets {
  format: RaceFormat;
  distances: RaceDistances;
  /** Round, aspirational finish-time goal. Not required to equal the sum
   * of the leg targets below — see targets.ts for why. */
  goalSeconds: number;
  targetSwimSeconds: number;
  targetBikeSeconds: number;
  targetRunSeconds: number;
  targetT1Seconds: number;
  targetT2Seconds: number;
}

export interface LegSplit {
  /** meters for swim, kilometers for bike/run */
  distance: number;
  time_seconds: number;
}

/** Any combination of these may be set — What-If Mode composes freely. */
export interface WhatIfInput {
  /** Seconds shaved directly off the predicted swim split. */
  swimSecondsImprovement?: number;
  /** km/h added directly to the bike speed basis before projection. */
  bikeSpeedKmhImprovement?: number;
  /** Converted to an equivalent speed gain — see splits.ts
   * applyBikePowerWhatIf. Combines additively with bikeSpeedKmhImprovement. */
  bikePowerWattsImprovement?: number;
  /** Seconds/km shaved off the run pace basis before projection. */
  runPaceSecondsPerKmImprovement?: number;
  t1SecondsImprovement?: number;
  t2SecondsImprovement?: number;
}

export interface RacePrediction {
  format: RaceFormat;
  mode: PredictionMode;
  swim: LegSplit;
  t1_seconds: number;
  bike: LegSplit;
  t2_seconds: number;
  run: LegSplit;
  total_seconds: number;
  /** total_seconds - target.goalSeconds. Positive = slower than goal,
   * negative = already beating it. */
  gapToGoalSeconds: number;
  confidence: ConfidenceResult;
  /** Echoes the what-if adjustments applied, if any, so the result is
   * self-explanatory without needing the original call site. */
  whatIf?: WhatIfInput;
}

export type Discipline = "swim" | "bike" | "run";

export interface SensitivityResult {
  discipline: Discipline;
  /** Seconds the total race time would drop under the hypothetical
   * improvement described in `method`. */
  potentialGainSeconds: number;
  method: string;
}
