export interface SwimTarget {
  distance_m: number;
  time_seconds: number;
}

export interface BikeTarget {
  distance_km: number;
  avg_speed_kmh: number;
}

export interface RunTarget {
  distance_km: number;
  pace_seconds_per_km: number;
}

export interface SprintTargets {
  swim: SwimTarget;
  bike: BikeTarget;
  run: RunTarget;
  totalTimeSeconds: number;
}
