import { SwimTest, SwimTestSummary } from "./swim";
import { TrendResult } from "./analytics";

export interface DashboardSummary {
  /** Raw record of the most recent test — not a calculated statistic. */
  lastSwimTest: SwimTestSummary | null;
  /** Computed by lib/analytics/swim.analytics.ts. */
  swimPersonalBest: SwimTest | null;
  swimTrend: TrendResult | null;
  swimGapToTarget: number | null;
}
