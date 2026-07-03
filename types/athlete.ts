import { EventLeg, SportKey } from "@/lib/sports/types";

export type Sex = "male" | "female" | "unspecified";

/**
 * Domain type `Athlete` maps to the `profiles` DB table (see
 * supabase/migrations) — "profiles" because it's the row Supabase auth
 * links to; "Athlete" because it's the aggregate root every other table
 * (goals, equipment, performance_profiles, and eventually workouts/races)
 * hangs off of via profile_id.
 *
 * `id` is deliberately a separate uuid from `user_id` rather than reusing
 * the auth user id directly, so a single account can eventually own more
 * than one athlete profile — a coach managing athletes, a family account —
 * without a schema change.
 */
export interface Athlete {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  sex: Sex;
  height_cm: number | null;
  weight_kg: number | null;
  country: string | null;
  timezone: string | null;
  primary_sport_id: SportKey;
  /** Composite id from lib/sports/registry.ts eventId() — e.g.
   * "triathlon:sprint". */
  primary_event_id: string;
  /** Only set when primary_event_id resolves to an is_custom event
   * (lib/sports/catalog.ts customEvent()) — the athlete's own legs, since
   * the catalog can't enumerate every possible distance. */
  primary_event_custom_legs: EventLeg[] | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NewAthlete = Omit<Athlete, "id" | "created_at" | "updated_at">;
