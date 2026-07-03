import { TestFieldConfig, TestFormValues } from "@/components/tests/TestForm";
import { TestColumnConfig } from "@/components/tests/TestHistoryTable";
import { NewRunTest, RunTest } from "@/types/run";
import { formatTime } from "@/lib/format/time";
import { formatOrDash } from "@/lib/format/value";

export const RUN_TEST_FIELDS: TestFieldConfig[] = [
  { key: "test_date", label: "Date", type: "date", required: true },
  { key: "test_type", label: "Test type", type: "text", required: true, placeholder: "e.g. 5K Time Trial" },
  { key: "distance_km", label: "Distance", type: "number", required: true, step: 0.01, unit: "km" },
  { key: "time_seconds", label: "Time", type: "duration", required: true },
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
  distance_km: null,
  time_seconds: null,
  pace_per_km: null,
  avg_hr: null,
  max_hr: null,
  avg_cadence: null,
  stride_length_m: null,
  notes: null,
};

export function runTestToValues(test: RunTest): TestFormValues {
  return { ...test };
}

export function valuesToNewRunTest(values: TestFormValues): NewRunTest {
  return {
    test_date: (values.test_date as string) ?? "",
    test_type: (values.test_type as string) ?? "",
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
