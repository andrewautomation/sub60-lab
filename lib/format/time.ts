export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remaining}`;
}
