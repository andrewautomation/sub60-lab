import { supabase } from "@/lib/supabase";
import { Sport, EventRow } from "@/types/sport";
import { SportKey } from "@/lib/sports/types";

/**
 * Reads the seeded `sports`/`events` reference tables. Most of the app
 * should prefer lib/sports/registry.ts instead — same data, no network —
 * and reach for this service only when it specifically needs the
 * DB-verified row (e.g. confirming a foreign key exists before writing a
 * profile/goal, or a future admin screen for editing the catalog).
 */

export async function fetchSports(): Promise<Sport[]> {
  const { data, error } = await supabase.from("sports").select("id, name, emoji, disciplines, created_at");
  if (error || !data) return [];
  return data;
}

export async function fetchEventsForSport(sportId: SportKey): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, sport_id, key, name, kind, legs, is_custom, sort_order")
    .eq("sport_id", sportId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data;
}
