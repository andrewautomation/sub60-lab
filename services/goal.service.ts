import { supabase } from "@/lib/supabase";
import { Goal, GoalStatus, NewGoal } from "@/types/goal";

const GOAL_COLUMNS = "id, profile_id, event_id, level_key, custom_target_value, target_date, status, created_at, updated_at";

export async function fetchGoalsForProfile(profileId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select(GOAL_COLUMNS)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

/** The athlete's current goal for a given event, if any — the most
 * recently created active one. Events can accumulate goal history (a
 * "Sub-75" goal later replaced by "Sub-60"); this is what dashboards and
 * race prediction should read, not the full list. */
export async function fetchActiveGoalForEvent(profileId: string, eventId: string): Promise<Goal | null> {
  const { data, error } = await supabase
    .from("goals")
    .select(GOAL_COLUMNS)
    .eq("profile_id", profileId)
    .eq("event_id", eventId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function createGoal(input: NewGoal): Promise<{ error: string | null }> {
  const { error } = await supabase.from("goals").insert(input);
  return { error: error?.message ?? null };
}

export async function updateGoalStatus(goalId: string, status: GoalStatus): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("goals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", goalId);

  return { error: error?.message ?? null };
}
