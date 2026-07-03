"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TestHistoryTable from "@/components/tests/TestHistoryTable";
import TestProgressChart from "@/components/tests/TestProgressChart";
import TestTypeFilter, { ALL_TEST_TYPES, UNSORTED_TEST_TYPE } from "@/components/tests/TestTypeFilter";
import ErrorState from "@/components/ErrorState";
import { useRunTests } from "@/hooks/useRunTests";
import { useTestTypes } from "@/hooks/useTestTypes";
import { getAveragePace, getBestPace, getGapToTargetPace } from "@/lib/analytics/run.analytics";
import { excludeIntervalTests, getLatestTest, sortByDateAscending } from "@/lib/analytics/shared";
import { RUN_TEST_COLUMNS } from "@/lib/tests/runFields";
import { formatTime, formatDuration } from "@/lib/format/time";
import { RunTest } from "@/types/run";

function paceSecondsPerKm(test: RunTest): number {
  return test.time_seconds / test.distance_km;
}

export default function RunPage() {
  const router = useRouter();
  const { tests: allTests, loading, error, refresh, removeTest } = useRunTests();
  const { testTypes, remove: removeTestType } = useTestTypes("run");
  const [selectedType, setSelectedType] = useState<string>(ALL_TEST_TYPES);

  if (loading) {
    return <p className="text-slate-400">Loading run data...</p>;
  }

  if (error) {
    return <ErrorState message={`Couldn't load your run data: ${error}`} onRetry={refresh} />;
  }

  // Deleting a type sets test_type_id to null server-side (ON DELETE SET
  // NULL) — refresh so the already-fetched tests pick up that change
  // instead of still showing the deleted type's id.
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

  // Interval reps (e.g. 400m repeats) aren't a fair "personal best /
  // continuous effort" input alongside continuous-distance tests — see
  // lib/analytics/shared.ts excludeIntervalTests. That only matters when
  // aggregating across types (the "All Types" view); once the athlete has
  // filtered down to one specific type, every row is already the same
  // shape, interval or not, so there's nothing to exclude.
  // The History table below still shows every row, intervals included.
  const continuousTests = selectedType === ALL_TEST_TYPES ? excludeIntervalTests(tests, testTypes) : tests;

  const pb = getBestPace(continuousTests);
  const averagePace = getAveragePace(continuousTests);
  const latest = getLatestTest(tests);
  const gap = getGapToTargetPace(continuousTests);

  const chartData = sortByDateAscending(continuousTests).map((t) => ({
    test_date: t.test_date,
    pace_seconds_per_km: Math.round(paceSecondsPerKm(t)),
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">RUN MODULE</p>
          <h1 className="text-4xl font-bold mt-2">🏃 Run</h1>
        </div>

        <div className="sm:text-right">
          <Link href="/dashboard/run/new" className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
            + New Run Test
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <TestTypeFilter testTypes={testTypes} selected={selectedType} onSelect={setSelectedType} onDelete={handleDeleteTestType} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Personal Best Pace</p>
          <p className="mt-2 text-3xl font-bold">{pb ? `${formatDuration(paceSecondsPerKm(pb))}/km` : "—"}</p>
          <p className="text-sm text-slate-500">{pb ? `${pb.distance_km} km · ${formatTime(pb.time_seconds)}` : "No tests yet"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Average Pace</p>
          <p className="mt-2 text-3xl font-bold">{averagePace !== null ? `${formatDuration(averagePace)}/km` : "—"}</p>
          <p className="text-sm text-slate-500">Across {continuousTests.length} test{continuousTests.length === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Latest Result</p>
          <p className="mt-2 text-3xl font-bold">{latest ? formatTime(latest.time_seconds) : "—"}</p>
          <p className="text-sm text-slate-500">{latest ? latest.test_date : "No tests yet"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Gap to Goal</p>
          <p className="mt-2 text-3xl font-bold">
            {gap !== null ? `${gap > 0 ? "+" : ""}${gap.toFixed(0)}s/km` : "—"}
          </p>
          <p className="text-sm text-slate-500">2.5 km target</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Test History</h2>
        <TestHistoryTable
          columns={RUN_TEST_COLUMNS}
          rows={tests}
          onEdit={(id) => router.push(`/dashboard/run/${id}/edit`)}
          onDelete={removeTest}
          emptyMessage="No run tests yet — log your first one."
        />
      </div>

      {continuousTests.length > 0 && (
        <div className="mt-10">
          <TestProgressChart
            title="Run Pace Progress"
            data={chartData}
            xKey="test_date"
            yKey="pace_seconds_per_km"
            reversed
            yLabel="Pace"
            yFormatter={(value) => `${formatDuration(value)} /km`}
            axisFormatter={(value) => formatDuration(value)}
          />
        </div>
      )}
    </div>
  );
}
