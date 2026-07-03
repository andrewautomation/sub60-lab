import { supabase } from "@/lib/supabase";
import { Athlete, NewAthlete } from "@/types/athlete";

const PROFILE_COLUMNS =
  "id, user_id, first_name, last_name, birth_date, sex, height_cm, weight_kg, country, timezone, primary_sport_id, primary_event_id, primary_event_custom_legs, onboarding_completed_at, created_at, updated_at";

/** The signed-in user's athlete profile, or null if they haven't created
 * one yet. RLS scopes this to the caller's own row, so there's never a
 * need to filter by user_id explicitly here. */
export async function fetchProfile(): Promise<Athlete | null> {
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function fetchProfileById(profileId: string): Promise<Athlete | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", profileId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/** Upserts by user_id (unique) so calling this again — e.g. re-running
 * onboarding, or a later "edit profile" screen — updates the same row
 * instead of creating a second one. */
export async function upsertProfile(
  input: NewAthlete
): Promise<{ profile: Athlete | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(input, { onConflict: "user_id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (error || !data) return { profile: null, error: error?.message ?? "Could not save profile." };
  return { profile: data, error: null };
}

export async function markOnboardingComplete(profileId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", profileId);

  return { error: error?.message ?? null };
}
