import { NewSwimTest } from "@/types/swim";
import { FormValidation, validationFail, validationOk, warnIfOutOfRange } from "./shared";

/** Gates manual Add/Edit Swim Test input. */
export function validateSwimTestForm(input: NewSwimTest): FormValidation {
  const errors: Record<string, string> = {};

  if (!input.test_date) {
    errors.test_date = "Enter the test date.";
  } else if (Number.isNaN(new Date(input.test_date).getTime())) {
    errors.test_date = "Enter a valid date.";
  } else if (new Date(input.test_date).getTime() > Date.now()) {
    errors.test_date = "Test date can't be in the future.";
  }

  if (!input.test_type.trim()) errors.test_type = "Describe the test (e.g. 400m Time Trial).";
  if (!input.distance_m || input.distance_m <= 0) errors.distance_m = "Enter a valid distance.";
  if (!input.time_seconds || input.time_seconds <= 0) errors.time_seconds = "Enter a valid time.";

  const warnings: Record<string, string> = {};
  const swolfWarning = warnIfOutOfRange(input.swolf, 10, 200, "SWOLF", "");
  if (swolfWarning) warnings.swolf = swolfWarning;
  const strokeRateWarning = warnIfOutOfRange(input.stroke_rate, 10, 100, "Stroke rate", "spm");
  if (strokeRateWarning) warnings.stroke_rate = strokeRateWarning;
  const poolWarning = warnIfOutOfRange(input.pool_length_m, 10, 100, "Pool length", "m");
  if (poolWarning) warnings.pool_length_m = poolWarning;
  const avgHrWarning = warnIfOutOfRange(input.avg_hr, 30, 230, "Avg HR", "bpm");
  if (avgHrWarning) warnings.avg_hr = avgHrWarning;
  const maxHrWarning = warnIfOutOfRange(input.max_hr, 30, 230, "Max HR", "bpm");
  if (maxHrWarning) warnings.max_hr = maxHrWarning;

  return Object.keys(errors).length === 0 ? validationOk(warnings) : validationFail(errors, warnings);
}
