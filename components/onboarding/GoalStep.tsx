"use client";

import { useState } from "react";
import { validateGoalStep } from "@/lib/validators/validateOnboarding";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function secondsToParts(seconds: number | null): { hours: string; minutes: string; seconds: string } {
  if (seconds === null) return { hours: "", minutes: "", seconds: "" };
  return {
    hours: String(Math.floor(seconds / 3600)),
    minutes: String(Math.floor((seconds % 3600) / 60)),
    seconds: String(Math.round(seconds % 60)),
  };
}

function partsToSeconds(hours: string, minutes: string, seconds: string): number {
  return (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
}

export default function GoalStep({ data, updateData, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const parts = secondsToParts(data.goal_target_time_seconds);

  function updateTime(hours: string, minutes: string, seconds: string) {
    const total = partsToSeconds(hours, minutes, seconds);
    updateData({ goal_target_time_seconds: total > 0 ? total : null });
  }

  function handleNext() {
    const result = validateGoalStep(data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Your goal</h1>
      <p className="text-slate-400 mb-8">
        Optional, but it&apos;s what your dashboard and AI coaching will measure progress against.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Target race / event date</label>
          <input
            type="date"
            className="rounded-lg p-3 bg-slate-800"
            value={data.goal_target_date ?? ""}
            onChange={(e) => updateData({ goal_target_date: e.target.value || null })}
          />
          {errors.goal_target_date && <p className="mt-1 text-sm text-red-400">{errors.goal_target_date}</p>}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Target finish time</label>
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            <input
              type="number"
              placeholder="Hours"
              className="rounded-lg p-3 bg-slate-800"
              value={parts.hours}
              onChange={(e) => updateTime(e.target.value, parts.minutes, parts.seconds)}
            />
            <input
              type="number"
              placeholder="Minutes"
              className="rounded-lg p-3 bg-slate-800"
              value={parts.minutes}
              onChange={(e) => updateTime(parts.hours, e.target.value, parts.seconds)}
            />
            <input
              type="number"
              placeholder="Seconds"
              className="rounded-lg p-3 bg-slate-800"
              value={parts.seconds}
              onChange={(e) => updateTime(parts.hours, parts.minutes, e.target.value)}
            />
          </div>
          {errors.goal_target_time_seconds && (
            <p className="mt-1 text-sm text-red-400">{errors.goal_target_time_seconds}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">What&apos;s driving this goal? (optional)</label>
          <textarea
            className="w-full rounded-lg p-3 bg-slate-800"
            rows={3}
            value={data.goal_motivation ?? ""}
            onChange={(e) => updateData({ goal_motivation: e.target.value || null })}
          />
        </div>
      </div>

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
