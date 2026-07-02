/**
 * A value outside this range is still saved — it's flagged as a warning for
 * the user to confirm on the preview screen, not rejected outright. Only
 * missing/invalid required fields (date, distance, time) are hard errors.
 */
export function warnIfOutOfRange(
  value: number | null,
  min: number,
  max: number,
  label: string,
  unit: string
): string | null {
  if (value === null) return null;
  if (value >= min && value <= max) return null;
  return `${label} looks unusual (${value} ${unit}) — please double-check.`;
}
