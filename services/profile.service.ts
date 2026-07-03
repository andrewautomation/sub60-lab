import { supabase } from "@/lib/supabase";
import { Athlete, NewAthlete } from "@/types/athlete";

const PROFILE_COLUMNS =
  "id, user_id, first_name, last_name, birth_date, sex, height_cm, weight_kg, country, timezone, primary_sport_id, primary_event_id, primary_event_custom_legs, onboarding_completed_at, created_at, updated_at";

/** The signed-in user's athlete profile, or null if they haven't created
 * one yet. RLS scopes this to the caller's own row, so there's never a
 * need to filter by user_id explicitly here.
 *
 * `error` is only set for a genuine fetch failure (network, RLS, etc) —
 * never for the legitimate "no profile yet" case, which is `profile: null,
 * error: null`. Callers must check `error` before treating a null profile
 * as "onboarding not done yet": collapsing the two looks identical to a
 * signed-in athlete as either a fresh account or a broken one. */
export async function fetchProfile(): Promise<{ profile: Athlete | null; error: string | null }> {
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).maybeSingle();
  if (error) return { profile: null, error: error.message };
  return { profile: data, error: null };
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
