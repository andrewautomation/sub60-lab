"use client";

import Link from "next/link";
import SwimProgressChart from "@/components/SwimProgressChart";
import { useSwimTests } from "@/hooks/useSwimTests";
import {
  getPersonalBest,
  getAverageSwolf,
  getGapToTarget,
  getLatestTrend,
  getPerformanceScore,
} from "@/lib/analytics/swim.analytics";
import { formatTime } from "@/lib/format/time";

const TREND_LABEL = {
  improving: "▲ Improving",
  stable: "▬ Stable",
  declining: "▼ Declining",
};

export default function SwimPage() {
  const { tests, loading } = useSwimTests();

  if (loading) {
    return <p>Loading swim data...</p>;
  }

  const pb = getPersonalBest(tests);

  const avgSwolf = getAverageSwolf(tests);

  const gap = getGapToTarget(tests);

  const trend = tests.length > 0 ? getLatestTrend(tests) : null;

  const performance = getPerformanceScore(tests);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">
            SWIM MODULE
          </p>
          <h1 className="text-4xl font-bold mt-2">🏊 Swim</h1>
        </div>

        <div className="text-right">
          <Link
            href="/dashboard/swim/new"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
          >
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">400 m PB</p>
          <p className="mt-2 text-3xl font-bold">
            {pb ? formatTime(pb.time_seconds) : "—"}
          </p>
          <p className="text-sm text-slate-500">Best recorded swim test</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Average SWOLF</p>
          <p className="mt-2 text-3xl font-bold">{avgSwolf ?? "—"}</p>
          <p className="text-sm text-slate-500">Efficiency marker</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Tests Logged</p>
          <p className="mt-2 text-3xl font-bold">{tests.length}</p>
          <p className="text-sm text-slate-500">Swim tests in database</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Gap to 6:00</p>
          <p className="mt-2 text-3xl font-bold">
            {gap !== null ? `${gap.toFixed(1)}s` : "—"}
          </p>
          <p className="text-sm text-slate-500">Target 400 m swim</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Trend</p>
          <p className="mt-2 text-3xl font-bold">
            {trend ? TREND_LABEL[trend.trend] : "—"}
          </p>
          <p className="text-sm text-slate-500">Last few tests vs. before</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Performance Score</p>
          <p className="mt-2 text-3xl font-bold">
            {performance ? `${performance.score}/100` : "—"}
          </p>
          <p className="text-sm text-slate-500">Target · trend · consistency</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-slate-900 p-6">
        <h2 className="text-2xl font-bold">Recent Swim Tests</h2>

        <div className="mt-6 space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex justify-between items-center rounded-xl bg-slate-800 p-4"
            >
              <div>
                <p className="font-semibold">
                  {test.test_type} — {test.distance_m} m
                </p>
                <p className="text-sm text-slate-400">{test.test_date}</p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold">
                  {formatTime(test.time_seconds)}
                </p>
                <p className="text-sm text-slate-400">
                  {test.pace_per_100m} · SWOLF {test.swolf}
                </p>
              </div>
            </div>
          ))}

          {tests.length === 0 && (
            <p className="text-slate-400">No swim tests yet.</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <SwimProgressChart data={tests} />
      </div>
    </div>
  );
}
