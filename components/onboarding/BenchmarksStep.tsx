"use client";

import { useState } from "react";
import { BENCHMARK_FIELDS_BY_SPORT } from "@/lib/benchmarks/fields";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";
import { formatDuration } from "@/lib/format/time";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Entirely optional — every field here is a self-reported baseline used
 * only for the dashboard identity badge (lib/ranking), not for goals or
 * analytics, so nothing here should ever block onboarding. "Skip for now"
 * and "Next" are the same action; the distinction is purely copy, so an
 * athlete who filled nothing in doesn't feel like they missed a required
 * step.
 */
export default function BenchmarksStep({ data, updateData, onNext, onBack }: Props) {
  const [durationText, setDurationText] = useState<Record<string, string>>({});

  if (!data.primary_sport) return null;
  const fields = BENCHMARK_FIELDS_BY_SPORT[data.primary_sport];
  const anyFilled = Object.values(data.benchmarks).some((v) => v !== null && v !== undefined);

  function setBenchmark(key: string, seconds: number | null) {
    updateData({ benchmarks: { ...data.benchmarks, [key]: seconds } });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Your standard benchmarks</h1>
      <p className="text-slate-400 mb-8">
        Optional — if you know a recent time (or your 20-min power) at any of these, it powers a rough
        estimated ranking badge on your dashboard. Skip this if you don&apos;t know any yet; you can add
        them later in Settings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
            {field.type === "watts" ? (
              <input
                type="number"
                min={0}
                placeholder="e.g. 250"
                className="w-full rounded-lg p-3 bg-slate-800"
                value={(data.benchmarks[field.key] as number | undefined) ?? ""}
                onChange={(e) => setBenchmark(field.key, e.target.value === "" ? null : Number(e.target.value))}
              />
            ) : (
              <input
                type="text"
                placeholder="H:MM:SS"
                className="w-full rounded-lg p-3 bg-slate-800"
                value={
                  durationText[field.key] ??
                  (data.benchmarks[field.key] != null ? formatDuration(data.benchmarks[field.key] as number) : "")
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setDurationText((current) => ({ ...current, [field.key]: value }));
                  const parsed = parseDurationToSeconds(value);
                  setBenchmark(field.key, parsed && parsed > 0 ? parsed : null);
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg bg-slate-800 px-4 py-2">
          Back
        </button>
        <button onClick={onNext} className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
          {anyFilled ? "Next" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}
