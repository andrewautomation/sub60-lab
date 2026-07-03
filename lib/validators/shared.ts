/** Common return shape for a manual-entry form validator: `ok` gates
 * submission, `errors` block it, `warnings` are shown but don't block. */
export interface FormValidation {
  ok: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export function validationOk(warnings: Record<string, string> = {}): FormValidation {
  return { ok: true, errors: {}, warnings };
}

export function validationFail(
  errors: Record<string, string>,
  warnings: Record<string, string> = {}
): FormValidation {
  return { ok: false, errors, warnings };
}

/** Shared by /reset-password and the Settings page's change-password
 * form — the one password-strength rule this app enforces (Supabase's own
 * default minimum). */
export function validatePassword(password: string, confirm: string): { ok: boolean; error: string | null } {
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (password !== confirm) return { ok: false, error: "Passwords do not match." };
  return { ok: true, error: null };
}

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
