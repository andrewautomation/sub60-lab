import { PerformanceEngineResult } from "@/lib/performance-engine";
import { formatTime } from "@/lib/format/time";

const DISCIPLINE_EMOJI: Record<string, string> = { swim: "🏊", bike: "🚴", run: "🏃" };
const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  elite: "Elite",
};
const TREND_ARROW: Record<string, string> = { improving: "▲", stable: "▬", declining: "▼" };

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Read-only display for lib/performance-engine's seven outputs. Labeled
 * "Preview" deliberately — this consumes the engine's own explanations
 * for every null/unsupported case rather than inventing UI copy, so if the
 * engine's reasoning changes, this component doesn't drift out of sync
 * with it.
 */
export default function PerformanceEngineSection({ result }: { result: PerformanceEngineResult }) {
  const { currentLevel, goalGap, goalConfidence, racePrediction, bottleneck, roi, trend } = result;

  return (
    <section className="mt-10 rounded-2xl bg-slate-900 p-6">
      <p className="text-cyan-400 tracking-[0.3em] text-xs">PERFORMANCE ENGINE v1 (PREVIEW)</p>
      <h2 className="text-2xl font-bold mt-1">Where you stand</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Current Level</p>
          <p className="mt-2 text-2xl font-bold">{currentLevel.overall ? LEVEL_LABEL[currentLevel.overall] : "—"}</p>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            {currentLevel.disciplines.map((d) => (
              <div key={d.discipline}>
                {DISCIPLINE_EMOJI[d.discipline]} {d.score !== null ? `${d.score}/100` : "no data yet"}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Goal Gap</p>
          <p className="mt-2 text-2xl font-bold">
            {goalGap.gapSeconds !== null
              ? `${goalGap.gapSeconds > 0 ? "+" : "-"}${formatTime(Math.abs(goalGap.gapSeconds))}`
              : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-400">{goalGap.explanation}</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Goal Confidence</p>
          <p className="mt-2 text-2xl font-bold capitalize">
            {goalConfidence ? `${goalConfidence.level} (${goalConfidence.score})` : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {goalConfidence
              ? "Based on gap, momentum, data quality, and time remaining."
              : "Set a goal to see this."}
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Race Prediction</p>
          <p className="mt-2 text-2xl font-bold">
            {racePrediction.totalSeconds !== undefined ? formatTime(racePrediction.totalSeconds) : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {racePrediction.totalSeconds !== undefined
              ? "Projected finish time from your personal bests."
              : racePrediction.unsupportedReason ?? "Not enough test data yet."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Biggest Bottleneck</p>
          <p className="mt-2 text-xl font-bold">
            {bottleneck.discipline ? `${DISCIPLINE_EMOJI[bottleneck.discipline]} ${capitalize(bottleneck.discipline)}` : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-400">{bottleneck.explanation}</p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">ROI by Discipline</p>
          {roi.ranked.length > 0 ? (
            <ol className="mt-2 space-y-1 text-sm">
              {roi.ranked.map((r, i) => (
                <li key={r.discipline}>
                  {i + 1}. {DISCIPLINE_EMOJI[r.discipline]} {capitalize(r.discipline)}
                  {r.potentialGainSeconds > 0 ? ` — ${r.potentialGainSeconds}s` : ""}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-xs text-slate-400">{roi.unsupportedReason ?? "Not enough data yet."}</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">Trend</p>
          <p className="mt-2 text-xl font-bold">
            {TREND_ARROW[trend.overall]} {capitalize(trend.overall)}
          </p>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            {trend.perDiscipline.length > 0 ? (
              trend.perDiscipline.map((d) => (
                <div key={d.discipline}>
                  {DISCIPLINE_EMOJI[d.discipline]} {TREND_ARROW[d.trend.trend]} {capitalize(d.trend.trend)}
                </div>
              ))
            ) : (
              <p>No test data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-500 mb-2">This is a preview — help us improve it. Ask yourself:</p>
        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
          <li>Does your race prediction look realistic?</li>
          <li>Do you agree this is your biggest bottleneck?</li>
          <li>Would this change how you train?</li>
        </ul>
      </div>
    </section>
  );
}
