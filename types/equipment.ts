export type BikeType = "road" | "tt" | "gravel" | "indoor";
export type PoolLength = 25 | 50;
export type RunningSurface = "road" | "track" | "trail";

/**
 * DB row for the `equipment` table — one row per athlete (profile_id is
 * both primary key and foreign key, a 1:1 relationship). Every field is
 * nullable: equipment is progressively disclosed, never required to
 * finish onboarding.
 */
export interface Equipment {
  profile_id: string;
  bike_type: BikeType | null;
  has_power_meter: boolean;
  has_smart_trainer: boolean;
  pool_length_m: PoolLength | null;
  running_surface: RunningSurface | null;
  updated_at: string;
}

export type NewEquipment = Omit<Equipment, "updated_at">;
