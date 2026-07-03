import { TestFieldConfig, TestFormValues } from "@/components/tests/TestForm";
import { TestColumnConfig } from "@/components/tests/TestHistoryTable";
import { NewSwimTest, SwimTest } from "@/types/swim";
import { formatTime, formatDuration } from "@/lib/format/time";
import { formatOrDash } from "@/lib/format/value";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";

export const SWIM_TEST_FIELDS: TestFieldConfig[] = [
  { key: "test_date", label: "Date", type: "date", required: true },
  { key: "test_type_id", label: "Test type", type: "test_type", required: true },
  { key: "distance_m", label: "Distance", type: "number", required: true, unit: "m" },
  { key: "time_seconds", label: "Time", type: "duration", required: true },
  { key: "pace_per_100m", label: "Pace / 100m", type: "text", placeholder: "e.g. 1:45" },
  { key: "swolf", label: "SWOLF", type: "number" },
  { key: "total_strokes", label: "Total strokes", type: "number" },
  { key: "stroke_rate", label: "Stroke rate", type: "number", unit: "spm" },
  { key: "avg_hr", label: "Avg HR", type: "number", unit: "bpm" },
  { key: "max_hr", label: "Max HR", type: "number", unit: "bpm" },
  { key: "pool_length_m", label: "Pool length", type: "number", unit: "m" },
  { key: "notes", label: "Notes", type: "textarea", placeholder: "Anything worth remembering about this session" },
];

export const SWIM_TEST_DEFAULT_VALUES: TestFormValues = {
  test_date: null,
  test_type: "",
  test_type_id: null,
  distance_m: null,
  time_seconds: null,
  pace_per_100m: null,
  swolf: null,
  total_strokes: null,
  stroke_rate: null,
  avg_hr: null,
  max_hr: null,
  pool_length_m: null,
  notes: null,
};

/**
 * Keeps Time and Pace/100m in sync as the athlete fills the form — same
 * derive-the-other-field behavior as lib/tests/runFields.ts's
 * withDerivedRunFields, scaled by 100m instead of 1km.
 */
export function withDerivedSwimFields(
  current: TestFormValues,
  key: string,
  value: string | number | null
): TestFormValues {
  const next = { ...current, [key]: value };
  const distanceM = typeof next.distance_m === "number" ? next.distance_m : null;
  if (!distanceM) return next;

  if (key === "time_seconds" && typeof value === "number") {
    next.pace_per_100m = formatDuration(value / (distanceM / 100));
  } else if (key === "pace_per_100m" && typeof value === "string") {
    const paceSecondsPer100m = parseDurationToSeconds(value);
    if (paceSecondsPer100m !== null) next.time_seconds = Math.round(paceSecondsPer100m * (distanceM / 100));
  }

  return next;
}

export function swimTestToValues(test: SwimTest): TestFormValues {
  return { ...test };
}

export function valuesToNewSwimTest(values: TestFormValues): NewSwimTest {
  return {
    test_date: (values.test_date as string) ?? "",
    test_type: (values.test_type as string) ?? "",
    test_type_id: (values.test_type_id as string) ?? null,
    distance_m: (values.distance_m as number) ?? 0,
    time_seconds: (values.time_seconds as number) ?? 0,
    pace_per_100m: (values.pace_per_100m as string) ?? null,
    swolf: (values.swolf as number) ?? null,
    total_strokes: (values.total_strokes as number) ?? null,
    stroke_rate: (values.stroke_rate as number) ?? null,
    avg_hr: (values.avg_hr as number) ?? null,
    max_hr: (values.max_hr as number) ?? null,
    pool_length_m: (values.pool_length_m as number) ?? null,
    notes: (values.notes as string) ?? null,
  };
}

export const SWIM_TEST_COLUMNS: TestColumnConfig<SwimTest>[] = [
  { key: "test_date", label: "Date", render: (t) => t.test_date },
  { key: "test_type", label: "Test", render: (t) => t.test_type },
  { key: "distance_m", label: "Distance", render: (t) => `${t.distance_m} m` },
  { key: "time_seconds", label: "Time", render: (t) => formatTime(t.time_seconds) },
  { key: "pace_per_100m", label: "Pace", render: (t) => formatOrDash(t.pace_per_100m) },
  { key: "swolf", label: "SWOLF", render: (t) => formatOrDash(t.swolf) },
  { key: "avg_hr", label: "Avg HR", render: (t) => formatOrDash(t.avg_hr, " bpm") },
  { key: "notes", label: "Notes", render: (t) => formatOrDash(t.notes) },
];
