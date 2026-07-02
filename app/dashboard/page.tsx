"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/DashboardCard";
import KpiCard from "@/components/KpiCard";

type SwimTest = {
  test_date: string;
  distance_m: number;
  time_seconds: number;
  pace_per_100m: string | null;
  swolf: number | null;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remaining}`;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lastSwimTest, setLastSwimTest] = useState<SwimTest | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("swim_tests")
        .select("test_date, distance_m, time_seconds, pace_per_100m, swolf")
        .order("test_date", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLastSwimTest(data);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">
            SUB-60 PERFORMANCE LAB
          </p>
          <h1 className="text-4xl font-bold mt-2">Dashboard</h1>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <KpiCard
          title="Swim PB"
          value={lastSwimTest ? formatTime(lastSwimTest.time_seconds) : "—"}
          subtitle="400 m TT"
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