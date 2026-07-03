export type GoalStatus = "active" | "achieved" | "abandoned";

/**
 * DB row for the `goals` table — an athlete's actual selected goal for one
 * event. Always resolves to either a curated GoalLevel (level_key, looked
 * up via lib/goals/registry.ts against that event's ladder) or an explicit
 * custom_target_value — never free text, and never both null (enforced by
 * a DB check constraint). An athlete can hold more than one goal over time
 * per event; `status` distinguishes the current one from history.
 */
export interface Goal {
  id: string;
  profile_id: string;
  /** Composite id from lib/sports/registry.ts eventId(). */
  event_id: string;
  level_key: string | null;
  custom_target_value: number | null;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export type NewGoal = Omit<Goal, "id" | "created_at" | "updated_at" | "status"> & {
  status?: GoalStatus;
};
