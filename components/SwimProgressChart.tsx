"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { SwimTest } from "@/types/swim";

export default function SwimProgressChart({
  data,
}: {
  data: Pick<SwimTest, "test_date" | "time_seconds">[];
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <h2 className="text-2xl font-bold mb-6">
        400 m Progress
      </h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#23324f" />

            <XAxis dataKey="test_date" />

            <YAxis
              reversed
              domain={["dataMin - 5", "dataMax + 5"]}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="time_seconds"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
