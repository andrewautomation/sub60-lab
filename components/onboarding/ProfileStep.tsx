"use client";

import { useState } from "react";
import { validateProfileStep } from "@/lib/validators/validateOnboarding";
import { OnboardingFormState } from "@/hooks/useOnboarding";
import { ExperienceLevel, Sex } from "@/types/athlete";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
];

export default function ProfileStep({ data, updateData, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  function handleNext() {
    const result = validateProfileStep(data);
    setErrors(result.errors);
    setWarnings(result.warnings);
    if (!result.ok) return;
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Tell us about you</h1>
      <p className="text-slate-400 mb-8">
        Used to personalize targets and coaching — everything but your name is optional.
      </p>

      <div className="space-y-4">
        <div>
          <input
            className="w-full rounded-lg p-3 bg-slate-800"
            placeholder="Name"
            value={data.display_name}
            onChange={(e) => updateData({ display_name: e.target.value })}
          />
          {errors.display_name && <p className="mt-1 text-sm text-red-400">{errors.display_name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="rounded-lg p-3 bg-slate-800"
            value={data.date_of_birth ?? ""}
            onChange={(e) => updateData({ date_of_birth: e.target.value || null })}
          />

          <select
            className="rounded-lg p-3 bg-slate-800"
            value={data.sex}
            onChange={(e) => updateData({ sex: e.target.value as Sex })}
          >
            {SEX_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="Height (cm)"
              value={data.height_cm ?? ""}
              onChange={(e) => updateData({ height_cm: e.target.value ? Number(e.target.value) : null })}
            />
            {warnings.height_cm && <p className="mt-1 text-sm text-amber-400">{warnings.height_cm}</p>}
          </div>
          <div>
            <input
              type="number"
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="Weight (kg)"
              value={data.weight_kg ?? ""}
              onChange={(e) => updateData({ weight_kg: e.target.value ? Number(e.target.value) : null })}
            />
            {warnings.weight_kg && <p className="mt-1 text-sm text-amber-400">{warnings.weight_kg}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            className="rounded-lg p-3 bg-slate-800"
            value={data.experience_level}
            onChange={(e) => updateData({ experience_level: e.target.value as ExperienceLevel })}
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div>
            <input
              type="number"
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="Training days / week"
              value={data.training_days_per_week ?? ""}
              onChange={(e) =>
                updateData({ training_days_per_week: e.target.value ? Number(e.target.value) : null })
              }
            />
            {errors.training_days_per_week && (
              <p className="mt-1 text-sm text-red-400">{errors.training_days_per_week}</p>
            )}
          </div>
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
