"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">🏊 Swim</h2>

          {lastSwimTest ? (
            <div className="mt-6 space-y-2 text-slate-300">
              <p>Last test: {lastSwimTest.distance_m} m</p>
              <p className="text-3xl font-bold text-white">
              {formatTime(lastSwimTest.time_seconds)}
              </p>
              <p>Pace: {lastSwimTest.pace_per_100m}</p>
              <p>SWOLF: {lastSwimTest.swolf}</p>
              <p>Date: {lastSwimTest.test_date}</p>
            </div>
          ) : (
            <p className="mt-6 text-slate-400">No swim tests yet.</p>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard/swim/new"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
            >
              Add Test
            </Link>

            <Link
              href="/dashboard/swim"
              className="rounded-lg bg-slate-800 px-4 py-2"
            >
              History
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">🚴 Bike</h2>
          <p className="mt-6 text-slate-400">No bike tests yet.</p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard/bike/new"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
            >
              Add Test
            </Link>

            <Link
              href="/dashboard/bike"
              className="rounded-lg bg-slate-800 px-4 py-2"
            >
              History
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">🏃 Run</h2>
          <p className="mt-6 text-slate-400">No run tests yet.</p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard/run/new"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
            >
              Add Test
            </Link>

            <Link
              href="/dashboard/run"
              className="rounded-lg bg-slate-800 px-4 py-2"
            >
              History
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}