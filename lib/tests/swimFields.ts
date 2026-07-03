import { TestFieldConfig, TestFormValues } from "@/components/tests/TestForm";
import { TestColumnConfig } from "@/components/tests/TestHistoryTable";
import { NewSwimTest, SwimTest } from "@/types/swim";
import { formatTime } from "@/lib/format/time";
import { formatOrDash } from "@/lib/format/value";

export const SWIM_TEST_FIELDS: TestFieldConfig[] = [
  { key: "test_date", label: "Date", type: "date", required: true },
  { key: "test_type", label: "Test type", type: "text", required: true, placeholder: "e.g. 400m Time Trial" },
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

export function swimTestToValues(test: SwimTest): TestFormValues {
  return { ...test };
}

export function valuesToNewSwimTest(values: TestFormValues): NewSwimTest {
  return {
    test_date: (values.test_date as string) ?? "",
    test_type: (values.test_type as string) ?? "",
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
