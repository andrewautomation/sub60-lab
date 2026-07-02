import { ActivityKind, ParsedActivity } from "@/types/import";

export function getActivityLabel(kind: ActivityKind): string {
  switch (kind) {
    case "swim":
      return "POOL SWIM";
    case "bike":
      return "CYCLING";
    case "run":
      return "RUNNING";
  }
}

export interface ActivityMetric {
  label: string;
  value: string;
}

export function getActivityMetrics(activity: ParsedActivity): ActivityMetric[] {
  const metrics: ActivityMetric[] = [];

  if (activity.kind === "swim") {
    if (activity.pace_per_100m) {
      metrics.push({ label: "Pace / 100m", value: activity.pace_per_100m });
    }
    if (activity.swolf !== null) {
      metrics.push({ label: "SWOLF", value: String(activity.swolf) });
    }
    if (activity.total_strokes !== null) {
      metrics.push({
        label: "Total Strokes",
        value: String(activity.total_strokes),
      });
    }
    if (activity.stroke_rate !== null) {
      metrics.push({
        label: "Stroke Rate",
        value: `${activity.stroke_rate} spm`,
      });
    }
    if (activity.pool_length_m !== null) {
      metrics.push({
        label: "Pool Length",
        value: `${activity.pool_length_m} m`,
      });
    }
  }

  if (activity.kind === "bike") {
    if (activity.avg_power !== null) {
      metrics.push({ label: "Avg Power", value: `${activity.avg_power} W` });
    }
    if (activity.normalized_power !== null) {
      metrics.push({
        label: "Normalized Power",
        value: `${activity.normalized_power} W`,
      });
    }
    if (activity.cadence !== null) {
      metrics.push({ label: "Cadence", value: `${activity.cadence} rpm` });
    }
    if (activity.avg_speed_kmh !== null) {
      metrics.push({
        label: "Avg Speed",
        value: `${activity.avg_speed_kmh.toFixed(1)} km/h`,
      });
    }
  }

  if (activity.kind === "run") {
    if (activity.pace_per_km) {
      metrics.push({ label: "Pace / km", value: activity.pace_per_km });
    }
    if (activity.cadence !== null) {
      metrics.push({ label: "Cadence", value: `${activity.cadence} spm` });
    }
  }

  if (activity.avg_hr !== null) {
    metrics.push({ label: "Avg HR", value: `${activity.avg_hr} bpm` });
  }
  if (activity.max_hr !== null) {
    metrics.push({ label: "Max HR", value: `${activity.max_hr} bpm` });
  }

  return metrics;
}
