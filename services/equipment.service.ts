import { supabase } from "@/lib/supabase";
import { Equipment, NewEquipment } from "@/types/equipment";

const EQUIPMENT_COLUMNS = "profile_id, bike_type, has_power_meter, has_smart_trainer, pool_length_m, running_surface, updated_at";

export async function fetchEquipment(profileId: string): Promise<Equipment | null> {
  const { data, error } = await supabase
    .from("equipment")
    .select(EQUIPMENT_COLUMNS)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function upsertEquipment(input: NewEquipment): Promise<{ error: string | null }> {
  const { error } = await supabase.from("equipment").upsert(input, { onConflict: "profile_id" });
  return { error: error?.message ?? null };
}
