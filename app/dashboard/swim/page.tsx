"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type SwimTest = {
  id: string;
  test_date: string;
  test_type: string;
  distance_m: number;
  time_seconds: number;
  pace_per_100m: string | null;
  swolf: number | null;
  total_strokes: number | null;
  stroke_rate: number | null;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remaining}`;
}

export default function SwimPage() {
  const [tests, setTests] = useState<SwimTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      const { data, error } = await supabase
        .from("swim_tests")
        .select(
          "id, test_date, test_type, distance_m, time_seconds, pace_per_100m, swolf, total_strokes, stroke_rate"
        )
        .order("test_date", { ascending: false });

      if (!error && data) setTests(data);
      setLoading(false);
    }

    loadTests();
  }, []);

  if (loading) {
    return <p>Loading swim data...</p>;
  }

  const pb = tests.length
    ? tests.reduce((best, test) =>
        test.time_seconds < best.time_seconds ? test : best
      )
    : null;

  const avgSwolf =
    tests.length > 0
      ? Math.round(
          tests.reduce((sum, t) => sum + (t.swolf ?? 0), 0) / tests.length
        )
      : null;

  const targetSeconds = 360; // 6:00 target
  const gap = pb ? pb.time_seconds - targetSeconds : null;

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-cyan-400 tracking-[0.3em] text-sm">
            SWIM MODULE
          </p>
          <h1 className="text-4xl font-bold mt-2">🏊 Swim</h1>
        </div>

        <Link
          href="/dashboard/swim/new"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
        >
          + New Swim Test
        </Link>
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
    </div>
  );
}
