export interface RunTest {
  id: string;
  test_date: string;
  test_type: string;
  distance_km: number;
  time_seconds: number;
  pace_per_km: string | null;
  threshold_pace: string | null;
  cadence: number | null;
  avg_hr: number | null;
  max_hr: number | null;
}

export type NewRunTest = Omit<RunTest, "id">;
