"use client";

import { getEquipmentFieldsForSport } from "@/lib/sports/equipment";
import { OnboardingFormState } from "@/hooks/useOnboarding";
import { AthleteEquipment } from "@/types/athlete";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

type EquipmentValue = boolean | string;

export default function EquipmentStep({ data, updateData, onNext, onBack }: Props) {
  if (!data.primary_sport) return null;

  const groups = getEquipmentFieldsForSport(data.primary_sport);

  function setField(discipline: keyof AthleteEquipment, key: string, value: EquipmentValue) {
    const current = (data.equipment[discipline] ?? {}) as Record<string, EquipmentValue>;
    updateData({
      equipment: {
        ...data.equipment,
        [discipline]: { ...current, [key]: value },
      } as AthleteEquipment,
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Your equipment</h1>
      <p className="text-slate-400 mb-8">
        Helps tailor recommendations to what you actually have access to.
      </p>

      <div className="space-y-8">
        {groups.map(({ discipline, fields }) => (
          <div key={discipline}>
            <h2 className="text-lg font-semibold capitalize mb-3">{discipline}</h2>
            <div className="space-y-3">
              {fields.map((field) => {
                const current = (data.equipment[discipline] ?? {}) as Record<string, EquipmentValue>;
                const value = current[field.key];

                if (field.type === "boolean") {
                  return (
                    <label key={field.key} className="flex items-center gap-3 rounded-lg bg-slate-900 p-3">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => setField(discipline, field.key, e.target.checked)}
                      />
                      {field.label}
                    </label>
                  );
                }

                return (
                  <div key={field.key} className="rounded-lg bg-slate-900 p-3">
                    <p className="mb-2 text-sm text-slate-400">{field.label}</p>
                    <select
                      className="w-full rounded-lg p-2 bg-slate-800"
                      value={typeof value === "string" ? value : ""}
                      onChange={(e) => setField(discipline, field.key, e.target.value)}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg bg-slate-800 px-4 py-2">
          Back
        </button>
        <button onClick={onNext} className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
          Next
        </button>
      </div>
    </div>
  );
}
