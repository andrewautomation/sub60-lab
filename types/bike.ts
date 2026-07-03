export interface BikeTest {
  id: string;
  test_date: string;
  test_type: string;
  test_type_id: string | null;
  distance_km: number;
  time_seconds: number;
  avg_power: number | null;
  normalized_power: number | null;
  max_power: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_cadence: number | null;
  avg_speed_kmh: number | null;
  notes: string | null;
}

export type NewBikeTest = Omit<BikeTest, "id">;
