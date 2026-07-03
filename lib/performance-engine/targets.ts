import { Athlete } from "@/types/athlete";
import { getPrimaryDisciplines, getPrimaryRaceFormat } from "@/lib/athlete/domain";
import { getRaceTargets } from "@/lib/race/targets";
import { RaceFormat } from "@/lib/race/models";
import { SUB_60_SPRINT_TARGETS } from "@/lib/analytics/targets";

/**
 * Target Resolution — the one place every Performance Engine output
 * (Current Level, Bottleneck, ROI) agrees on "what good looks like" per
 * discipline, so their numbers are always mutually consistent. Goal-
 * independent by design: the athlete's own Goal is a standalone,
 * non-calculated piece of information (see app/dashboard/goals/page.tsx),
 * never an input to these formulas.
 *
 * Priority, documented so a caller can see which rung a given athlete
 * landed on (`source`):
 *
 * 1. `goal_race_format` — the athlete's primary event is a triathlon
 *    format (lib/race/targets.ts already defines swim/bike/run leg
 *    targets for it, derived from this app's Sub-60 pace/speed rates
 *    scaled to that format's distances).
 * 2. `app_default` — any other sport, or a sport this engine doesn't yet
 *    have a format-specific target model for (Duathlon/Aquathlon). Falls
 *    back to this app's own Sub-60 Sprint defaults (lib/analytics/targets.ts)
 *    — the same defaults the pre-existing per-sport analytics pages
 *    already use.
 *
 * Every branch is masked to `getPrimaryDisciplines(athlete)` at the end —
 * a Duathlon athlete never gets a fabricated swim target, even from the
 * app_default fallback.
 */

export interface EngineTargets {
  swim: { time_seconds: number; distance_m: number } | null;
  bike: { avg_speed_kmh: number; distance_km: number } | null;
  run: { pace_seconds_per_km: number; distance_km: number } | null;
  source: "goal_race_format" | "app_default";
  raceFormat: RaceFormat | null;
}

function maskToDisciplines(targets: Omit<EngineTargets, "source" | "raceFormat">, disciplines: string[]): Omit<EngineTargets, "source" | "raceFormat"> {
  return {
    swim: disciplines.includes("swim") ? targets.swim : null,
    bike: disciplines.includes("bike") ? targets.bike : null,
    run: disciplines.includes("run") ? targets.run : null,
  };
}

export function resolveEngineTargets(athlete: Athlete): EngineTargets {
  const disciplines = getPrimaryDisciplines(athlete);
  const raceFormat = getPrimaryRaceFormat(athlete);

  if (raceFormat) {
    const rt = getRaceTargets(raceFormat);
    const raw = {
      swim: { time_seconds: rt.targetSwimSeconds, distance_m: rt.distances.swimMeters },
      bike: {
        avg_speed_kmh: (rt.distances.bikeKm / rt.targetBikeSeconds) * 3600,
        distance_km: rt.distances.bikeKm,
      },
      run: { pace_seconds_per_km: rt.targetRunSeconds / rt.distances.runKm, distance_km: rt.distances.runKm },
    };
    return { ...maskToDisciplines(raw, disciplines), source: "goal_race_format", raceFormat };
  }

  const raw = {
    swim: { time_seconds: SUB_60_SPRINT_TARGETS.swim.time_seconds, distance_m: SUB_60_SPRINT_TARGETS.swim.distance_m },
    bike: { avg_speed_kmh: SUB_60_SPRINT_TARGETS.bike.avg_speed_kmh, distance_km: SUB_60_SPRINT_TARGETS.bike.distance_km },
    run: {
      pace_seconds_per_km: SUB_60_SPRINT_TARGETS.run.pace_seconds_per_km,
      distance_km: SUB_60_SPRINT_TARGETS.run.distance_km,
    },
  };
  return { ...maskToDisciplines(raw, disciplines), source: "app_default", raceFormat: null };
}
