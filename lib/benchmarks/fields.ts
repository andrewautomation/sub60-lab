import { SportKey } from "@/lib/sports/types";
import { Discipline } from "@/lib/race/models";
import { getDisciplinesForSport } from "@/lib/sports/registry";
import { PerformanceProfile } from "@/types/performanceProfile";

export interface BenchmarkFieldConfig {
  key: keyof PerformanceProfile;
  label: string;
  type: "duration" | "watts";
  discipline: Discipline;
}

/**
 * Single source of truth for "which standard-distance benchmarks apply to
 * which discipline" — driven by both the onboarding Benchmarks step and
 * the Settings page, so the two can't quietly drift apart.
 *
 * Keyed by Discipline rather than SportKey: a multi-sport athlete
 * (Triathlon/Duathlon/Aquathlon) is asked the *same* single-discipline
 * questions as everyone else — their best 10K run time, their 400m swim
 * time, their 20-min power — one labeled group per discipline they
 * actually train, not a separate combined-race-time field. This mirrors
 * getPrimaryDisciplines()'s existing "don't ask about what you don't do"
 * convention and keeps one reference standard per discipline (lib/ranking)
 * instead of a parallel set for every multi-sport format.
 */
const FIELDS_BY_DISCIPLINE: Record<Discipline, BenchmarkFieldConfig[]> = {
  run: [
    { key: "run_5k_seconds", label: "5K", type: "duration", discipline: "run" },
    { key: "run_10k_seconds", label: "10K", type: "duration", discipline: "run" },
    { key: "run_half_marathon_seconds", label: "Half Marathon", type: "duration", discipline: "run" },
    { key: "run_marathon_seconds", label: "Marathon", type: "duration", discipline: "run" },
  ],
  swim: [
    { key: "swim_50m_seconds", label: "50m", type: "duration", discipline: "swim" },
    { key: "swim_100m_seconds", label: "100m", type: "duration", discipline: "swim" },
    { key: "swim_400m_seconds", label: "400m", type: "duration", discipline: "swim" },
    { key: "swim_1500m_seconds", label: "1500m", type: "duration", discipline: "swim" },
  ],
  bike: [{ key: "ftp_watts", label: "20-min power (watts)", type: "watts", discipline: "bike" }],
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  swim: "🏊 Swim",
  bike: "🚴 Bike",
  run: "🏃 Run",
};

export function getBenchmarkFields(sportKey: SportKey): BenchmarkFieldConfig[] {
  return getDisciplinesForSport(sportKey).flatMap((discipline) => FIELDS_BY_DISCIPLINE[discipline]);
}

export function getFieldsForDiscipline(discipline: Discipline): BenchmarkFieldConfig[] {
  return FIELDS_BY_DISCIPLINE[discipline];
}
