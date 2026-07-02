"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewSwimTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [testDate, setTestDate] = useState("2026-07-02");
  const [distance, setDistance] = useState("400");
  const [timeSeconds, setTimeSeconds] = useState("387.6");
  const [pace, setPace] = useState("1:37 /100m");
  const [swolf, setSwolf] = useState("35");
  const [strokes, setStrokes] = useState("171");
  const [strokeRate, setStrokeRate] = useState("26");
  const [poolLength, setPoolLength] = useState("25");
  const [avgHr, setAvgHr] = useState("111");
  const [maxHr, setMaxHr] = useState("120");

  async function saveTest() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("swim_tests").insert({
      user_id: userData.user.id,
      test_date: testDate,
      test_type: "400m TT",
      pool_length_m: Number(poolLength),
      distance_m: Number(distance),
      time_seconds: Number(timeSeconds),
      pace_per_100m: pace,
      swolf: Number(swolf),
      total_strokes: Number(strokes),
      stroke_rate: Number(strokeRate),
      avg_hr: Number(avgHr),
      max_hr: Number(maxHr),
      notes: "Baseline 400m pool swim test",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-xl rounded-2xl bg-slate-900 p-8">
        <h1 className="text-3xl font-bold mb-6">Add Swim Test</h1>

        <input className="input" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        <input className="input" value={distance} onChange={(e) => setDistance(e.target.value)} />
        <input className="input" value={timeSeconds} onChange={(e) => setTimeSeconds(e.target.value)} />
        <input className="input" value={pace} onChange={(e) => setPace(e.target.value)} />
        <input className="input" value={swolf} onChange={(e) => setSwolf(e.target.value)} />
        <input className="input" value={strokes} onChange={(e) => setStrokes(e.target.value)} />
        <input className="input" value={strokeRate} onChange={(e) => setStrokeRate(e.target.value)} />
        <input className="input" value={poolLength} onChange={(e) => setPoolLength(e.target.value)} />
        <input className="input" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
        <input className="input" value={maxHr} onChange={(e) => setMaxHr(e.target.value)} />

        <button
          onClick={saveTest}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black"
        >
          {loading ? "Saving..." : "Save Swim Test"}
        </button>
      </div>
    </main>
  );
}