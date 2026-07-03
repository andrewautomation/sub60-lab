import { TestFieldConfig, TestFormValues } from "@/components/tests/TestForm";
import { TestColumnConfig } from "@/components/tests/TestHistoryTable";
import { BikeTest, NewBikeTest } from "@/types/bike";
import { formatTime } from "@/lib/format/time";
import { formatOrDash } from "@/lib/format/value";

export const BIKE_TEST_FIELDS: TestFieldConfig[] = [
  { key: "test_date", label: "Date", type: "date", required: true },
  { key: "test_type", label: "Test type", type: "text", required: true, placeholder: "e.g. 10K Time Trial" },
  { key: "distance_km", label: "Distance", type: "number", required: true, step: 0.01, unit: "km" },
  { key: "time_seconds", label: "Time", type: "duration", required: true },
  { key: "avg_power", label: "Avg power", type: "number", unit: "W" },
  { key: "normalized_power", label: "Normalized power", type: "number", unit: "W" },
  { key: "max_power", label: "Max power", type: "number", unit: "W" },
  { key: "avg_hr", label: "Avg HR", type: "number", unit: "bpm" },
  { key: "max_hr", label: "Max HR", type: "number", unit: "bpm" },
  { key: "avg_cadence", label: "Avg cadence", type: "number", unit: "rpm" },
  { key: "avg_speed_kmh", label: "Avg speed", type: "number", step: 0.1, unit: "km/h" },
  { key: "notes", label: "Notes", type: "textarea", placeholder: "Anything worth remembering about this ride" },
];

export const BIKE_TEST_DEFAULT_VALUES: TestFormValues = {
  test_date: null,
  test_type: "",
  distance_km: null,
  time_seconds: null,
  avg_power: null,
  normalized_power: null,
  max_power: null,
  avg_hr: null,
  max_hr: null,
  avg_cadence: null,
  avg_speed_kmh: null,
  notes: null,
};

export function bikeTestToValues(test: BikeTest): TestFormValues {
  return { ...test };
}

export function valuesToNewBikeTest(values: TestFormValues): NewBikeTest {
  return {
    test_date: (values.test_date as string) ?? "",
    test_type: (values.test_type as string) ?? "",
    distance_km: (values.distance_km as number) ?? 0,
    time_seconds: (values.time_seconds as number) ?? 0,
    avg_power: (values.avg_power as number) ?? null,
    normalized_power: (values.normalized_power as number) ?? null,
    max_power: (values.max_power as number) ?? null,
    avg_hr: (values.avg_hr as number) ?? null,
    max_hr: (values.max_hr as number) ?? null,
    avg_cadence: (values.avg_cadence as number) ?? null,
    avg_speed_kmh: (values.avg_speed_kmh as number) ?? null,
    notes: (values.notes as string) ?? null,
  };
}

export const BIKE_TEST_COLUMNS: TestColumnConfig<BikeTest>[] = [
  { key: "test_date", label: "Date", render: (t) => t.test_date },
  { key: "test_type", label: "Test", render: (t) => t.test_type },
  { key: "distance_km", label: "Distance", render: (t) => `${t.distance_km} km` },
  { key: "time_seconds", label: "Time", render: (t) => formatTime(t.time_seconds) },
  { key: "avg_speed_kmh", label: "Avg speed", render: (t) => formatOrDash(t.avg_speed_kmh, " km/h") },
  { key: "avg_power", label: "Avg power", render: (t) => formatOrDash(t.avg_power, " W") },
  { key: "avg_hr", label: "Avg HR", render: (t) => formatOrDash(t.avg_hr, " bpm") },
  { key: "notes", label: "Notes", render: (t) => formatOrDash(t.notes) },
];
