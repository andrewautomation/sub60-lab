"use client";

import { useEffect, useState } from "react";
import { fetchProfile, upsertProfile } from "@/services/profile.service";
import { updatePassword } from "@/services/auth.service";
import { Athlete } from "@/types/athlete";

export type ProfileEditableFields = Pick<
  Athlete,
  "first_name" | "last_name" | "birth_date" | "sex" | "height_cm" | "weight_kg" | "country"
>;

/** Loads the signed-in athlete's profile and exposes saveProfile (patches
 * the editable identity fields only — sport/event/goal/onboarding status
 * are untouched) and changePassword (Supabase allows this for an
 * authenticated session with no old-password check, same call
 * /reset-password already uses). */
export function useProfileSettings() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const profile = await fetchProfile();
      if (!active) return;
      setAthlete(profile);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(patch: ProfileEditableFields): Promise<{ error: string | null }> {
    if (!athlete) return { error: "No profile loaded." };

    const { profile, error } = await upsertProfile({
      user_id: athlete.user_id,
      ...patch,
      timezone: athlete.timezone,
      primary_sport_id: athlete.primary_sport_id,
      primary_event_id: athlete.primary_event_id,
      primary_event_custom_legs: athlete.primary_event_custom_legs,
      onboarding_completed_at: athlete.onboarding_completed_at,
    });

    if (error || !profile) return { error: error ?? "Could not save your profile." };

    setAthlete(profile);
    return { error: null };
  }

  async function changePassword(password: string): Promise<{ error: string | null }> {
    const { error } = await updatePassword(password);
    return { error: error?.message ?? null };
  }

  return { athlete, loading, saveProfile, changePassword };
}
