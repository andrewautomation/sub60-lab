import { ActivityDetection, ActivityKind } from "@/types/import";
import { findField, parseNumber } from "./fieldUtils";

function matchKindFromText(text: string): ActivityKind | null {
  const signal = text.toLowerCase();

  if (signal.includes("swim")) return "swim";
  if (
    signal.includes("cycl") ||
    signal.includes("bik") ||
    signal.includes("ride")
  ) {
    return "bike";
  }
  if (signal.includes("run")) return "run";

  return null;
}

/**
 * When neither "Activity Type" nor "Title" name the discipline, the presence
 * of discipline-only columns is a far more reliable signal than distance
 * alone (e.g. Garmin only ever populates "Total Strokes" for swims).
 */
function detectByColumnSignature(
  record: Record<string, string>
): { kind: ActivityKind; note: string } | null {
  if (findField(record, ["Total Strokes", "Avg Swolf", "Avg. Swolf", "Pool Length"])) {
    return { kind: "swim", note: "swim-specific columns present (strokes/SWOLF/pool length)" };
  }
  if (findField(record, ["Avg Power", "Avg Bike Cadence"])) {
    return { kind: "bike", note: "bike-specific columns present (power/cadence)" };
  }
  if (findField(record, ["Avg Run Cadence"])) {
    return { kind: "run", note: "run-specific columns present (run cadence)" };
  }
  return null;
}

/**
 * Last resort: guess from distance alone, using this app's own Sprint
 * Triathlon test distances as reference points (swim 400m, run 2.5km,
 * bike 10km — see ARCHITECTURE.md). Inherently unreliable, so callers must
 * treat this tier as unconfirmed and surface it as a warning.
 */
function detectByDistanceRange(
  record: Record<string, string>
): { kind: ActivityKind; note: string } | null {
  const distanceKm = parseNumber(findField(record, ["Distance"]));
  if (distanceKm === null) return null;

  if (distanceKm < 1) {
    return { kind: "swim", note: `distance (${distanceKm} km) is swim-range` };
  }
  if (distanceKm < 5) {
    return { kind: "run", note: `distance (${distanceKm} km) is run-range` };
  }
  return { kind: "bike", note: `distance (${distanceKm} km) is bike-range` };
}

/**
 * Detection priority: 1) Activity Type, 2) Title, 3) distance heuristics.
 * The user is never asked to choose — tier 3 results are marked
 * `confident: false` so the preview screen can flag them for review.
 */
export function detectActivity(
  record: Record<string, string>
): ActivityDetection | null {
  const activityType = findField(record, ["Activity Type"]) ?? "";
  const fromType = matchKindFromText(activityType);
  if (fromType) {
    return {
      kind: fromType,
      source: "activity_type",
      confident: true,
      note: `matched "Activity Type: ${activityType}"`,
    };
  }

  const title = findField(record, ["Title"]) ?? "";
  const fromTitle = matchKindFromText(title);
  if (fromTitle) {
    return {
      kind: fromTitle,
      source: "title",
      confident: true,
      note: `matched "Title: ${title}"`,
    };
  }

  const bySignature = detectByColumnSignature(record);
  if (bySignature) {
    return {
      kind: bySignature.kind,
      source: "distance_heuristic",
      confident: false,
      note: bySignature.note,
    };
  }

  const byDistance = detectByDistanceRange(record);
  if (byDistance) {
    return {
      kind: byDistance.kind,
      source: "distance_heuristic",
      confident: false,
      note: byDistance.note,
    };
  }

  return null;
}
