"use client";

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props<T> {
  title: string;
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  /** True when lower values are better (e.g. time, pace) — flips the axis
   * so an improving trend always reads as an upward line. */
  reversed?: boolean;
}

export default function TestProgressChart<T>({ title, data, xKey, yKey, reversed = false }: Props<T>) {
  // Recharts infers dataKey's allowed type from a resolved data shape, which
  // it can't do for a still-generic T at this component's definition site —
  // xKey/yKey are already constrained to `keyof T` by the Props type above,
  // so this cast is just working around that inference gap, not skipping a
  // real check.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const xDataKey = xKey as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yDataKey = yKey as any;

  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#23324f" />
            <XAxis dataKey={xDataKey} />
            <YAxis reversed={reversed} domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip />
            <Line type="monotone" dataKey={yDataKey} stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
