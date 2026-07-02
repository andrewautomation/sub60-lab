"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/services/auth.service";
import { fetchLatestSwimTest, fetchSwimTests } from "@/services/swim.service";
import {
  getGapToTarget,
  getLatestTrend,
  getPersonalBest,
} from "@/lib/analytics/swim.analytics";
import { DashboardSummary } from "@/types/dashboard";

const EMPTY_SUMMARY: DashboardSummary = {
  lastSwimTest: null,
  swimPersonalBest: null,
  swimTrend: null,
  swimGapToTarget: null,
};

export function useDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

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

  return { loading, ...summary, logout };
}
