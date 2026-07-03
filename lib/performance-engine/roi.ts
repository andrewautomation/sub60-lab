import { getPrimaryDisciplines, getPrimaryRaceFormat } from "@/lib/athlete/domain";
import { getSensitivityAnalysis } from "@/lib/race/prediction";
import { PerformanceEngineInput, ROIResult } from "./types";

/**
 * ROI by Discipline — for a triathlon event, a thin wrapper over the
 * existing lib/race/prediction.ts getSensitivityAnalysis: apply the same
 * standardized 2% improvement to each discipline in isolation and rank by
 * the resulting drop in total race time. That function's own docstring
 * already frames it as "the input this app's future AI coaching
 * recommendations are meant to consume" — this is that consumption.
 *
 * For a single-discipline sport there's nothing to rank against, so the
 * result is a one-item list saying so rather than a fabricated
 * comparison. Duathlon/Aquathlon share Race Prediction's v1 limitation —
 * no format-specific target model to run sensitivity analysis against.
 */
export function computeROI(input: PerformanceEngineInput): ROIResult {
  const raceFormat = getPrimaryRaceFormat(input.athlete);

  if (raceFormat) {
    const ranked = getSensitivityAnalysis({
      swimTests: input.swimTests,
      bikeTests: input.bikeTests,
      runTests: input.runTests,
      format: raceFormat,
      mode: "personal_best",
      referenceDate: input.referenceDate,
    });

    return {
      supported: true,
      ranked,
      assumptions:
        ranked.length === 0
          ? ["Not enough test data across all three disciplines yet to compare ROI."]
          : [
              "Ranks each discipline by total race-time improvement from a uniform 2% improvement applied to that discipline alone, holding the other two constant — a standardized comparison, not a claim about how easy each discipline actually is to train.",
            ],
    };
  }

  const disciplines = getPrimaryDisciplines(input.athlete);
  if (disciplines.length === 1) {
    return {
      supported: true,
      ranked: [
        {
          discipline: disciplines[0],
          potentialGainSeconds: 0,
          method: "Only tracked discipline for this sport — no cross-discipline comparison applies.",
        },
      ],
      assumptions: ["Single-discipline sport: ROI ranking is only meaningful when multiple disciplines compete for the same training time."],
    };
  }

  return {
    supported: false,
    unsupportedReason: "ROI-by-discipline for Duathlon/Aquathlon isn't built in v1 — same limitation as Race Prediction.",
    ranked: [],
    assumptions: [],
  };
}
