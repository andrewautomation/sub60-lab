/**
 * Header/value normalization shared by every activity normalizer.
 * Garmin CSV headers vary by locale and export version (e.g. trademark
 * symbols, punctuation), so lookups match on a normalized key rather than
 * an exact string.
 */

export function normalizeHeaderKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[®©™]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findField(
  record: Record<string, string>,
  aliases: string[]
): string | null {
  const normalizedRecord = new Map<string, string>();
  for (const [key, value] of Object.entries(record)) {
    normalizedRecord.set(normalizeHeaderKey(key), value);
  }

  for (const alias of aliases) {
    const value = normalizedRecord.get(normalizeHeaderKey(alias));
    if (value !== undefined && value !== "") return value;
  }

  return null;
}

export function parseNumber(raw: string | null): number | null {
  if (raw === null) return null;

  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function parseInteger(raw: string | null): number | null {
  const value = parseNumber(raw);
  return value === null ? null : Math.round(value);
}

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

export function parseDateToIso(raw: string | null): string | null {
  if (raw === null) return null;

  const trimmed = raw.trim();
  if (trimmed === "") return null;

  // Garmin's default export format is "YYYY-MM-DD HH:mm:ss" — matching the
  // date portion directly avoids a Date() round-trip shifting it across
  // a timezone boundary.
  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}
