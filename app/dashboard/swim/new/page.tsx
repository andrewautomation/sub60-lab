"use client";

import Link from "next/link";
import { useSwimTests } from "@/hooks/useSwimTests";

export default function SwimHistoryPage() {
  const { tests, loading } = useSwimTests();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading swim tests...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-cyan-400">
            ← Dashboard
          </Link>
          <h1 className="text-4xl font-bold mt-4">Swim History</h1>
        </div>

        <Link
          href="/dashboard/swim/new"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
        >
          Add Swim Test
        </Link>
      </div>

      <div className="mt-10 rounded-2xl bg-slate-900 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Test</th>
              <th className="p-4">Distance</th>
              <th className="p-4">Time</th>
              <th className="p-4">Pace</th>
              <th className="p-4">SWOLF</th>
              <th className="p-4">Strokes</th>
              <th className="p-4">Stroke Rate</th>
            </tr>
          </thead>

          <tbody>
            {tests.map((test) => (
              <tr key={test.id} className="border-t border-slate-800">
                <td className="p-4">{test.test_date}</td>
                <td className="p-4">{test.test_type}</td>
                <td className="p-4">{test.distance_m} m</td>
                <td className="p-4">{test.time_seconds}s</td>
                <td className="p-4">{test.pace_per_100m}</td>
                <td className="p-4">{test.swolf}</td>
                <td className="p-4">{test.total_strokes}</td>
                <td className="p-4">{test.stroke_rate} spm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}