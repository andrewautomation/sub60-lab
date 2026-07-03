"use client";

import { useEffect, useState } from "react";
import { fetchAthleteProfile } from "@/services/athlete.service";
import { AthleteProfile } from "@/types/athlete";

/**
 * Fetches the current user's athlete profile. Returns `athlete: null`
 * (once loading settles) both when there's no session and when the
 * session's user hasn't completed onboarding yet — callers that need to
 * distinguish those cases, or that need to redirect, should go through
 * useDashboard's onboarding gate rather than duplicating that logic here.
 */
export function useAthlete() {
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchAthleteProfile();
      if (active) {
        setAthlete(data);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return { athlete, loading };
}
