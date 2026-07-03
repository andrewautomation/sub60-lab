import { eventId, isValidEvent } from "@/lib/sports/registry";
import { getGoalLevel, hasGoalLadder } from "@/lib/goals/registry";
import { SportKey } from "@/lib/sports/types";
import { Sex } from "@/types/athlete";
import { warnIfOutOfRange } from "./shared";

/** Field-level errors block advancing to the next step; warnings (implausible
 * but not invalid values, mirroring lib/validators/shared.ts's
 * warnIfOutOfRange convention) are shown inline but don't block. */
export interface StepValidation {
  ok: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

function ok(warnings: Record<string, string> = {}): StepValidation {
  return { ok: true, errors: {}, warnings };
}

function fail(errors: Record<string, string>, warnings: Record<string, string> = {}): StepValidation {
  return { ok: false, errors, warnings };
}

export function validateSportStep(sport: SportKey | null): StepValidation {
  if (!sport) return fail({ primary_sport: "Choose a sport to continue." });
  return ok();
}

export function validateEventStep(sport: SportKey | null, eventKey: string | null): StepValidation {
  if (!sport) return fail({ primary_event_key: "Choose a sport first." });
  if (!eventKey || !isValidEvent(sport, eventKey)) {
    return fail({ primary_event_key: "Choose an event to continue." });
  }
  return ok();
}

export function validateProfileStep(input: {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  sex: Sex;
  height_cm: number | null;
  weight_kg: number | null;
  country: string | null;
}): StepValidation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!input.first_name.trim()) errors.first_name = "Enter your first name.";
  if (!input.last_name.trim()) errors.last_name = "Enter your last name.";

  if (!input.birth_date) {
    errors.birth_date = "Enter your date of birth.";
  } else {
    const birth = new Date(input.birth_date);
    if (Number.isNaN(birth.getTime())) {
      errors.birth_date = "Enter a valid date.";
    } else if (birth.getTime() > Date.now()) {
      errors.birth_date = "Date of birth can't be in the future.";
    } else if (new Date().getFullYear() - birth.getFullYear() > 120) {
      errors.birth_date = "Enter a valid date of birth.";
    }
  }

  if (!input.country || !input.country.trim()) {
    errors.country = "Enter your country.";
  }

  const heightWarning = warnIfOutOfRange(input.height_cm, 100, 230, "Height", "cm");
  if (heightWarning) warnings.height_cm = heightWarning;

  const weightWarning = warnIfOutOfRange(input.weight_kg, 30, 200, "Weight", "kg");
  if (weightWarning) warnings.weight_kg = weightWarning;

  return Object.keys(errors).length === 0 ? ok(warnings) : fail(errors, warnings);
}

/**
 * A goal is required only when the chosen event has a curated ladder to pick
 * from (lib/goals/catalog.ts) — an event without one (e.g. Cycling FTP Test
 * today) has nothing to choose, so onboarding shouldn't block on it. See
 * GoalStep.tsx for the corresponding "no predefined goals yet" UI state.
 */
export function validateGoalStep(
  sport: SportKey | null,
  eventKey: string | null,
  goalLevelKey: string | null
): StepValidation {
  if (!sport || !eventKey) return fail({ goal_level_key: "Choose a sport and event first." });

  const id = eventId(sport, eventKey);
  if (!hasGoalLadder(id)) return ok();

  if (!goalLevelKey || !getGoalLevel(id, goalLevelKey)) {
    return fail({ goal_level_key: "Choose a goal to continue." });
  }

  return ok();
}
