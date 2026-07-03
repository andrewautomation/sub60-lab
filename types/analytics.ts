/** Which direction of a metric counts as "better". Time/pace: lower is
 * better. Power/speed/cadence: higher is better. */
export type BetterDirection = "lowerIsBetter" | "higherIsBetter";

export type Trend = "improving" | "stable" | "declining";

export interface TrendResult {
  trend: Trend;
  changePercent: number | null;
  recentAverage: number | null;
  priorAverage: number | null;
}

export interface ConsistencyResult {
  standardDeviation: number | null;
  coefficientOfVariation: number | null;
  /** 0-100, higher = more consistent (lower variation). */
  score: number | null;
}

export interface MonthlySummary {
  /** "YYYY-MM" */
  month: string;
  averageValue: number;
  sampleSize: number;
}

export interface PerformanceScoreBreakdown {
  targetScore: number;
  trendScore: number;
  consistencyScore: number;
}

export interface PerformanceScore {
  score: number;
  breakdown: PerformanceScoreBreakdown;
}

export interface LegPrediction {
  /** meters for swim, kilometers for bike/run */
  distance: number;
  time_seconds: number;
}

export interface TransitionEstimate {
  t1_seconds: number;
  t2_seconds: number;
  total_seconds: number;
}

export type RaceFormat = "super_sprint" | "sprint" | "olympic" | "half_iron" | "full_iron";

export interface RacePrediction {
  format: RaceFormat;
  swim: LegPrediction;
  t1_seconds: number;
  bike: LegPrediction;
  t2_seconds: number;
  run: LegPrediction;
  total_seconds: number;
}
