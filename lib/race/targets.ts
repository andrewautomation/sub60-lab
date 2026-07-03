import { SUB_60_SPRINT_TARGETS } from "@/lib/analytics/targets";
import { RaceDistances, RaceFormat, RaceTargets } from "./models";

/**
 * Target Engine.
 *
 * Every race format's leg targets are *derived*, not hand-entered, from one
 * canonical set of pace/speed goals — sourced from the app's existing
 * Sub-60 Sprint targets (lib/analytics/targets.ts) so there's exactly one
 * place that defines "what good looks like" for this athlete. Each format
 * below just scales these rates by its own distance instead of hardcoding
 * a second, potentially-inconsistent set of numbers per format.
 */
const CANONICAL_RATES = {
  swimSecondsPer100m:
    (SUB_60_SPRINT_TARGETS.swim.time_seconds / SUB_60_SPRINT_TARGETS.swim.distance_m) * 100,
  bikeSpeedKmh: SUB_60_SPRINT_TARGETS.bike.avg_speed_kmh,
  runSecondsPerKm: SUB_60_SPRINT_TARGETS.run.pace_seconds_per_km,
};

/** Matches the transition assumption already established in
 * lib/analytics/race.analytics.ts (T1 > T2: wetsuit/gear change exiting the
 * water takes longer than racking a bike). Defined once here so every race
 * format shares one assumption instead of repeating it. */
const DEFAULT_T1_SECONDS = 90;
const DEFAULT_T2_SECONDS = 60;

/** 70.3/140.6 are branded around imperial distances (1.2/2.4mi swim,
 * 56/112mi bike, 13.1/26.2mi run) — these are the standard metric
 * approximations used throughout the sport. */
const RACE_DISTANCES: Record<RaceFormat, RaceDistances> = {
  super_sprint: { swimMeters: 400, bikeKm: 10, runKm: 2.5 },
  sprint: { swimMeters: 750, bikeKm: 20, runKm: 5 },
  olympic: { swimMeters: 1500, bikeKm: 40, runKm: 10 },
  half_iron: { swimMeters: 1900, bikeKm: 90, runKm: 21.1 },
  full_iron: { swimMeters: 3800, bikeKm: 180, runKm: 42.2 },
};

type LegTargets = Pick<
  RaceTargets,
  "distances" | "targetSwimSeconds" | "targetBikeSeconds" | "targetRunSeconds" | "targetT1Seconds" | "targetT2Seconds"
>;

function legTargetsFor(format: RaceFormat): LegTargets {
  const distances = RACE_DISTANCES[format];
  return {
    distances,
    targetSwimSeconds: Math.round((distances.swimMeters / 100) * CANONICAL_RATES.swimSecondsPer100m),
    targetBikeSeconds: Math.round((distances.bikeKm / CANONICAL_RATES.bikeSpeedKmh) * 3600),
    targetRunSeconds: Math.round(distances.runKm * CANONICAL_RATES.runSecondsPerKm),
    targetT1Seconds: DEFAULT_T1_SECONDS,
    targetT2Seconds: DEFAULT_T2_SECONDS,
  };
}

function sumLegs(legs: LegTargets): number {
  return (
    legs.targetSwimSeconds +
    legs.targetT1Seconds +
    legs.targetBikeSeconds +
    legs.targetT2Seconds +
    legs.targetRunSeconds
  );
}

const superSprintLegs = legTargetsFor("super_sprint");
const sprintLegs = legTargetsFor("sprint");
const olympicLegs = legTargetsFor("olympic");
const halfIronLegs = legTargetsFor("half_iron");
const fullIronLegs = legTargetsFor("full_iron");

/**
 * Goal times are round, aspirational finish-time targets — not the sum of
 * the leg targets above (a real race plan builds in buffer). Super
 * Sprint's 60:00 is this app's namesake goal (see lib/analytics/targets.ts);
 * Sprint's 59:59 carries the same "sub-60" framing for the standard
 * distance. Olympic has no branded goal, so its value is the computed sum
 * of its own leg targets instead of an invented round number.
 */
export const RACE_TARGETS: Record<RaceFormat, RaceTargets> = {
  super_sprint: {
    format: "super_sprint",
    goalSeconds: SUB_60_SPRINT_TARGETS.totalTimeSeconds,
    ...superSprintLegs,
  },
  sprint: {
    format: "sprint",
    goalSeconds: 3599,
    ...sprintLegs,
  },
  olympic: {
    format: "olympic",
    goalSeconds: sumLegs(olympicLegs),
    ...olympicLegs,
  },
  half_iron: {
    format: "half_iron",
    goalSeconds: sumLegs(halfIronLegs),
    ...halfIronLegs,
  },
  full_iron: {
    format: "full_iron",
    goalSeconds: sumLegs(fullIronLegs),
    ...fullIronLegs,
  },
};

export function getRaceTargets(format: RaceFormat): RaceTargets {
  return RACE_TARGETS[format];
}
