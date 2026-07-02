import { getActivityLabel, getActivityMetrics } from "@/lib/parser/describeActivity";
import { formatTime } from "@/lib/format/time";
import { ImportRow } from "@/hooks/useGarminImport";

type ActivityPreviewCardProps = {
  row: ImportRow;
  onSave: (id: string) => void;
  onDiscard: (id: string) => void;
};

export default function ActivityPreviewCard({
  row,
  onSave,
  onDiscard,
}: ActivityPreviewCardProps) {
  const { activity } = row;
  const distance =
    activity.kind === "swim"
      ? `${activity.distance_m} m`
      : `${activity.distance_km.toFixed(2)} km`;

  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-cyan-400 text-sm tracking-[0.2em]">
            {getActivityLabel(activity.kind)}
          </p>
          <h3 className="text-xl font-bold mt-1">
            {activity.title ?? "Untitled activity"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">{activity.test_date}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold">
            {formatTime(activity.time_seconds)}
          </p>
          <p className="text-sm text-slate-400">{distance}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {getActivityMetrics(activity).map((metric) => (
          <div key={metric.label} className="rounded-xl bg-slate-800 p-3">
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="text-lg font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      {activity.warnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-xs font-semibold text-amber-400">Warnings</p>
          <ul className="mt-1 space-y-1 text-sm text-amber-200">
            {activity.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => onSave(row.id)}
          disabled={row.status === "saving" || row.status === "saved"}
          className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {row.status === "saving"
            ? "Saving..."
            : row.status === "saved"
            ? "Saved ✓"
            : "Save"}
        </button>

        <button
          onClick={() => onDiscard(row.id)}
          disabled={row.status === "saving"}
          className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-50"
        >
          Discard
        </button>

        {row.status === "error" && (
          <p className="text-sm text-red-400">{row.error}</p>
        )}
      </div>
    </div>
  );
}
