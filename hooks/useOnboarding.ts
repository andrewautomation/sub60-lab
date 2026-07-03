"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/auth.service";
import { completeOnboarding } from "@/services/athlete.service";
import { SportKey } from "@/lib/sports/types";
import {
  AthleteBaselines,
  AthleteEquipment,
  AthleteOnboardingInput,
  ExperienceLevel,
  Sex,
} from "@/types/athlete";

export const ONBOARDING_STEPS = [
  "sport",
  "event",
  "profile",
  "equipment",
  "baseline",
  "goal",
  "review",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** Same shape as AthleteOnboardingInput, but sport/event start unset while
 * the wizard is in progress — only the final submit requires them. */
export interface OnboardingFormState {
  primary_sport: SportKey | null;
  primary_event_key: string | null;
  display_name: string;
  date_of_birth: string | null;
  sex: Sex;
  height_cm: number | null;
  weight_kg: number | null;
  experience_level: ExperienceLevel;
  training_days_per_week: number | null;
  equipment: AthleteEquipment;
  baselines: AthleteBaselines;
  goal_target_date: string | null;
  goal_target_time_seconds: number | null;
  goal_motivation: string | null;
}

const INITIAL_STATE: OnboardingFormState = {
  primary_sport: null,
  primary_event_key: null,
  display_name: "",
  date_of_birth: null,
  sex: "unspecified",
  height_cm: null,
  weight_kg: null,
  experience_level: "beginner",
  training_days_per_week: null,
  equipment: {},
  baselines: {},
  goal_target_date: null,
  goal_target_time_seconds: null,
  goal_motivation: null,
};

/**
 * Wizard state machine driving app/onboarding/page.tsx. Steps are a fixed
 * sequence (sport -> event -> ... -> review) rather than separate routes:
 * the form is short-lived, in-memory state, so there's no need for
 * per-step URLs or server round-trips until the final submit.
 */
export function useOnboarding() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingFormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    if (!data.primary_sport || !data.primary_event_key) return;

    setSubmitting(true);
    setSubmitError(null);

    const { data: sessionData } = await getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      setSubmitting(false);
      router.push("/login");
      return;
    }

    const input: AthleteOnboardingInput = {
      ...data,
      primary_sport: data.primary_sport,
      primary_event_key: data.primary_event_key,
    };

    const { error } = await completeOnboarding(userId, input);
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    router.push("/dashboard");
  }

  return {
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
  };
}
