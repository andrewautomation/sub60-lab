import { getPersonalBest } from "@/lib/analytics/swim.analytics";
import { getBestSpeed } from "@/lib/analytics/bike.analytics";
import { getBestPace } from "@/lib/analytics/run.analytics";
import { Discipline } from "@/lib/race/models";
import { resolveEngineTargets } from "./targets";
import { BottleneckResult, PerformanceEngineInput } from "./types";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Biggest Bottleneck — the discipline furthest *below its own target*, as
 * a percentage (not raw seconds/km/h, which aren't comparable across
 * units). This answers "which leg is relatively weakest," which is a
 * different question from ROI's "which leg, if improved, helps my overall
 * time the most" — a discipline can be the clear bottleneck by this
 * measure while contributing little to total race time (see roi.ts).
 */
export function computeBottleneck(input: PerformanceEngineInput): BottleneckResult {
  const targets = resolveEngineTargets(input.athlete);
  const gaps: { discipline: Discipline; gapPercent: number }[] = [];

  if (targets.swim) {
    const pb = getPersonalBest(input.swimTests);
    if (pb) {
      gaps.push({
        discipline: "swim",
        gapPercent: ((pb.time_seconds - targets.swim.time_seconds) / targets.swim.time_seconds) * 100,
      });
    }
  }

  if (targets.bike) {
    const pb = getBestSpeed(input.bikeTests);
    if (pb && pb.avg_speed_kmh !== null) {
      gaps.push({
        discipline: "bike",
        gapPercent: ((targets.bike.avg_speed_kmh - pb.avg_speed_kmh) / targets.bike.avg_speed_kmh) * 100,
      });
    }
  }

  if (targets.run) {
    const pb = getBestPace(input.runTests);
    if (pb) {
      const pace = pb.time_seconds / pb.distance_km;
      gaps.push({
        discipline: "run",
        gapPercent: ((pace - targets.run.pace_seconds_per_km) / targets.run.pace_seconds_per_km) * 100,
      });
    }
  }

  if (gaps.length === 0) {
    return { discipline: null, gapPercent: null, explanation: "Not enough test data in any discipline yet to identify a bottleneck." };
  }

  const worst = gaps.reduce((a, b) => (b.gapPercent > a.gapPercent ? b : a));
  const roundedGap = Math.round(worst.gapPercent * 10) / 10;

  if (gaps.length === 1) {
    return {
      discipline: worst.discipline,
      gapPercent: roundedGap,
      explanation: `${capitalize(worst.discipline)} is the only tracked discipline for this sport.`,
    };
  }

  return {
    discipline: worst.discipline,
    gapPercent: roundedGap,
    explanation:
      roundedGap <= 0
        ? `${capitalize(worst.discipline)} is closest to (or beyond) its target relative to the others — no discipline is meaningfully behind.`
        : `${capitalize(worst.discipline)} is furthest below its target (${roundedGap}%), relative to the other disciplines.`,
  };
}
