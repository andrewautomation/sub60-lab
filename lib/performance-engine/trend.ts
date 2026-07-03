import { PerformanceEngineInput, TrendSummaryResult } from "./types";
import { getLatestTrend as getSwimTrend } from "@/lib/analytics/swim.analytics";
import { getSpeedTrend as getBikeTrend } from "@/lib/analytics/bike.analytics";
import { getPaceTrend as getRunTrend } from "@/lib/analytics/run.analytics";

/**
 * Trend — wraps each discipline's existing performance-trend calculator
 * (already built and used by their respective pages) and rolls them up
 * into one overall direction. "Overall" is a plain majority vote, not a
 * weighted average: with at most three disciplines, any fancier weighting
 * scheme would be harder to explain than it's worth for v1.
 */
export function computeTrend(input: PerformanceEngineInput): TrendSummaryResult {
  const perDiscipline: TrendSummaryResult["perDiscipline"] = [];

  if (input.swimTests.length > 0) {
    perDiscipline.push({ discipline: "swim", trend: getSwimTrend(input.swimTests) });
  }
  if (input.bikeTests.length > 0) {
    perDiscipline.push({ discipline: "bike", trend: getBikeTrend(input.bikeTests) });
  }
  if (input.runTests.length > 0) {
    perDiscipline.push({ discipline: "run", trend: getRunTrend(input.runTests) });
  }

  const improving = perDiscipline.filter((d) => d.trend.trend === "improving").length;
  const declining = perDiscipline.filter((d) => d.trend.trend === "declining").length;

  const overall = improving > declining ? "improving" : declining > improving ? "declining" : "stable";

  return { perDiscipline, overall };
}
