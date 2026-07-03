"use client";

import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";
import KpiCard from "@/components/KpiCard";
import { useDashboard } from "@/hooks/useDashboard";
import { formatTime } from "@/lib/format/time";
import { daysUntilGoal, getPrimaryEventLabel } from "@/lib/athlete/domain";

const TREND_LABEL = {
  improving: "▲ Improving",
  stable: "▬ Stable",
  declining: "▼ Declining",
};

export default function Dashboard() {
  const { loading, athlete, lastSwimTest, swimPersonalBest, swimTrend, logout } =
    useDashboard();

  if (loading || !athlete) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  const daysToGoal = daysUntilGoal(athlete);

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">
            SUB-60 PERFORMANCE LAB
          </p>
          <h1 className="text-4xl font-bold mt-2">
            {athlete.display_name ? `${athlete.display_name}'s Dashboard` : "Dashboard"}
          </h1>
          <p className="mt-2 text-slate-400">
            {getPrimaryEventLabel(athlete)}
            {athlete.goal_target_time_seconds && (
              <> · Goal {formatTime(athlete.goal_target_time_seconds)}</>
            )}
            {daysToGoal !== null && daysToGoal >= 0 && <> · {daysToGoal} days to go</>}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/import"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
          >
            ⬆ Import Activity
          </Link>

          <button
            onClick={logout}
            className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <KpiCard
          title="Swim PB"
          value={
            swimPersonalBest ? formatTime(swimPersonalBest.time_seconds) : "—"
          }
          subtitle={
            swimTrend ? TREND_LABEL[swimTrend.trend] : "400 m TT"
          }
        />

        <KpiCard
          title="Bike PB"
          value="—"
          subtitle="10 km TT"
        />

        <KpiCard
          title="Run PB"
          value="—"
          subtitle="5 km TT"
        />

        <KpiCard
          title="Sprint Prediction"
          value="—"
          subtitle="Waiting for bike/run data"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <DashboardCard
          title="Swim"
          emoji="🏊"
          newHref="/dashboard/swim/new"
          historyHref="/dashboard/swim"
        >
          {lastSwimTest ? (
            <div className="space-y-2">
              <p>Last test: {lastSwimTest.distance_m} m</p>
              <p className="text-3xl font-bold text-white">
                {formatTime(lastSwimTest.time_seconds)}
              </p>
              <p>Pace: {lastSwimTest.pace_per_100m}</p>
              <p>SWOLF: {lastSwimTest.swolf}</p>
              <p>Date: {lastSwimTest.test_date}</p>
            </div>
          ) : (
            <p className="text-slate-400">No swim tests yet.</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Bike"
          emoji="🚴"
          newHref="/dashboard/bike/new"
          historyHref="/dashboard/bike"
        >
          <p className="text-slate-400">No bike tests yet.</p>
        </DashboardCard>

        <DashboardCard
          title="Run"
          emoji="🏃"
          newHref="/dashboard/run/new"
          historyHref="/dashboard/run"
        >
          <p className="text-slate-400">No run tests yet.</p>
        </DashboardCard>
      </div>
    </>
  );
}