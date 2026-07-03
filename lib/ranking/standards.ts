import { PerformanceProfile } from "@/types/performanceProfile";

export type BadgeSex = "male" | "female";

/**
 * Hand-picked approximate open-class ("what a strong national/international
 * competitor runs/swims/races") reference times per sex, one per standard
 * distance/format — NOT official world records, and not sourced from a
 * live database (none exists here). These exist purely to give the
 * dashboard identity badge a defensible, published-methodology-flavored
 * anchor, framed everywhere in the UI as an estimate.
 */
export const REFERENCE_SECONDS: Record<string, Record<BadgeSex, number>> = {
  run_5k_seconds: { male: 13 * 60, female: 14 * 60 + 30 },
  run_10k_seconds: { male: 27 * 60, female: 30 * 60 },
  run_half_marathon_seconds: { male: 60 * 60, female: 67 * 60 },
  run_marathon_seconds: { male: 125 * 60, female: 140 * 60 },

  swim_50m_seconds: { male: 21.5, female: 24 },
  swim_100m_seconds: { male: 48, female: 53 },
  swim_400m_seconds: { male: 3 * 60 + 45, female: 4 * 60 + 2 },
  swim_1500m_seconds: { male: 14 * 60 + 35, female: 15 * 60 + 45 },
};

/** Coggan Power Profile-style FTP watts/kg bands, collapsed from its usual
 * finer scale into this app's 5 badge tiers. Published-chart-flavored
 * approximation, not exact reproduction of any single source's numbers. */
export const BIKE_WKG_TIER_FLOORS: Record<BadgeSex, number[]> = {
  // [Silver floor, Gold floor, Platinum floor, World Class floor]
  male: [2.8, 3.5, 4.3, 5.2],
  female: [2.4, 3.0, 3.7, 4.4],
};

/**
 * Flat to ~30, then a gentle linear decline (0.6%/year to 60, 1%/year
 * beyond) — a stated, simple approximation of the general shape published
 * age-grading curves follow, not a fitted or sport-specific model.
 */
export function ageDeclineFactor(age: number): number {
  if (age <= 30) return 1;
  if (age <= 60) return 1 - (age - 30) * 0.006;
  return 1 - 30 * 0.006 - (age - 60) * 0.01;
}

const PERCENTILE_ANCHORS: { gradePercent: number; label: string }[] = [
  { gradePercent: 40, label: "~top 70%" },
  { gradePercent: 50, label: "~top 50%" },
  { gradePercent: 60, label: "~top 30%" },
  { gradePercent: 70, label: "~top 15%" },
  { gradePercent: 80, label: "~top 6%" },
  { gradePercent: 90, label: "~top 2%" },
  { gradePercent: 95, label: "~top 0.5%" },
];

/** Nearest-anchor lookup — a phrasing aid for the badge caption, not a
 * statistical percentile. */
export function percentileLabel(gradePercent: number): string {
  let closest = PERCENTILE_ANCHORS[0];
  for (const anchor of PERCENTILE_ANCHORS) {
    if (gradePercent >= anchor.gradePercent) closest = anchor;
  }
  return closest.label;
}

export interface BadgeTier {
  key: "bronze" | "silver" | "gold" | "platinum" | "world_class";
  emoji: string;
  label: string;
  colorClass: string;
  minGrade: number;
}

export const BADGE_TIERS: BadgeTier[] = [
  { key: "bronze", emoji: "🥉", label: "Bronze", colorClass: "text-amber-600", minGrade: 0 },
  { key: "silver", emoji: "🥈", label: "Silver", colorClass: "text-slate-300", minGrade: 50 },
  { key: "gold", emoji: "🥇", label: "Gold", colorClass: "text-yellow-400", minGrade: 65 },
  { key: "platinum", emoji: "🏆", label: "Platinum", colorClass: "text-cyan-300", minGrade: 80 },
  { key: "world_class", emoji: "💎", label: "World Class", colorClass: "text-fuchsia-400", minGrade: 90 },
];

export function tierForGrade(gradePercent: number): BadgeTier {
  let tier = BADGE_TIERS[0];
  for (const candidate of BADGE_TIERS) {
    if (gradePercent >= candidate.minGrade) tier = candidate;
  }
  return tier;
}

/** Age-graded 0-100+ score for a standard-distance/format field: how the
 * reported time compares to the age-adjusted open-class reference. Values
 * over 100 (faster than the adjusted reference) are left uncapped so the
 * caller can tell a narrow win from a landslide one, but tiers/percentile
 * both treat anything above the top anchor the same way. */
export function scoreBenchmark(fieldKey: string, seconds: number, sex: BadgeSex, age: number): number | null {
  const reference = REFERENCE_SECONDS[fieldKey]?.[sex];
  if (reference === undefined || seconds <= 0) return null;

  const adjustedReference = reference / ageDeclineFactor(age);
  return Math.round((adjustedReference / seconds) * 100);
}

export function scoreBikeWkg(wkg: number, sex: BadgeSex): number {
  const floors = BIKE_WKG_TIER_FLOORS[sex];
  // Map watts/kg onto the same 0-100 grade scale the endurance formula
  // uses, anchored so each tier floor lands roughly on that tier's
  // minGrade threshold above — keeps the two disciplines' badges
  // comparable even though bike isn't distance/time based.
  if (wkg >= floors[3]) return 90 + Math.min(10, (wkg - floors[3]) * 5);
  if (wkg >= floors[2]) return 80 + ((wkg - floors[2]) / (floors[3] - floors[2])) * 10;
  if (wkg >= floors[1]) return 65 + ((wkg - floors[1]) / (floors[2] - floors[1])) * 15;
  if (wkg >= floors[0]) return 50 + ((wkg - floors[0]) / (floors[1] - floors[0])) * 15;
  return Math.max(0, (wkg / floors[0]) * 50);
}

export type BenchmarkFieldKey = keyof PerformanceProfile;
