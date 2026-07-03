"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/services/auth.service";
import { fetchLatestSwimTest, fetchSwimTests } from "@/services/swim.service";
import { fetchAthleteProfile } from "@/services/athlete.service";
import {
  getGapToTarget,
  getLatestTrend,
  getPersonalBest,
} from "@/lib/analytics/swim.analytics";
import { hasCompletedOnboarding } from "@/lib/athlete/domain";
import { DashboardSummary } from "@/types/dashboard";
import { AthleteProfile } from "@/types/athlete";

const EMPTY_SUMMARY: DashboardSummary = {
  lastSwimTest: null,
  swimPersonalBest: null,
  swimTrend: null,
  swimGapToTarget: null,
};

export function useDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      // The Athlete domain — sport, event, and goal — drives everything
      // else on this page, so it's resolved before anything else. A
      // session with no completed onboarding is sent to set one up.
      const athleteProfile = await fetchAthleteProfile();
      if (!athleteProfile || !hasCompletedOnboarding(athleteProfile)) {
        router.push("/onboarding");
        return;
      }
      setAthlete(athleteProfile);

      // fetchLatestSwimTest gives the raw "last session" record for the
      // Swim module card; fetchSwimTests gives the Analytics Engine the
      // full dataset it needs to compute PB/trend/gap.
      const [lastSwimTest, swimTests] = await Promise.all([
        fetchLatestSwimTest(),
        fetchSwimTests(),
      ]);

      setSummary({
        lastSwimTest,
        swimPersonalBest: getPersonalBest(swimTests),
        swimTrend: swimTests.length > 0 ? getLatestTrend(swimTests) : null,
        swimGapToTarget: getGapToTarget(swimTests),
      });

      setLoading(false);
    }

    load();
  }, [router]);

  async function logout() {
    await signOut();
    router.push("/login");
  }

  return { loading, athlete, ...summary, logout };
}
