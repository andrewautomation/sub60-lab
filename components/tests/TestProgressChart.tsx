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
  /** Display name for the tooltip, in place of the raw yKey (e.g. "Pace"
   * instead of "pace_seconds_per_km"). Defaults to the chart title. */
  yLabel?: string;
  /** Renders the raw yKey value (e.g. seconds) as the reader expects to
   * see it in the tooltip (e.g. "4:24 /km"). Defaults to the raw number. */
  yFormatter?: (value: number) => string;
  /** Compact axis-tick rendering — short enough not to wrap or collide
   * with the x-axis below it. Defaults to yFormatter, but a chart whose
   * tooltip format is verbose (units, decimals) should override this
   * with a shorter one (e.g. "4:24" instead of "4:24 /km"). */
  axisFormatter?: (value: number) => string;
}

interface ChartTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
  yLabel: string;
  yFormatter: (value: number) => string;
}

function ChartTooltip({ active, payload, label, yLabel, yFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-cyan-400">
        {yLabel}: {yFormatter(payload[0].value)}
      </p>
    </div>
  );
}

export default function TestProgressChart<T>({
  title,
  data,
  xKey,
  yKey,
  reversed = false,
  yLabel = title,
  yFormatter = (value) => String(value),
  axisFormatter = yFormatter,
}: Props<T>) {
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
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#23324f" />
            <XAxis dataKey={xDataKey} tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis
              reversed={reversed}
              domain={["dataMin - 5", "dataMax + 5"]}
              tickFormatter={axisFormatter}
              tick={{ fontSize: 12 }}
              width={56}
            />
            <Tooltip content={<ChartTooltip yLabel={yLabel} yFormatter={yFormatter} />} />
            <Line type="monotone" dataKey={yDataKey} stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
