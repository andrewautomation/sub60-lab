export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remaining}`;
}

/** Whole-second duration formatter for goal targets, which can span
 * minutes (a swim split) or hours (a full-iron finish) — unlike
 * formatTime, which always assumes sub-minute decimal precision. Hours
 * are only shown when non-zero, matching the "H:MM:SS" style already used
 * for goal ladder descriptions in lib/goals/catalog.ts. */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}
