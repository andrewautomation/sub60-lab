"use client";

import { useState } from "react";
import { eventId } from "@/lib/sports/registry";
import { getGoalLevelsForEvent } from "@/lib/goals/registry";
import { validateGoalStep } from "@/lib/validators/validateOnboarding";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";
import { formatDuration } from "@/lib/format/time";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GoalStep({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(data.goal_custom_target_seconds !== null);
  const [customText, setCustomText] = useState(
    data.goal_custom_target_seconds !== null ? formatDuration(data.goal_custom_target_seconds) : ""
  );

  if (!data.primary_sport || !data.primary_event_key) return null;

  const id = eventId(data.primary_sport, data.primary_event_key);
  const levels = getGoalLevelsForEvent(id);

  function selectCustom() {
    setCustomMode(true);
    updateData({ goal_level_key: null });
    setError(null);
  }

  function handleCustomTextChange(value: string) {
    setCustomText(value);
    const parsed = parseDurationToSeconds(value);
    updateData({ goal_custom_target_seconds: parsed && parsed > 0 ? parsed : null });
    setError(null);
  }

  function handleNext() {
    const result = validateGoalStep(
      data.primary_sport,
      data.primary_event_key,
      data.goal_level_key,
      data.goal_custom_target_seconds
    );
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
          ? "Pick the target your dashboard will measure progress against, or set your own."
          : "There's no predefined goal ladder for this event yet — set your own target, or skip this step."}
      </p>

      <div className="space-y-3">
        {levels.map((level) => {
          const selected = !customMode && data.goal_level_key === level.key;
          return (
            <button
              key={level.key}
              onClick={() => {
                setCustomMode(false);
                setCustomText("");
                updateData({ goal_level_key: level.key, goal_custom_target_seconds: null });
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

        <button
          onClick={selectCustom}
          className={`w-full text-left rounded-xl p-4 transition ${
            customMode ? "bg-cyan-500 text-black font-semibold" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          <div className="font-semibold">Custom</div>
          <div className={`text-sm ${customMode ? "text-black/70" : "text-slate-400"}`}>
            Set your own target time.
          </div>
        </button>

        {customMode && (
          <input
            type="text"
            autoFocus
            value={customText}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            placeholder="H:MM:SS"
            className="w-full rounded-xl bg-slate-800 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        )}
      </div>

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
