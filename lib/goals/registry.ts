import { GOAL_LADDERS } from "./catalog";
import { GoalLevel } from "./types";

export function getGoalLevelsForEvent(compositeEventId: string): GoalLevel[] {
  return GOAL_LADDERS[compositeEventId] ?? [];
}

export function getGoalLevel(compositeEventId: string, levelKey: string): GoalLevel | null {
  return getGoalLevelsForEvent(compositeEventId).find((lvl) => lvl.key === levelKey) ?? null;
}

export function hasGoalLadder(compositeEventId: string): boolean {
  return compositeEventId in GOAL_LADDERS;
}
