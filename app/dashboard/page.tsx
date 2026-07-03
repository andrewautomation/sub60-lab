"use client";

import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";
import KpiCard from "@/components/KpiCard";
import PerformanceEngineSection from "@/components/PerformanceEngineSection";
import ErrorState from "@/components/ErrorState";
import { useDashboard } from "@/hooks/useDashboard";
import { formatTime } from "@/lib/format/time";
import { getPrimaryEventLabel } from "@/lib/athlete/domain";

export default function Dashboard() {
  const { loading, error, retry, athlete, swim, bike, run, performanceEngine, logout } = useDashboard();

  if (loading) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <ErrorState message={`Couldn't load your dashboard: ${error}`} onRetry={retry} />;
  }

  if (!athlete) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  const fullName = `${athlete.first_name} ${athlete.last_name}`.trim();
  const runPaceSecondsPerKm = run.personalBest ? run.personalBest.time_seconds / run.personalBest.distance_km : null;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">
            SUB-60 PERFORMANCE LAB
          </p>
          <h1 className="text-4xl font-bold mt-2">
            {fullName ? `${fullName}'s Dashboard` : "Dashboard"}
          </h1>
          <p className="mt-2 text-slate-400">{getPrimaryEventLabel(athlete)}</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        <KpiCard
          title="Swim PB"
          value={swim.personalBest ? formatTime(swim.personalBest.time_seconds) : "—"}
          subtitle={swim.personalBest ? `${swim.personalBest.distance_m} m` : "No tests yet"}
        />

        <KpiCard
          title="Bike PB"
          value={bike.personalBest?.avg_speed_kmh != null ? `${bike.personalBest.avg_speed_kmh} km/h` : "—"}
          subtitle={bike.personalBest ? `${bike.personalBest.distance_km} km` : "No tests yet"}
        />

        <KpiCard
          title="Run PB"
          value={runPaceSecondsPerKm !== null ? `${formatTime(runPaceSecondsPerKm)}/km` : "—"}
          subtitle={run.personalBest ? `${run.personalBest.distance_km} km` : "No tests yet"}
        />

        <KpiCard
          title="Race Prediction"
          value={
            performanceEngine?.racePrediction.totalSeconds !== undefined
              ? formatTime(performanceEngine.racePrediction.totalSeconds)
              : "—"
          }
          subtitle={
            performanceEngine?.racePrediction.totalSeconds !== undefined
              ? "Projected finish time"
              : "Not enough data yet"
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <DashboardCard
          title="Swim"
          emoji="🏊"
          newHref="/dashboard/swim/new"
          historyHref="/dashboard/swim"
        >
          {swim.latest ? (
            <div className="space-y-2">
              <p>Last test: {swim.latest.distance_m} m</p>
              <p className="text-3xl font-bold text-white">{formatTime(swim.latest.time_seconds)}</p>
              <p>Pace: {swim.latest.pace_per_100m ?? "—"}</p>
              <p>SWOLF: {swim.latest.swolf ?? "—"}</p>
              <p>Date: {swim.latest.test_date}</p>
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
          {bike.latest ? (
            <div className="space-y-2">
              <p>Last test: {bike.latest.distance_km} km</p>
              <p className="text-3xl font-bold text-white">{formatTime(bike.latest.time_seconds)}</p>
              <p>Avg speed: {bike.latest.avg_speed_kmh != null ? `${bike.latest.avg_speed_kmh} km/h` : "—"}</p>
              <p>Avg power: {bike.latest.avg_power != null ? `${bike.latest.avg_power} W` : "—"}</p>
              <p>Date: {bike.latest.test_date}</p>
            </div>
          ) : (
            <p className="text-slate-400">No bike tests yet.</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Run"
          emoji="🏃"
          newHref="/dashboard/run/new"
          historyHref="/dashboard/run"
        >
          {run.latest ? (
            <div className="space-y-2">
              <p>Last test: {run.latest.distance_km} km</p>
              <p className="text-3xl font-bold text-white">{formatTime(run.latest.time_seconds)}</p>
              <p>Pace: {run.latest.pace_per_km ?? "—"}</p>
              <p>Avg HR: {run.latest.avg_hr != null ? `${run.latest.avg_hr} bpm` : "—"}</p>
              <p>Date: {run.latest.test_date}</p>
            </div>
          ) : (
            <p className="text-slate-400">No run tests yet.</p>
          )}
        </DashboardCard>
      </div>

      {performanceEngine && <PerformanceEngineSection result={performanceEngine} />}
    </>
  );
}
