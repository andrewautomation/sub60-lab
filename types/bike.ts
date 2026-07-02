export interface BikeTest {
  id: string;
  test_date: string;
  test_type: string;
  distance_km: number;
  time_seconds: number;
  avg_power: number | null;
  normalized_power: number | null;
  ftp: number | null;
  cadence: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_speed_kmh: number | null;
}

export type NewBikeTest = Omit<BikeTest, "id">;
