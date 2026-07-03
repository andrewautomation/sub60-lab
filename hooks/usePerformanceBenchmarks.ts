"use client";

import { useEffect, useState } from "react";
import { fetchProfile } from "@/services/profile.service";
import { fetchPerformanceProfile, upsertPerformanceProfile } from "@/services/performanceProfile.service";
import { PerformanceProfile } from "@/types/performanceProfile";

/** Loads the signed-in athlete's self-reported benchmark profile — same
 * shape as hooks/useTestTypes.ts: load on mount, save() persists and
 * refreshes local state. Kept separate from useProfileSettings.ts so that
 * hook stays focused on the `profiles` table only. */
export function usePerformanceBenchmarks() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { profile, error: profileError } = await fetchProfile();
      if (!active) return;

      if (profileError || !profile) {
        setError(profileError);
        setLoading(false);
        return;
      }

      setProfileId(profile.id);
      const data = await fetchPerformanceProfile(profile.id);
      if (!active) return;

      setBenchmarks(data);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function save(patch: Partial<Record<string, number | null>>): Promise<{ error: string | null }> {
    if (!profileId) return { error: "No athlete profile loaded." };

    const { error } = await upsertPerformanceProfile({ profile_id: profileId, ...patch });
    if (!error) setBenchmarks(await fetchPerformanceProfile(profileId));
    return { error };
  }

  return { benchmarks, loading, error, save };
}
