export interface SwimTest {
  id: string;
  test_date: string;
  test_type: string;
  distance_m: number;
  time_seconds: number;
  pace_per_100m: string | null;
  swolf: number | null;
  total_strokes: number | null;
  stroke_rate: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  pool_length_m: number | null;
}

export type SwimTestSummary = Pick<
  SwimTest,
  "test_date" | "distance_m" | "time_seconds" | "pace_per_100m" | "swolf"
>;

export type NewSwimTest = Omit<SwimTest, "id">;
