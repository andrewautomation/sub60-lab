import { Athlete } from "@/types/athlete";
import { Goal } from "@/types/goal";
import { SwimTest } from "@/types/swim";
import { BikeTest } from "@/types/bike";
import { RunTest } from "@/types/run";
import { Discipline, RaceFormat, RacePrediction } from "@/lib/race/models";
import { TrendResult } from "@/types/analytics";

/**
 * Performance Engine v1 — shared types.
 *
 * Every result type below carries either the raw values it was computed
 * from, or enough of a trail (source test dates, which target was used,
 * why) that a caller — or an athlete looking at a "Preview" label — can
 * see exactly what produced a number instead of trusting it blindly. This
 * is the contract the module's docstring in engine.ts explains in full;
 * these types are the shape that contract takes.
 */

export interface PerformanceEngineInput {
  athlete: Athlete;
  /** The athlete's current active goal for their primary event, or null if
   * they haven't set one (see services/goal.service.ts
   * fetchActiveGoalForEvent — resolving that is the caller's job; this
   * engine takes plain data only, no Supabase). */
  goal: Goal | null;
  swimTests: SwimTest[];
  bikeTests: BikeTest[];
  runTests: RunTest[];
  /** Injectable for deterministic testing; defaults to the real current
   * time everywhere it's used. */
  referenceDate?: Date;
}

export type DisciplineLevel = "beginner" | "intermediate" | "advanced" | "elite";

export interface DisciplineCurrentLevel {
  discipline: Discipline;
  /** 0-100 against the resolved target for this discipline (see
   * targets.ts) — 100 means at or beyond target. Null if the athlete has
   * no test data for this discipline yet. */
  score: number | null;
  level: DisciplineLevel | null;
  /** The single demonstrated value the score was computed from (personal
   * best time for swim/run, personal best average speed for bike) plus
   * which test date(s) it came from. Null alongside score/level when
   * there's no data. */
  basis: { value: number; unit: string; sourceTestDates: string[] } | null;
}

export interface CurrentLevelResult {
  /** One entry per discipline the athlete's sport actually trains (see
   * lib/sports/registry.ts getDisciplinesForSport) — a runner never gets a
   * swim entry, not even a null one. */
  disciplines: DisciplineCurrentLevel[];
  /** The weakest scoring discipline's level — mirrors lib/race/score.ts's
   * "confidence is the weakest link" convention: a strong bike can't
   * compensate for a beginner swim when the race requires both. Null if no
   * discipline has any data yet. */
  overall: DisciplineLevel | null;
  overallScore: number | null;
}

export interface GoalGapResult {
  /** Seconds: projected finish time minus goal target. Positive = short of
   * goal, negative = already beating it. Null if there's no active goal,
   * or not enough test data to project a finish time. */
  gapSeconds: number | null;
  explanation: string;
}

export interface GoalConfidenceBreakdown {
  /** 0-100: how much to trust the underlying test data (sample size,
   * recency, consistency) — see lib/race/score.ts. Averaged across every
   * discipline the athlete's sport trains. */
  dataQualityScore: number;
  /** 0-100: how close the current projection already is to the goal. */
  gapScore: number;
  /** 0-100: reflects recent trend direction/magnitude across disciplines —
   * improving raises this, declining lowers it, no data scores neutral. */
  momentumScore: number;
  /** 0-100: whether there's realistically enough calendar time left before
   * the goal's target_date, given current momentum. Neutral 50 when the
   * goal has no target_date to evaluate against. */
  paceToDeadlineScore: number;
}

export interface GoalConfidenceResult {
  score: number;
  level: "high" | "medium" | "low";
  breakdown: GoalConfidenceBreakdown;
  assumptions: string[];
}

export interface SingleDisciplinePrediction {
  discipline: Discipline;
  distance: number;
  /** "m" for swim, "km" for bike/run. */
  unit: string;
  time_seconds: number;
  sourceTestDates: string[];
}

export interface RacePredictionResult {
  supported: boolean;
  unsupportedReason?: string;
  totalSeconds?: number;
  /** Populated for triathlon events (a resolvable RaceFormat) — the exact,
   * unmodified result of lib/race/prediction.ts predictRace(), so nothing
   * is re-derived or re-approximated. */
  raceDetail?: RacePrediction;
  /** Populated for single-discipline sports (Swimming/Cycling/Running). */
  singleDisciplineDetail?: SingleDisciplinePrediction;
}

export interface BottleneckResult {
  discipline: Discipline | null;
  /** This discipline's % shortfall vs its own resolved target — 0 means
   * at/beyond target. Null if there's no discipline with both a target and
   * test data to compare. */
  gapPercent: number | null;
  explanation: string;
}

export interface DisciplineROI {
  discipline: Discipline;
  /** Seconds of total race time recoverable from a standardized
   * improvement applied to this discipline alone — see
   * lib/race/prediction.ts getSensitivityAnalysis. */
  potentialGainSeconds: number;
  method: string;
}

export interface ROIResult {
  supported: boolean;
  unsupportedReason?: string;
  /** Ranked descending by potentialGainSeconds — the top entry is the best
   * return on training time for the same relative effort. */
  ranked: DisciplineROI[];
  assumptions: string[];
}

export interface DisciplineTrend {
  discipline: Discipline;
  trend: TrendResult;
}

export interface TrendSummaryResult {
  perDiscipline: DisciplineTrend[];
  /** "improving"/"declining" if more disciplines lean that way than the
   * other; ties, no data, or all-"stable" default to "stable". */
  overall: "improving" | "stable" | "declining";
}

export interface PerformanceEngineResult {
  version: "v1";
  generatedAt: string;
  raceFormat: RaceFormat | null;
  currentLevel: CurrentLevelResult;
  goalGap: GoalGapResult;
  /** Null when there's no active goal — confidence in a goal that doesn't
   * exist isn't a meaningful number. */
  goalConfidence: GoalConfidenceResult | null;
  racePrediction: RacePredictionResult;
  bottleneck: BottleneckResult;
  roi: ROIResult;
  trend: TrendSummaryResult;
  /** Every assumption baked into this specific run, collected from each
   * sub-module, for display/audit alongside the numbers. */
  assumptions: string[];
}
