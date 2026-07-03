"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/auth.service";
import { fetchProfile, upsertProfile, markOnboardingComplete } from "@/services/profile.service";
import { createGoal } from "@/services/goal.service";
import { eventId } from "@/lib/sports/registry";
import { hasCompletedOnboarding } from "@/lib/athlete/domain";
import { SportKey } from "@/lib/sports/types";
import { Sex } from "@/types/athlete";

export const ONBOARDING_STEPS = ["sport", "event", "profile", "goal", "review"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingFormState {
  primary_sport: SportKey | null;
  primary_event_key: string | null;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  sex: Sex;
  height_cm: number | null;
  weight_kg: number | null;
  country: string | null;
  /** Set only when the chosen event has a curated goal ladder — see
   * lib/goals/registry.ts hasGoalLadder(). */
  goal_level_key: string | null;
}

const INITIAL_STATE: OnboardingFormState = {
  primary_sport: null,
  primary_event_key: null,
  first_name: "",
  last_name: "",
  birth_date: null,
  sex: "unspecified",
  height_cm: null,
  weight_kg: null,
  country: null,
  goal_level_key: null,
};

const DRAFT_KEY_PREFIX = "sub60_onboarding_draft:";

function loadDraft(userId: string): { stepIndex: number; data: OnboardingFormState } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY_PREFIX + userId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(userId: string, stepIndex: number, data: OnboardingFormState) {
  try {
    window.localStorage.setItem(DRAFT_KEY_PREFIX + userId, JSON.stringify({ stepIndex, data }));
  } catch {
    // Best-effort only — a lost draft just means starting the wizard over.
  }
}

function clearDraft(userId: string) {
  try {
    window.localStorage.removeItem(DRAFT_KEY_PREFIX + userId);
  } catch {
    // Ignore — nothing to clean up if storage isn't available.
  }
}

/**
 * Wizard state machine driving app/onboarding/page.tsx. On mount it
 * resolves auth (redirecting to /login if signed out) and any existing
 * profile (redirecting to /dashboard if onboarding is already complete),
 * then resumes an in-progress draft from localStorage if one exists for
 * this user — so closing the tab mid-wizard doesn't lose progress. The
 * draft is cleared only once the profile/goal are actually persisted.
 */
export function useOnboarding() {
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingFormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const { data: sessionData } = await getSession();
      const uid = sessionData.session?.user.id ?? null;

      if (!uid) {
        router.push("/login");
        return;
      }

      const profile = await fetchProfile();
      if (!active) return;

      if (profile && hasCompletedOnboarding(profile)) {
        router.push("/dashboard");
        return;
      }

      const draft = loadDraft(uid);
      if (draft) {
        setStepIndex(draft.stepIndex);
        setData(draft.data);
      }

      setUserId(uid);
      setInitializing(false);
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!userId || initializing) return;
    saveDraft(userId, stepIndex, data);
  }, [userId, initializing, stepIndex, data]);

  const step = ONBOARDING_STEPS[stepIndex];

  function updateData(patch: Partial<OnboardingFormState>) {
    setData((current) => ({ ...current, ...patch }));
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    if (!userId || !data.primary_sport || !data.primary_event_key) return;

    setSubmitting(true);
    setSubmitError(null);

    const composedEventId = eventId(data.primary_sport, data.primary_event_key);

    const { profile, error: profileError } = await upsertProfile({
      user_id: userId,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      birth_date: data.birth_date,
      sex: data.sex,
      height_cm: data.height_cm,
      weight_kg: data.weight_kg,
      country: data.country?.trim() || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      primary_sport_id: data.primary_sport,
      primary_event_id: composedEventId,
      primary_event_custom_legs: null,
      onboarding_completed_at: null,
    });

    if (profileError || !profile) {
      setSubmitting(false);
      setSubmitError(profileError ?? "Could not save your profile. Please try again.");
      return;
    }

    if (data.goal_level_key) {
      const { error: goalError } = await createGoal({
        profile_id: profile.id,
        event_id: composedEventId,
        level_key: data.goal_level_key,
        custom_target_value: null,
        target_date: null,
      });

      if (goalError) {
        setSubmitting(false);
        setSubmitError(goalError);
        return;
      }
    }

    const { error: completeError } = await markOnboardingComplete(profile.id);
    if (completeError) {
      setSubmitting(false);
      setSubmitError(completeError);
      return;
    }

    clearDraft(userId);
    setSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => router.push("/dashboard"), 900);
  }

  return {
    initializing,
    step,
    stepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    data,
    updateData,
    goNext,
    goBack,
    submit,
    submitting,
    submitError,
    submitSuccess,
  };
}
