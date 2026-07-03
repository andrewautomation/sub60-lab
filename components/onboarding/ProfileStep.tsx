"use client";

import { useState } from "react";
import { validateProfileStep } from "@/lib/validators/validateOnboarding";
import { OnboardingFormState } from "@/hooks/useOnboarding";
import { Sex } from "@/types/athlete";

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
      <p className="text-slate-400 mb-8">Used to personalize your targets.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="First name"
              value={data.first_name}
              onChange={(e) => updateData({ first_name: e.target.value })}
            />
            {errors.first_name && <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>}
          </div>
          <div>
            <input
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="Last name"
              value={data.last_name}
              onChange={(e) => updateData({ last_name: e.target.value })}
            />
            {errors.last_name && <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="date"
              className="w-full rounded-lg p-3 bg-slate-800"
              value={data.birth_date ?? ""}
              onChange={(e) => updateData({ birth_date: e.target.value || null })}
            />
            {errors.birth_date && <p className="mt-1 text-sm text-red-400">{errors.birth_date}</p>}
          </div>

          <select
            className="w-full rounded-lg p-3 bg-slate-800"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <input
            className="w-full rounded-lg p-3 bg-slate-800"
            placeholder="Country"
            value={data.country ?? ""}
            onChange={(e) => updateData({ country: e.target.value || null })}
          />
          {errors.country && <p className="mt-1 text-sm text-red-400">{errors.country}</p>}
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
