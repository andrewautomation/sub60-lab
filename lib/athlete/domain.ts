import { RaceFormat } from "@/lib/race/models";
import { getEventById, getSport, getDisciplinesForSport } from "@/lib/sports/registry";
import { Discipline, EventDefinition, SportDefinition } from "@/lib/sports/types";
import { getGoalLevel } from "@/lib/goals/registry";
import { formatTime } from "@/lib/format/time";
import { Athlete } from "@/types/athlete";
import { Goal } from "@/types/goal";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Pure derivations over Athlete + the Sport & Event Catalog (and, for
 * goal-shaped questions, a specific Goal row). This is the seam
 * dashboards, analytics, goals, race prediction, and AI coaching are
 * meant to consume — none of them should re-implement "which disciplines
 * does this athlete train" or "what race format is this" themselves.
 */

export function getPrimarySport(athlete: Athlete): SportDefinition {
  return getSport(athlete.primary_sport_id);
}

export function getPrimaryEvent(athlete: Athlete): EventDefinition | null {
  return getEventById(athlete.primary_event_id);
}

export function getPrimaryDisciplines(athlete: Athlete): Discipline[] {
  return getDisciplinesForSport(athlete.primary_sport_id);
}

export function isMultiDiscipline(athlete: Athlete): boolean {
  return getPrimaryDisciplines(athlete).length > 1;
}

/** Non-null only when the athlete's event maps onto the Race Intelligence
 * Engine's format catalog (currently: triathlon events). Callers should
 * treat null as "no race prediction available for this athlete's event". */
export function getPrimaryRaceFormat(athlete: Athlete): RaceFormat | null {
  return getPrimaryEvent(athlete)?.raceFormat ?? null;
}

export function getPrimaryEventLabel(athlete: Athlete): string {
  const sport = getPrimarySport(athlete);
  const event = getPrimaryEvent(athlete);
  return event ? `${sport.label} — ${event.label}` : sport.label;
}

export function ageFromDateOfBirth(athlete: Pick<Athlete, "birth_date">, referenceDate: Date = new Date()): number | null {
  if (!athlete.birth_date) return null;

  const birth = new Date(athlete.birth_date);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > birth.getMonth() ||
    (referenceDate.getMonth() === birth.getMonth() && referenceDate.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
}

export function hasCompletedOnboarding(athlete: Pick<Athlete, "onboarding_completed_at">): boolean {
  return athlete.onboarding_completed_at !== null;
}

/** Whole days until a goal's target_date; negative if it's already
 * passed. Null if the goal has no target date. */
export function daysUntilGoal(goal: Pick<Goal, "target_date">, referenceDate: Date = new Date()): number | null {
  if (!goal.target_date) return null;
  const target = new Date(goal.target_date);
  return Math.ceil((target.getTime() - referenceDate.getTime()) / MS_PER_DAY);
}

/**
 * Human-readable description of a goal: the curated level's display name
 * ("Sub-60") when level_key is set, otherwise the custom target formatted
 * as a time. Falls back to "Custom target" if a level_key doesn't resolve
 * (e.g. the ladder changed after the goal was set) rather than throwing —
 * a stale goal should degrade gracefully, not break the dashboard.
 */
export function describeGoal(goal: Pick<Goal, "event_id" | "level_key" | "custom_target_value">): string {
  if (goal.level_key) {
    const level = getGoalLevel(goal.event_id, goal.level_key);
    return level?.display_name ?? "Custom target";
  }
  if (goal.custom_target_value !== null) {
    return formatTime(goal.custom_target_value);
  }
  return "No target set";
}
