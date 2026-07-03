export function parseDurationToSeconds(raw: string | null): number | null {
  if (raw === null) return null;

  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const parts = trimmed.split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return null;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}
