"use client";

import { useState } from "react";
import { getDisciplinesForSport } from "@/lib/sports/registry";
import { validateBaselineStep } from "@/lib/validators/validateOnboarding";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function secondsToParts(seconds: number | undefined): { minutes: string; seconds: string } {
  if (seconds === undefined) return { minutes: "", seconds: "" };
  return { minutes: String(Math.floor(seconds / 60)), seconds: String(Math.round(seconds % 60)) };
}

function partsToSeconds(minutes: string, seconds: string): number {
  return (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
}

function BaselineRow({
  emoji,
  label,
  distanceLabel,
  distanceValue,
  timeSeconds,
  onDistanceChange,
  onTimeChange,
  error,
}: {
  emoji: string;
  label: string;
  distanceLabel: string;
  distanceValue: number | undefined;
  timeSeconds: number | undefined;
  onDistanceChange: (value: number) => void;
  onTimeChange: (seconds: number) => void;
  error?: string;
}) {
  const parts = secondsToParts(timeSeconds);

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h2 className="font-semibold mb-3">
        {emoji} {label}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <input
          type="number"
          placeholder={distanceLabel}
          className="rounded-lg p-3 bg-slate-800"
          value={distanceValue ?? ""}
          onChange={(e) => onDistanceChange(Number(e.target.value) || 0)}
        />
        <input
          type="number"
          placeholder="Minutes"
          className="rounded-lg p-3 bg-slate-800"
          value={parts.minutes}
          onChange={(e) => onTimeChange(partsToSeconds(e.target.value, parts.seconds))}
        />
        <input
          type="number"
          placeholder="Seconds"
          className="rounded-lg p-3 bg-slate-800"
          value={parts.seconds}
          onChange={(e) => onTimeChange(partsToSeconds(parts.minutes, e.target.value))}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function BaselineStep({ data, updateData, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!data.primary_sport) return null;
  const disciplines = getDisciplinesForSport(data.primary_sport);

  function handleNext() {
    const result = validateBaselineStep(disciplines, data.baselines);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Recent baseline (optional)</h1>
      <p className="text-slate-400 mb-8">
        A recent time trial for each discipline gives your dashboard, targets, and race prediction something
        to start from. Leave anything blank if you don&apos;t have it yet.
      </p>

      <div className="space-y-6">
        {disciplines.includes("swim") && (
          <BaselineRow
            emoji="🏊"
            label="Swim"
            distanceLabel="Distance (m)"
            distanceValue={data.baselines.swim?.distance_m}
            timeSeconds={data.baselines.swim?.time_seconds}
            onDistanceChange={(distance_m) =>
              updateData({
                baselines: {
                  ...data.baselines,
                  swim: { distance_m, time_seconds: data.baselines.swim?.time_seconds ?? 0 },
                },
              })
            }
            onTimeChange={(time_seconds) =>
              updateData({
                baselines: {
                  ...data.baselines,
                  swim: { distance_m: data.baselines.swim?.distance_m ?? 0, time_seconds },
                },
              })
            }
            error={errors.swim}
          />
        )}

        {disciplines.includes("bike") && (
          <BaselineRow
            emoji="🚴"
            label="Bike"
            distanceLabel="Distance (km)"
            distanceValue={data.baselines.bike?.distance_km}
            timeSeconds={data.baselines.bike?.time_seconds}
            onDistanceChange={(distance_km) =>
              updateData({
                baselines: {
                  ...data.baselines,
                  bike: { distance_km, time_seconds: data.baselines.bike?.time_seconds ?? 0 },
                },
              })
            }
            onTimeChange={(time_seconds) =>
              updateData({
                baselines: {
                  ...data.baselines,
                  bike: { distance_km: data.baselines.bike?.distance_km ?? 0, time_seconds },
                },
              })
            }
            error={errors.bike}
          />
        )}

        {disciplines.includes("run") && (
          <BaselineRow
            emoji="🏃"
            label="Run"
            distanceLabel="Distance (km)"
            distanceValue={data.baselines.run?.distance_km}
            timeSeconds={data.baselines.run?.time_seconds}
            onDistanceChange={(distance_km) =>
              updateData({
                baselines: {
                  ...data.baselines,
                  run: { distance_km, time_seconds: data.baselines.run?.time_seconds ?? 0 },
                },
              })
            }
            onTimeChange={(time_seconds) =>
              updateData({
                baselines: {
                  ...data.baselines,
                  run: { distance_km: data.baselines.run?.distance_km ?? 0, time_seconds },
                },
              })
            }
            error={errors.run}
          />
        )}
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
