import { getPrimaryDisciplines, getPrimaryEvent, getPrimaryRaceFormat } from "@/lib/athlete/domain";
import { getPersonalBest } from "@/lib/analytics/swim.analytics";
import { getBestPace } from "@/lib/analytics/run.analytics";
import { getBestSpeed } from "@/lib/analytics/bike.analytics";
import { riegelPredict } from "@/lib/analytics/shared";
import { predictRace } from "@/lib/race/prediction";
import { PerformanceEngineInput, RacePredictionResult } from "./types";

/**
 * Race Prediction — for a triathlon event, this is a pass-through to the
 * existing lib/race/prediction.ts engine (nothing re-derived). For a
 * single-discipline sport (Swimming/Cycling/Running), it projects the
 * athlete's personal best onto their chosen event's distance using the
 * same Riegel model the triathlon engine uses internally, so both paths
 * share one predictive method even though only one of them reuses the
 * exact same code path.
 *
 * "personal_best" is the prediction mode used throughout — same rationale
 * as Current Level: this answers "what could you run today at your best,"
 * not "what did you just do."
 *
 * Duathlon and Aquathlon are explicitly unsupported in v1 — the underlying
 * race engine (lib/race/prediction.ts) only has leg-target models for
 * triathlon formats (lib/race/targets.ts), and building a second
 * multisport transition/pacing model for two more sports is real net-new
 * prediction logic, not a reuse of what exists. Returning a fabricated
 * number here would violate this engine's own "traceable to inputs" rule.
 */
export function computeRacePrediction(input: PerformanceEngineInput): RacePredictionResult {
  const raceFormat = getPrimaryRaceFormat(input.athlete);

  if (raceFormat) {
    const prediction = predictRace({
      swimTests: input.swimTests,
      bikeTests: input.bikeTests,
      runTests: input.runTests,
      format: raceFormat,
      mode: "personal_best",
      referenceDate: input.referenceDate,
    });

    if (!prediction) {
      // The triathlon format itself is fully supported — this specific
      // athlete just doesn't have test data in every discipline yet.
      // `supported: true` records "this shape is modelable"; the absence
      // of totalSeconds/raceDetail is what tells the caller there's no
      // number to show yet.
      return {
        supported: true,
        unsupportedReason: "At least one discipline (swim, bike, or run) has no test data yet — a race prediction needs all three.",
      };
    }

    return { supported: true, totalSeconds: prediction.total_seconds, raceDetail: prediction };
  }

  const disciplines = getPrimaryDisciplines(input.athlete);
  if (disciplines.length !== 1) {
    return {
      supported: false,
      unsupportedReason:
        "Race prediction for multi-discipline, non-triathlon sports (Duathlon, Aquathlon) isn't built yet in v1 — it would need its own pacing/transition model rather than reusing the triathlon engine.",
    };
  }

  const leg = getPrimaryEvent(input.athlete)?.legs[0];
  if (!leg) {
    return { supported: false, unsupportedReason: "The athlete's primary event has no defined distance to predict against." };
  }

  const discipline = disciplines[0];

  if (discipline === "swim") {
    const pb = getPersonalBest(input.swimTests);
    if (!pb) return { supported: false, unsupportedReason: "No swim test data yet." };
    const time_seconds = Math.round(riegelPredict(pb.time_seconds, pb.distance_m, leg.distance));
    return {
      supported: true,
      totalSeconds: time_seconds,
      singleDisciplineDetail: { discipline, distance: leg.distance, unit: "m", time_seconds, sourceTestDates: [pb.test_date] },
    };
  }

  if (discipline === "bike") {
    const pb = getBestSpeed(input.bikeTests);
    if (!pb || pb.avg_speed_kmh === null) return { supported: false, unsupportedReason: "No bike test data with a recorded average speed yet." };
    const time_seconds = Math.round((leg.distance / pb.avg_speed_kmh) * 3600);
    return {
      supported: true,
      totalSeconds: time_seconds,
      singleDisciplineDetail: { discipline, distance: leg.distance, unit: "km", time_seconds, sourceTestDates: [pb.test_date] },
    };
  }

  // run
  const pb = getBestPace(input.runTests);
  if (!pb) return { supported: false, unsupportedReason: "No run test data yet." };
  const time_seconds = Math.round(riegelPredict(pb.time_seconds, pb.distance_km, leg.distance));
  return {
    supported: true,
    totalSeconds: time_seconds,
    singleDisciplineDetail: { discipline, distance: leg.distance, unit: "km", time_seconds, sourceTestDates: [pb.test_date] },
  };
}
