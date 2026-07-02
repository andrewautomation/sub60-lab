export type ActivityKind = "swim" | "bike" | "run";

/**
 * How the activity kind was determined. Priority order (tier 1 wins):
 * 1. activity_type   — the CSV's own "Activity Type" column (confident)
 * 2. title            — matched from the free-text "Title" column (confident)
 * 3. distance_heuristic — no reliable signal; inferred from distance/columns
 *    (not confident — the UI must surface this as a warning for review)
 */
export type DetectionSource = "activity_type" | "title" | "distance_heuristic";

export interface ActivityDetection {
  kind: ActivityKind;
  source: DetectionSource;
  confident: boolean;
  note: string;
}

// --- Normalizer output: best-effort field extraction, nothing rejected yet ---

export interface SwimDraft {
  title: string | null;
  test_date: string | null;
  distance_m: number | null;
  time_seconds: number | null;
  pace_per_100m: string | null;
  swolf: number | null;
  total_strokes: number | null;
  stroke_rate: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  pool_length_m: number | null;
}

export interface BikeDraft {
  title: string | null;
  test_date: string | null;
  distance_km: number | null;
  time_seconds: number | null;
  avg_power: number | null;
  normalized_power: number | null;
  cadence: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_speed_kmh: number | null;
}

export interface RunDraft {
  title: string | null;
  test_date: string | null;
  distance_km: number | null;
  time_seconds: number | null;
  pace_per_km: string | null;
  cadence: number | null;
  avg_hr: number | null;
  max_hr: number | null;
}

// --- Validator output: required fields confirmed, ready to save ---

export interface ParsedSwimActivity {
  kind: "swim";
  title: string | null;
  test_date: string;
  distance_m: number;
  time_seconds: number;
  pace_per_100m: string | null;
  swolf: number | null;
  total_strokes: number | null;
  stroke_rate: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  pool_length_m: number | null;
  warnings: string[];
}

export interface ParsedBikeActivity {
  kind: "bike";
  title: string | null;
  test_date: string;
  distance_km: number;
  time_seconds: number;
  avg_power: number | null;
  normalized_power: number | null;
  cadence: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_speed_kmh: number | null;
  warnings: string[];
}

export interface ParsedRunActivity {
  kind: "run";
  title: string | null;
  test_date: string;
  distance_km: number;
  time_seconds: number;
  pace_per_km: string | null;
  cadence: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  warnings: string[];
}

export type ParsedActivity =
  | ParsedSwimActivity
  | ParsedBikeActivity
  | ParsedRunActivity;

export interface ActivityParseIssue {
  row: number;
  field?: string;
  message: string;
}

export interface ActivityParseResult {
  activities: ParsedActivity[];
  issues: ActivityParseIssue[];
}

/** Shared result shape returned by every lib/validators/validate*() function. */
export type ValidationResult<T> =
  | { ok: true; activity: T; warnings: string[] }
  | { ok: false; issue: ActivityParseIssue };
