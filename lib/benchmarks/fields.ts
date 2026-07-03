import { SportKey } from "@/lib/sports/types";
import { PerformanceProfile } from "@/types/performanceProfile";

export interface BenchmarkFieldConfig {
  key: keyof PerformanceProfile;
  label: string;
  type: "duration" | "watts";
}

/**
 * Single source of truth for "which standard-distance/format benchmarks
 * apply to which sport" — driven by both the onboarding Benchmarks step
 * and the Settings page, so the two can't quietly drift apart. A runner
 * only ever sees the 4 run fields, a triathlete only the 5 triathlon
 * fields, etc. — same "don't ask about sports you don't do" convention as
 * getPrimaryDisciplines elsewhere in this app.
 */
export const BENCHMARK_FIELDS_BY_SPORT: Record<SportKey, BenchmarkFieldConfig[]> = {
  running: [
    { key: "run_5k_seconds", label: "5K", type: "duration" },
    { key: "run_10k_seconds", label: "10K", type: "duration" },
    { key: "run_half_marathon_seconds", label: "Half Marathon", type: "duration" },
    { key: "run_marathon_seconds", label: "Marathon", type: "duration" },
  ],
  swimming: [
    { key: "swim_50m_seconds", label: "50m", type: "duration" },
    { key: "swim_100m_seconds", label: "100m", type: "duration" },
    { key: "swim_400m_seconds", label: "400m", type: "duration" },
    { key: "swim_1500m_seconds", label: "1500m", type: "duration" },
  ],
  cycling: [{ key: "ftp_watts", label: "20-min power (watts)", type: "watts" }],
  triathlon: [
    { key: "triathlon_super_sprint_seconds", label: "Super Sprint", type: "duration" },
    { key: "triathlon_sprint_seconds", label: "Sprint", type: "duration" },
    { key: "triathlon_olympic_seconds", label: "Olympic", type: "duration" },
    { key: "triathlon_half_iron_seconds", label: "70.3 (Half Iron)", type: "duration" },
    { key: "triathlon_full_iron_seconds", label: "140.6 (Full Iron)", type: "duration" },
  ],
  duathlon: [
    { key: "duathlon_sprint_seconds", label: "Sprint", type: "duration" },
    { key: "duathlon_standard_seconds", label: "Standard", type: "duration" },
  ],
  aquathlon: [
    { key: "aquathlon_sprint_seconds", label: "Sprint", type: "duration" },
    { key: "aquathlon_standard_seconds", label: "Standard", type: "duration" },
  ],
};
