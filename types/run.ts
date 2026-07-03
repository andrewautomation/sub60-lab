export interface RunTest {
  id: string;
  test_date: string;
  test_type: string;
  distance_km: number;
  time_seconds: number;
  pace_per_km: string | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_cadence: number | null;
  stride_length_m: number | null;
  notes: string | null;
}

export type NewRunTest = Omit<RunTest, "id">;
