"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/services/auth.service";
import { fetchProfile } from "@/services/profile.service";
import { fetchSwimTests } from "@/services/swim.service";
import { fetchBikeTests } from "@/services/bike.service";
import { fetchRunTests } from "@/services/run.service";
import { fetchActiveGoalForEvent } from "@/services/goal.service";
import { getGapToTarget as getSwimGap, getPersonalBest as getSwimPb } from "@/lib/analytics/swim.analytics";
import { getBestSpeed as getBikePb, getGapToTargetSpeed as getBikeGap } from "@/lib/analytics/bike.analytics";
import { getBestPace as getRunPb, getGapToTargetPace as getRunGap } from "@/lib/analytics/run.analytics";
import { getLatestTest } from "@/lib/analytics/shared";
import { runPerformanceEngine, PerformanceEngineResult } from "@/lib/performance-engine";
import { DashboardSummary } from "@/types/dashboard";
import { Athlete } from "@/types/athlete";

const EMPTY_SUMMARY: DashboardSummary = {
  swim: { latest: null, personalBest: null, gapToTarget: null },
  bike: { latest: null, personalBest: null, gapToTarget: null },
  run: { latest: null, personalBest: null, gapToTarget: null },
};

/**
 * Loads the signed-in athlete's profile and per-sport summaries. Auth and
 * onboarding-completion gating already happened in
 * app/dashboard/layout.tsx before this ever mounts, so this hook only
 * loads data — it doesn't redirect.
 */
export function useDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [performanceEngine, setPerformanceEngine] = useState<PerformanceEngineResult | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const [profile, swimTests, bikeTests, runTests] = await Promise.all([
        fetchProfile(),
        fetchSwimTests(),
        fetchBikeTests(),
        fetchRunTests(),
      ]);

      if (!active) return;

      setAthlete(profile);
      setSummary({
        swim: {
          latest: getLatestTest(swimTests),
          personalBest: getSwimPb(swimTests),
          gapToTarget: getSwimGap(swimTests),
        },
        bike: {
          latest: getLatestTest(bikeTests),
          personalBest: getBikePb(bikeTests),
          gapToTarget: getBikeGap(bikeTests),
        },
        run: {
          latest: getLatestTest(runTests),
          personalBest: getRunPb(runTests),
          gapToTarget: getRunGap(runTests),
        },
      });

      if (profile) {
        const goal = await fetchActiveGoalForEvent(profile.id, profile.primary_event_id);
        if (!active) return;
        setPerformanceEngine(runPerformanceEngine({ athlete: profile, goal, swimTests, bikeTests, runTests }));
      }

      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await signOut();
    router.push("/login");
  }

  return { loading, athlete, ...summary, performanceEngine, logout };
}
