import { NewRunTest } from "@/types/run";
import { FormValidation, validationFail, validationOk, warnIfOutOfRange } from "./shared";

/** Gates manual Add/Edit Run Test input. */
export function validateRunTestForm(input: NewRunTest): FormValidation {
  const errors: Record<string, string> = {};

  if (!input.test_date) {
    errors.test_date = "Enter the test date.";
  } else if (Number.isNaN(new Date(input.test_date).getTime())) {
    errors.test_date = "Enter a valid date.";
  } else if (new Date(input.test_date).getTime() > Date.now()) {
    errors.test_date = "Test date can't be in the future.";
  }

  if (!input.test_type.trim()) errors.test_type = "Describe the test (e.g. 5K Time Trial).";
  if (!input.distance_km || input.distance_km <= 0) errors.distance_km = "Enter a valid distance.";
  if (!input.time_seconds || input.time_seconds <= 0) errors.time_seconds = "Enter a valid time.";

  const warnings: Record<string, string> = {};
  const cadenceWarning = warnIfOutOfRange(input.avg_cadence, 60, 250, "Avg cadence", "spm");
  if (cadenceWarning) warnings.avg_cadence = cadenceWarning;
  const strideWarning = warnIfOutOfRange(input.stride_length_m, 0.5, 3, "Stride length", "m");
  if (strideWarning) warnings.stride_length_m = strideWarning;
  const avgHrWarning = warnIfOutOfRange(input.avg_hr, 30, 230, "Avg HR", "bpm");
  if (avgHrWarning) warnings.avg_hr = avgHrWarning;
  const maxHrWarning = warnIfOutOfRange(input.max_hr, 30, 230, "Max HR", "bpm");
  if (maxHrWarning) warnings.max_hr = maxHrWarning;

  return Object.keys(errors).length === 0 ? validationOk(warnings) : validationFail(errors, warnings);
}
