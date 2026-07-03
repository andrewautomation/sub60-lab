"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TestHistoryTable, { TestColumnConfig } from "@/components/tests/TestHistoryTable";
import TestProgressChart from "@/components/tests/TestProgressChart";
import TestTypeFilter, { ALL_TEST_TYPES, UNSORTED_TEST_TYPE } from "@/components/tests/TestTypeFilter";
import ErrorState from "@/components/ErrorState";
import { useBikeTests } from "@/hooks/useBikeTests";
import { useTestTypes } from "@/hooks/useTestTypes";
import { useGoals } from "@/hooks/useGoals";
import { getAverageSpeed, getBestSpeed, getGapToTargetSpeed } from "@/lib/analytics/bike.analytics";
import { getLatestTest, sortByDateAscending } from "@/lib/analytics/shared";
import { BIKE_TEST_COLUMNS } from "@/lib/tests/bikeFields";
import { formatTime } from "@/lib/format/time";
import { resolveEngineTargets } from "@/lib/performance-engine/targets";
import { computeTestGoalProximity, proximityColorClass } from "@/lib/performance-engine/testGoalProximity";
import { BikeTest } from "@/types/bike";

export default function BikePage() {
  const router = useRouter();
  const { tests: allTests, loading, error, refresh, removeTest } = useBikeTests();
  const { testTypes, remove: removeTestType } = useTestTypes("bike");
  const { athlete, goal, loading: goalsLoading } = useGoals();
  const [selectedType, setSelectedType] = useState<string>(ALL_TEST_TYPES);

  if (loading || goalsLoading) {
    return <p className="text-slate-400">Loading bike data...</p>;
  }

  if (error) {
    return <ErrorState message={`Couldn't load your bike data: ${error}`} onRetry={refresh} />;
  }

  async function handleDeleteTestType(id: string) {
    const result = await removeTestType(id);
    if (!result.error) await refresh();
    return result;
  }

  const tests =
    selectedType === ALL_TEST_TYPES
      ? allTests
      : selectedType === UNSORTED_TEST_TYPE
        ? allTests.filter((t) => !t.test_type_id)
        : allTests.filter((t) => t.test_type_id === selectedType);

  const pb = getBestSpeed(tests);
  const average = getAverageSpeed(tests);
  const latest = getLatestTest(tests);
  const gap = getGapToTargetSpeed(tests);

  const bikeTarget = athlete && goal ? resolveEngineTargets(athlete, goal).bike : null;
  const columns: TestColumnConfig<BikeTest>[] =
    goal && bikeTarget
      ? [
          ...BIKE_TEST_COLUMNS,
          {
            key: "goal_proximity",
            label: "Goal %",
            render: (t: BikeTest) => {
              if (t.avg_speed_kmh === null) return "—";
              const score = computeTestGoalProximity(
                t.avg_speed_kmh,
                bikeTarget.avg_speed_kmh,
                "higherIsBetter",
                t.test_date,
                goal.target_date
              );
              return <span className={proximityColorClass(score)}>{score}%</span>;
            },
          },
        ]
      : BIKE_TEST_COLUMNS;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">BIKE MODULE</p>
          <h1 className="text-4xl font-bold mt-2">🚴 Bike</h1>
        </div>

        <div className="sm:text-right">
          <Link href="/dashboard/bike/new" className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
            + New Bike Test
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            Prefer bulk import?{" "}
            <Link href="/dashboard/import" className="text-cyan-400">
              Import from Garmin →
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <TestTypeFilter testTypes={testTypes} selected={selectedType} onSelect={setSelectedType} onDelete={handleDeleteTestType} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Personal Best</p>
          <p className="mt-2 text-3xl font-bold">
            {pb?.avg_speed_kmh !== null && pb?.avg_speed_kmh !== undefined ? `${pb.avg_speed_kmh} km/h` : "—"}
          </p>
          <p className="text-sm text-slate-500">{pb ? `${pb.distance_km} km · ${formatTime(pb.time_seconds)}` : "No tests yet"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Average Speed</p>
          <p className="mt-2 text-3xl font-bold">{average !== null ? `${average.toFixed(1)} km/h` : "—"}</p>
          <p className="text-sm text-slate-500">Across {tests.length} test{tests.length === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Latest Result</p>
          <p className="mt-2 text-3xl font-bold">{latest ? formatTime(latest.time_seconds) : "—"}</p>
          <p className="text-sm text-slate-500">{latest ? latest.test_date : "No tests yet"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Gap to Goal</p>
          <p className="mt-2 text-3xl font-bold">
            {gap !== null ? `${gap > 0 ? "+" : ""}${gap.toFixed(1)} km/h` : "—"}
          </p>
          <p className="text-sm text-slate-500">10 km target</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Test History</h2>
        <TestHistoryTable
          columns={columns}
          rows={tests}
          onEdit={(id) => router.push(`/dashboard/bike/${id}/edit`)}
          onDelete={removeTest}
          emptyMessage="No bike tests yet — log one manually or import from Garmin."
        />
      </div>

      {tests.length > 0 && (
        <div className="mt-10">
          <TestProgressChart
            title="Bike Progress"
            data={sortByDateAscending(tests)}
            xKey="test_date"
            yKey="avg_speed_kmh"
            yLabel="Avg Speed"
            yFormatter={(value) => `${value} km/h`}
          />
        </div>
      )}
    </div>
  );
}
