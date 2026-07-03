"use client";

import { useState } from "react";
import { eventId } from "@/lib/sports/registry";
import { getGoalLevelsForEvent } from "@/lib/goals/registry";
import { validateGoalStep } from "@/lib/validators/validateOnboarding";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GoalStep({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState<string | null>(null);

  if (!data.primary_sport || !data.primary_event_key) return null;

  const id = eventId(data.primary_sport, data.primary_event_key);
  const levels = getGoalLevelsForEvent(id);

  function handleNext() {
    const result = validateGoalStep(data.primary_sport, data.primary_event_key, data.goal_level_key);
    if (!result.ok) {
      setError(result.errors.goal_level_key);
      return;
    }
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Your goal</h1>
      <p className="text-slate-400 mb-8">
        {levels.length > 0
          ? "Pick the target your dashboard will measure progress against."
          : "There's no predefined goal ladder for this event yet — you can skip this step."}
      </p>

      {levels.length > 0 ? (
        <div className="space-y-3">
          {levels.map((level) => {
            const selected = data.goal_level_key === level.key;
            return (
              <button
                key={level.key}
                onClick={() => {
                  updateData({ goal_level_key: level.key });
                  setError(null);
                }}
                className={`w-full text-left rounded-xl p-4 transition ${
                  selected ? "bg-cyan-500 text-black font-semibold" : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <div className="font-semibold">{level.display_name}</div>
                <div className={`text-sm ${selected ? "text-black/70" : "text-slate-400"}`}>
                  {level.description}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900 p-4 text-slate-400 text-sm">
          No predefined goals available for this event yet.
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg bg-slate-800 px-4 py-2">
          Back
        </button>
        <button onClick={handleNext} className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
          Next
        </button>
      </div>
    </div>
  );
}
