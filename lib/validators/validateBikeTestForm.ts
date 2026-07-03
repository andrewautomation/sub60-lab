import { NewBikeTest } from "@/types/bike";
import { FormValidation, validationFail, validationOk, warnIfOutOfRange } from "./shared";

/** Gates manual Add/Edit Bike Test input. */
export function validateBikeTestForm(input: NewBikeTest): FormValidation {
  const errors: Record<string, string> = {};

  if (!input.test_date) {
    errors.test_date = "Enter the test date.";
  } else if (Number.isNaN(new Date(input.test_date).getTime())) {
    errors.test_date = "Enter a valid date.";
  } else if (new Date(input.test_date).getTime() > Date.now()) {
    errors.test_date = "Test date can't be in the future.";
  }

  if (!input.test_type.trim()) errors.test_type = "Describe the test (e.g. 10K Time Trial).";
  if (!input.distance_km || input.distance_km <= 0) errors.distance_km = "Enter a valid distance.";
  if (!input.time_seconds || input.time_seconds <= 0) errors.time_seconds = "Enter a valid time.";

  const warnings: Record<string, string> = {};
  const avgPowerWarning = warnIfOutOfRange(input.avg_power, 0, 600, "Avg power", "W");
  if (avgPowerWarning) warnings.avg_power = avgPowerWarning;
  const npWarning = warnIfOutOfRange(input.normalized_power, 0, 600, "Normalized power", "W");
  if (npWarning) warnings.normalized_power = npWarning;
  const maxPowerWarning = warnIfOutOfRange(input.max_power, 0, 700, "Max power", "W");
  if (maxPowerWarning) warnings.max_power = maxPowerWarning;
  const cadenceWarning = warnIfOutOfRange(input.avg_cadence, 20, 140, "Avg cadence", "rpm");
  if (cadenceWarning) warnings.avg_cadence = cadenceWarning;
  const speedWarning = warnIfOutOfRange(input.avg_speed_kmh, 5, 70, "Avg speed", "km/h");
  if (speedWarning) warnings.avg_speed_kmh = speedWarning;
  const avgHrWarning = warnIfOutOfRange(input.avg_hr, 30, 230, "Avg HR", "bpm");
  if (avgHrWarning) warnings.avg_hr = avgHrWarning;
  const maxHrWarning = warnIfOutOfRange(input.max_hr, 30, 230, "Max HR", "bpm");
  if (maxHrWarning) warnings.max_hr = maxHrWarning;

  return Object.keys(errors).length === 0 ? validationOk(warnings) : validationFail(errors, warnings);
}
