import { getPersonalBest } from "@/lib/analytics/swim.analytics";
import { getBestSpeed } from "@/lib/analytics/bike.analytics";
import { getBestPace } from "@/lib/analytics/run.analytics";
import { scoreAgainstTarget } from "@/lib/analytics/shared";
import { resolveEngineTargets } from "./targets";
import { CurrentLevelResult, DisciplineCurrentLevel, DisciplineLevel, PerformanceEngineInput } from "./types";

/**
 * Current Level — one 0-100 score per discipline, scored against the
 * shared target resolved by targets.ts, based on the athlete's *personal
 * best*, not their latest test. This is a deliberate choice: "current
 * level" should read as demonstrated capability ("what have you proven you
 * can do"), while short-term trajectory (is that capability moving up or
 * down right now) is Trend's job, not this output's — the two are meant to
 * be read together, not collapsed into one number.
 *
 * Score-to-tier thresholds (90/70/40) are a flat, documented assumption,
 * not derived from any population of athletes — they exist to give the
 * score a human label, not to claim a validated skill taxonomy.
 */
const LEVEL_THRESHOLDS = { elite: 90, advanced: 70, intermediate: 40 };

function levelFromScore(score: number): DisciplineLevel {
  if (score >= LEVEL_THRESHOLDS.elite) return "elite";
  if (score >= LEVEL_THRESHOLDS.advanced) return "advanced";
  if (score >= LEVEL_THRESHOLDS.intermediate) return "intermediate";
  return "beginner";
}

export function computeCurrentLevel(input: PerformanceEngineInput): CurrentLevelResult {
  const targets = resolveEngineTargets(input.athlete);
  const disciplines: DisciplineCurrentLevel[] = [];

  if (targets.swim) {
    const pb = getPersonalBest(input.swimTests);
    if (pb) {
      const score = scoreAgainstTarget(pb.time_seconds, targets.swim.time_seconds, "lowerIsBetter");
      disciplines.push({
        discipline: "swim",
        score,
        level: levelFromScore(score),
        basis: { value: pb.time_seconds, unit: "seconds", sourceTestDates: [pb.test_date] },
      });
    } else {
      disciplines.push({ discipline: "swim", score: null, level: null, basis: null });
    }
  }

  if (targets.bike) {
    const pb = getBestSpeed(input.bikeTests);
    if (pb && pb.avg_speed_kmh !== null) {
      const score = scoreAgainstTarget(pb.avg_speed_kmh, targets.bike.avg_speed_kmh, "higherIsBetter");
      disciplines.push({
        discipline: "bike",
        score,
        level: levelFromScore(score),
        basis: { value: pb.avg_speed_kmh, unit: "km/h", sourceTestDates: [pb.test_date] },
      });
    } else {
      disciplines.push({ discipline: "bike", score: null, level: null, basis: null });
    }
  }

  if (targets.run) {
    const pb = getBestPace(input.runTests);
    if (pb) {
      const paceSecondsPerKm = pb.time_seconds / pb.distance_km;
      const score = scoreAgainstTarget(paceSecondsPerKm, targets.run.pace_seconds_per_km, "lowerIsBetter");
      disciplines.push({
        discipline: "run",
        score,
        level: levelFromScore(score),
        basis: { value: paceSecondsPerKm, unit: "seconds/km", sourceTestDates: [pb.test_date] },
      });
    } else {
      disciplines.push({ discipline: "run", score: null, level: null, basis: null });
    }
  }

  const scored = disciplines.filter((d): d is DisciplineCurrentLevel & { score: number } => d.score !== null);
  if (scored.length === 0) {
    return { disciplines, overall: null, overallScore: null };
  }

  const weakest = scored.reduce((worst, current) => (current.score < worst.score ? current : worst));
  return { disciplines, overall: levelFromScore(weakest.score), overallScore: weakest.score };
}
