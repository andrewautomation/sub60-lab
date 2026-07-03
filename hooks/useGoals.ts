"use client";

import { useEffect, useState } from "react";
import { fetchProfile } from "@/services/profile.service";
import { createGoal, fetchActiveGoalForEvent, updateGoalStatus } from "@/services/goal.service";
import { Athlete } from "@/types/athlete";
import { Goal } from "@/types/goal";

export interface ChangeGoalInput {
  level_key: string | null;
  custom_target_value: number | null;
  target_date: string | null;
}

/** Loads the signed-in athlete's profile and their active goal for their
 * primary event, and exposes changeGoal to replace it — abandoning the
 * current goal (if any) and creating a new active one, so goal history is
 * preserved rather than overwritten in place. */
export function useGoals() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const profile = await fetchProfile();
      if (!active) return;

      if (!profile) {
        setLoading(false);
        return;
      }

      const activeGoal = await fetchActiveGoalForEvent(profile.id, profile.primary_event_id);
      if (!active) return;

      setAthlete(profile);
      setGoal(activeGoal);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    const profile = await fetchProfile();
    if (!profile) return;
    const activeGoal = await fetchActiveGoalForEvent(profile.id, profile.primary_event_id);
    setAthlete(profile);
    setGoal(activeGoal);
  }

  async function changeGoal(input: ChangeGoalInput): Promise<{ error: string | null }> {
    if (!athlete) return { error: "No athlete profile loaded." };

    if (goal) {
      const { error } = await updateGoalStatus(goal.id, "abandoned");
      if (error) return { error };
    }

    const { error } = await createGoal({
      profile_id: athlete.id,
      event_id: athlete.primary_event_id,
      level_key: input.level_key,
      custom_target_value: input.custom_target_value,
      target_date: input.target_date,
    });
    if (error) return { error };

    await refresh();
    return { error: null };
  }

  return { athlete, goal, loading, changeGoal };
}
