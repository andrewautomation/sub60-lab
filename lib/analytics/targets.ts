import { SprintTargets } from "@/types/targets";

/**
 * The Sub-60 Sprint Triathlon target, stored separately from the analytics
 * functions themselves so it can be swapped or overridden without touching
 * calculation logic. Every analytics function that scores "gap to target"
 * accepts its target as a parameter defaulting to the values here.
 *
 * Distances match this app's own test distances (see ARCHITECTURE.md):
 * swim 400m, bike 10km, run 2.5km — a "Super Sprint" format by common
 * triathlon distance conventions.
 */
export const SUB_60_SPRINT_TARGETS: SprintTargets = {
  swim: { distance_m: 400, time_seconds: 360 }, // 6:00
  bike: { distance_km: 10, avg_speed_kmh: 40 },
  run: { distance_km: 2.5, pace_seconds_per_km: 220 }, // 3:40/km
  totalTimeSeconds: 3600, // 60:00
};
