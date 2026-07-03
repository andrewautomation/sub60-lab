import { isValidEvent } from "@/lib/sports/registry";
import { Discipline, SportKey } from "@/lib/sports/types";
import {
  AthleteBaselines,
  BikeBaselineInput,
  ExperienceLevel,
  RunBaselineInput,
  Sex,
  SwimBaselineInput,
} from "@/types/athlete";
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
  display_name: string;
  sex: Sex;
  experience_level: ExperienceLevel;
  height_cm: number | null;
  weight_kg: number | null;
  training_days_per_week: number | null;
}): StepValidation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!input.display_name.trim()) {
    errors.display_name = "Enter a name.";
  }

  const heightWarning = warnIfOutOfRange(input.height_cm, 100, 230, "Height", "cm");
  if (heightWarning) warnings.height_cm = heightWarning;

  const weightWarning = warnIfOutOfRange(input.weight_kg, 30, 200, "Weight", "kg");
  if (weightWarning) warnings.weight_kg = weightWarning;

  if (input.training_days_per_week !== null && (input.training_days_per_week < 0 || input.training_days_per_week > 14)) {
    errors.training_days_per_week = "Training days must be between 0 and 14.";
  }

  return Object.keys(errors).length === 0 ? ok(warnings) : fail(errors, warnings);
}

function validateSwimBaseline(baseline: SwimBaselineInput | undefined): string | null {
  if (!baseline) return null;
  if (baseline.distance_m <= 0) return "Enter a valid swim distance.";
  if (baseline.time_seconds <= 0) return "Enter a valid swim time.";
  return null;
}

function validateBikeBaseline(baseline: BikeBaselineInput | undefined): string | null {
  if (!baseline) return null;
  if (baseline.distance_km <= 0) return "Enter a valid bike distance.";
  if (baseline.time_seconds <= 0) return "Enter a valid bike time.";
  return null;
}

function validateRunBaseline(baseline: RunBaselineInput | undefined): string | null {
  if (!baseline) return null;
  if (baseline.distance_km <= 0) return "Enter a valid run distance.";
  if (baseline.time_seconds <= 0) return "Enter a valid run time.";
  return null;
}

/**
 * Baselines are optional per discipline — an athlete with no recent test
 * data can skip straight to goals. But a discipline that's partially
 * filled in (e.g. a time with no distance) is rejected rather than saved
 * as a bad first row in swim_tests/bike_tests/run_tests.
 */
export function validateBaselineStep(disciplines: Discipline[], baselines: AthleteBaselines): StepValidation {
  const errors: Record<string, string> = {};

  if (disciplines.includes("swim")) {
    const error = validateSwimBaseline(baselines.swim);
    if (error) errors.swim = error;
  }
  if (disciplines.includes("bike")) {
    const error = validateBikeBaseline(baselines.bike);
    if (error) errors.bike = error;
  }
  if (disciplines.includes("run")) {
    const error = validateRunBaseline(baselines.run);
    if (error) errors.run = error;
  }

  return Object.keys(errors).length === 0 ? ok() : fail(errors);
}

export function validateGoalStep(input: {
  goal_target_date: string | null;
  goal_target_time_seconds: number | null;
}): StepValidation {
  const errors: Record<string, string> = {};

  if (input.goal_target_date && Number.isNaN(new Date(input.goal_target_date).getTime())) {
    errors.goal_target_date = "Enter a valid date.";
  }

  if (input.goal_target_time_seconds !== null && input.goal_target_time_seconds <= 0) {
    errors.goal_target_time_seconds = "Goal time must be positive.";
  }

  return Object.keys(errors).length === 0 ? ok() : fail(errors);
}
