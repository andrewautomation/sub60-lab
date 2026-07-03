import { eventId } from "@/lib/sports/registry";
import { GoalLevel } from "./types";

function level(
  key: string,
  display_name: string,
  description: string,
  target_seconds: number | null
): GoalLevel {
  return { key, display_name, description, target_seconds };
}

/**
 * Structured Goal Ladders.
 *
 * Keyed by the same composite event id used for the `events` table
 * (lib/sports/registry.ts eventId()), so a ladder is looked up the same
 * way an event definition is. Not every catalog event has a curated
 * ladder — getGoalLevelsForEvent (registry.ts) returns [] for one that
 * doesn't, and callers fall back to a plain custom target (Goal.
 * custom_target_value). Adding a ladder for a new event is additive: one
 * entry here, nothing else changes.
 */
export const GOAL_LADDERS: Record<string, GoalLevel[]> = {
  // Super Sprint (400m/10km/2.5km) is roughly half the distance of Sprint
  // (750m/20km/5km) — its ladder must be its own, tighter spread, not a
  // copy of Sprint's. Sub-60 stays fixed at 60:00 because that's this
  // app's literal namesake goal (see SUB_60_SPRINT_TARGETS in
  // lib/analytics/targets.ts), so it anchors the ladder rather than
  // scaling with the other rungs.
  [eventId("triathlon", "super_sprint")]: [
    level("finish", "Finish", "Complete the distance.", null),
    level("sub_75", "Sub-75", "Finish in under 1:15:00.", 75 * 60),
    level("sub_65", "Sub-65", "Finish in under 1:05:00.", 65 * 60),
    level("sub_60", "Sub-60", "Finish in under 1:00:00 — this app's namesake goal.", 60 * 60),
    level("elite", "Elite", "Finish in under 0:40:00.", 40 * 60),
  ],
  // Sprint is the standard, longer distance — sub-60 here is a stretch
  // goal (its own Elite rung, ~3599s to match RACE_TARGETS.sprint.
  // goalSeconds in lib/race/targets.ts), not the mid-ladder milestone it
  // is for Super Sprint.
  [eventId("triathlon", "sprint")]: [
    level("finish", "Finish", "Complete the distance.", null),
    level("sub_105", "Sub-105", "Finish in under 1:45:00.", 105 * 60),
    level("sub_90", "Sub-90", "Finish in under 1:30:00.", 90 * 60),
    level("sub_75", "Sub-75", "Finish in under 1:15:00.", 75 * 60),
    level("elite", "Elite", "Finish in under 0:59:59 — the standard-distance sub-60 goal.", 3599),
  ],
  [eventId("triathlon", "olympic")]: [
    level("finish", "Finish", "Complete the distance.", null),
    level("sub_3_30", "Sub-3:30", "Finish in under 3:30:00.", 3.5 * 3600),
    level("sub_3_00", "Sub-3:00", "Finish in under 3:00:00.", 3 * 3600),
    level("sub_2_30", "Sub-2:30", "Finish in under 2:30:00.", 2.5 * 3600),
    level("elite", "Elite", "Finish in under 2:05:00.", 2 * 3600 + 5 * 60),
  ],
  [eventId("triathlon", "half_iron")]: [
    level("finish", "Finish", "Complete the distance.", null),
    level("sub_7_00", "Sub-7:00", "Finish in under 7:00:00.", 7 * 3600),
    level("sub_6_00", "Sub-6:00", "Finish in under 6:00:00.", 6 * 3600),
    level("sub_5_00", "Sub-5:00", "Finish in under 5:00:00.", 5 * 3600),
    level("elite", "Elite", "Finish in under 4:00:00.", 4 * 3600),
  ],
  [eventId("triathlon", "full_iron")]: [
    level("finish", "Finish", "Complete the distance.", null),
    level("sub_15_00", "Sub-15:00", "Finish in under 15:00:00.", 15 * 3600),
    level("sub_13_00", "Sub-13:00", "Finish in under 13:00:00.", 13 * 3600),
    level("sub_12_00", "Sub-12:00", "Finish in under 12:00:00.", 12 * 3600),
    level("elite", "Elite", "Finish in under 8:30:00.", 8 * 3600 + 30 * 60),
  ],

  [eventId("running", "run_5k")]: [
    level("under_35", "Under 35:00", "Finish 5K in under 35 minutes.", 35 * 60),
    level("under_30", "Under 30:00", "Finish 5K in under 30 minutes.", 30 * 60),
    level("under_25", "Under 25:00", "Finish 5K in under 25 minutes.", 25 * 60),
    level("under_20", "Under 20:00", "Finish 5K in under 20 minutes.", 20 * 60),
    level("under_17", "Under 17:00", "Finish 5K in under 17 minutes.", 17 * 60),
    level("elite", "Elite", "Finish 5K in under 15 minutes.", 15 * 60),
  ],
  [eventId("running", "run_10k")]: [
    level("under_60", "Under 60:00", "Finish 10K in under 60 minutes.", 60 * 60),
    level("under_50", "Under 50:00", "Finish 10K in under 50 minutes.", 50 * 60),
    level("under_45", "Under 45:00", "Finish 10K in under 45 minutes.", 45 * 60),
    level("under_40", "Under 40:00", "Finish 10K in under 40 minutes.", 40 * 60),
    level("elite", "Elite", "Finish 10K in under 32 minutes.", 32 * 60),
  ],
  [eventId("running", "run_half_marathon")]: [
    level("under_2_30", "Under 2:30:00", "Finish in under 2:30:00.", 2.5 * 3600),
    level("under_2_00", "Under 2:00:00", "Finish in under 2:00:00.", 2 * 3600),
    level("under_1_45", "Under 1:45:00", "Finish in under 1:45:00.", 1.75 * 3600),
    level("under_1_30", "Under 1:30:00", "Finish in under 1:30:00.", 1.5 * 3600),
    level("elite", "Elite", "Finish in under 1:10:00.", 3600 + 10 * 60),
  ],
  [eventId("running", "run_marathon")]: [
    level("under_5_00", "Under 5:00:00", "Finish in under 5:00:00.", 5 * 3600),
    level("under_4_00", "Under 4:00:00", "Finish in under 4:00:00.", 4 * 3600),
    level("under_3_30", "Under 3:30:00", "Finish in under 3:30:00.", 3.5 * 3600),
    level("under_3_00", "Under 3:00:00", "Finish in under 3:00:00.", 3 * 3600),
    level("elite", "Elite", "Finish in under 2:20:00.", 2 * 3600 + 20 * 60),
  ],

  [eventId("swimming", "swim_400m")]: [
    level("under_8_00", "Under 8:00", "Finish 400m in under 8:00.", 8 * 60),
    level("under_7_00", "Under 7:00", "Finish 400m in under 7:00.", 7 * 60),
    level("under_6_30", "Under 6:30", "Finish 400m in under 6:30.", 6 * 60 + 30),
    level("under_6_00", "Under 6:00", "Finish 400m in under 6:00.", 6 * 60),
    level("under_5_30", "Under 5:30", "Finish 400m in under 5:30.", 5 * 60 + 30),
    level("elite", "Elite", "Finish 400m in under 5:00.", 5 * 60),
  ],
};
