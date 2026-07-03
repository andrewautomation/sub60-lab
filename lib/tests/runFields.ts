import { TestFieldConfig, TestFormValues } from "@/components/tests/TestForm";
import { TestColumnConfig } from "@/components/tests/TestHistoryTable";
import { NewRunTest, RunTest } from "@/types/run";
import { formatTime, formatDuration } from "@/lib/format/time";
import { formatOrDash } from "@/lib/format/value";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";

export const RUN_TEST_FIELDS: TestFieldConfig[] = [
  { key: "test_date", label: "Date", type: "date", required: true },
  { key: "test_type_id", label: "Test type", type: "test_type", required: true },
  { key: "distance_km", label: "Distance", type: "number", required: true, step: 0.01, unit: "km", isDistance: true },
  { key: "time_seconds", label: "Time", type: "duration", required: true, isTime: true },
  { key: "pace_per_km", label: "Pace / km", type: "text", placeholder: "e.g. 4:30" },
  { key: "avg_hr", label: "Avg HR", type: "number", unit: "bpm" },
  { key: "max_hr", label: "Max HR", type: "number", unit: "bpm" },
  { key: "avg_cadence", label: "Avg cadence", type: "number", unit: "spm" },
  { key: "stride_length_m", label: "Stride length", type: "number", step: 0.01, unit: "m" },
  { key: "notes", label: "Notes", type: "textarea", placeholder: "Anything worth remembering about this run" },
];

export const RUN_TEST_DEFAULT_VALUES: TestFormValues = {
  test_date: null,
  test_type: "",
  test_type_id: null,
  distance_km: null,
  time_seconds: null,
  pace_per_km: null,
  avg_hr: null,
  max_hr: null,
  avg_cadence: null,
  stride_length_m: null,
  notes: null,
};

/**
 * Keeps Time and Pace/km in sync as the athlete fills the form — editing
 * either one (once Distance is known) derives the other, rather than
 * letting the two drift apart as independent free-text fields.
 */
export function withDerivedRunFields(
  current: TestFormValues,
  key: string,
  value: string | number | null
): TestFormValues {
  const next = { ...current, [key]: value };
  const distanceKm = typeof next.distance_km === "number" ? next.distance_km : null;
  if (!distanceKm) return next;

  if (key === "time_seconds" && typeof value === "number") {
    next.pace_per_km = formatDuration(value / distanceKm);
  } else if (key === "pace_per_km" && typeof value === "string") {
    const paceSecondsPerKm = parseDurationToSeconds(value);
    if (paceSecondsPerKm !== null) next.time_seconds = Math.round(paceSecondsPerKm * distanceKm);
  }

  return next;
}

export function runTestToValues(test: RunTest): TestFormValues {
  return { ...test };
}

export function valuesToNewRunTest(values: TestFormValues): NewRunTest {
  return {
    test_date: (values.test_date as string) ?? "",
    test_type: (values.test_type as string) ?? "",
    test_type_id: (values.test_type_id as string) ?? null,
    distance_km: (values.distance_km as number) ?? 0,
    time_seconds: (values.time_seconds as number) ?? 0,
    pace_per_km: (values.pace_per_km as string) ?? null,
    avg_hr: (values.avg_hr as number) ?? null,
    max_hr: (values.max_hr as number) ?? null,
    avg_cadence: (values.avg_cadence as number) ?? null,
    stride_length_m: (values.stride_length_m as number) ?? null,
    notes: (values.notes as string) ?? null,
  };
}

export const RUN_TEST_COLUMNS: TestColumnConfig<RunTest>[] = [
  { key: "test_date", label: "Date", render: (t) => t.test_date },
  { key: "test_type", label: "Test", render: (t) => t.test_type },
  { key: "distance_km", label: "Distance", render: (t) => `${t.distance_km} km` },
  { key: "time_seconds", label: "Time", render: (t) => formatTime(t.time_seconds) },
  { key: "pace_per_km", label: "Pace", render: (t) => formatOrDash(t.pace_per_km) },
  { key: "avg_cadence", label: "Cadence", render: (t) => formatOrDash(t.avg_cadence, " spm") },
  { key: "avg_hr", label: "Avg HR", render: (t) => formatOrDash(t.avg_hr, " bpm") },
  { key: "notes", label: "Notes", render: (t) => formatOrDash(t.notes) },
];
