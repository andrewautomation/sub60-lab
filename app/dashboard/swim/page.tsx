"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import TestHistoryTable from "@/components/tests/TestHistoryTable";
import TestProgressChart from "@/components/tests/TestProgressChart";
import ErrorState from "@/components/ErrorState";
import { useSwimTests } from "@/hooks/useSwimTests";
import {
  getAverageTime,
  getGapToTarget,
  getPersonalBest,
} from "@/lib/analytics/swim.analytics";
import { getLatestTest, sortByDateAscending } from "@/lib/analytics/shared";
import { SWIM_TEST_COLUMNS } from "@/lib/tests/swimFields";
import { formatTime } from "@/lib/format/time";

export default function SwimPage() {
  const router = useRouter();
  const { tests, loading, error, refresh, removeTest } = useSwimTests();

  if (loading) {
    return <p className="text-slate-400">Loading swim data...</p>;
  }

  if (error) {
    return <ErrorState message={`Couldn't load your swim data: ${error}`} onRetry={refresh} />;
  }

  const pb = getPersonalBest(tests);
  const average = getAverageTime(tests);
  const latest = getLatestTest(tests);
  const gap = getGapToTarget(tests);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">SWIM MODULE</p>
          <h1 className="text-4xl font-bold mt-2">🏊 Swim</h1>
        </div>

        <div className="sm:text-right">
          <Link href="/dashboard/swim/new" className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
            + New Swim Test
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            Prefer bulk import?{" "}
            <Link href="/dashboard/import" className="text-cyan-400">
              Import from Garmin →
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Personal Best</p>
          <p className="mt-2 text-3xl font-bold">{pb ? formatTime(pb.time_seconds) : "—"}</p>
          <p className="text-sm text-slate-500">{pb ? `${pb.distance_m} m` : "No tests yet"}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Average Time</p>
          <p className="mt-2 text-3xl font-bold">{average !== null ? formatTime(average) : "—"}</p>
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
            {gap !== null ? `${gap > 0 ? "+" : ""}${gap.toFixed(1)}s` : "—"}
          </p>
          <p className="text-sm text-slate-500">400 m target</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Test History</h2>
        <TestHistoryTable
          columns={SWIM_TEST_COLUMNS}
          rows={tests}
          onEdit={(id) => router.push(`/dashboard/swim/${id}/edit`)}
          onDelete={removeTest}
          emptyMessage="No swim tests yet — log one manually or import from Garmin."
        />
      </div>

      {tests.length > 0 && (
        <div className="mt-10">
          <TestProgressChart
            title="Swim Progress"
            data={sortByDateAscending(tests)}
            xKey="test_date"
            yKey="time_seconds"
            reversed
          />
        </div>
      )}
    </div>
  );
}
