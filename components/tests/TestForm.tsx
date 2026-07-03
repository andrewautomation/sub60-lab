"use client";

export type TestFieldType = "date" | "text" | "number" | "duration" | "textarea";

export interface TestFieldConfig {
  key: string;
  label: string;
  type: TestFieldType;
  required?: boolean;
  placeholder?: string;
  step?: number;
  unit?: string;
}

export type TestFormValues = Record<string, string | number | null>;

interface DurationInputProps {
  totalSeconds: number | null;
  onChange: (seconds: number | null) => void;
}

function DurationInput({ totalSeconds, onChange }: DurationInputProps) {
  const minutes = totalSeconds !== null ? Math.floor(totalSeconds / 60) : null;
  const seconds = totalSeconds !== null ? totalSeconds % 60 : null;

  function update(nextMinutes: number | null, nextSeconds: number | null) {
    const total = (nextMinutes ?? 0) * 60 + (nextSeconds ?? 0);
    onChange(total > 0 ? total : null);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="number"
        min={0}
        placeholder="Minutes"
        className="w-full rounded-lg p-3 bg-slate-800"
        value={minutes ?? ""}
        onChange={(e) => update(e.target.value === "" ? null : Number(e.target.value), seconds)}
      />
      <input
        type="number"
        min={0}
        max={59}
        placeholder="Seconds"
        className="w-full rounded-lg p-3 bg-slate-800"
        value={seconds ?? ""}
        onChange={(e) => update(minutes, e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}

interface Props {
  fields: TestFieldConfig[];
  values: TestFormValues;
  onChange: (key: string, value: string | number | null) => void;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
  submitError: string | null;
}

/**
 * Config-driven Add/Edit form shared by the Swim, Bike, and Run test
 * modules — each page supplies its own field list and owns the raw form
 * state; this component only knows how to render+wire each field type.
 */
export default function TestForm({
  fields,
  values,
  onChange,
  errors,
  warnings,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  submitError,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
            <label className="block text-sm text-slate-400 mb-1">
              {field.label}
              {field.required && <span className="text-cyan-400"> *</span>}
              {field.unit && <span className="text-slate-500"> ({field.unit})</span>}
            </label>

            {field.type === "duration" ? (
              <DurationInput
                totalSeconds={typeof values[field.key] === "number" ? (values[field.key] as number) : null}
                onChange={(seconds) => onChange(field.key, seconds)}
              />
            ) : field.type === "textarea" ? (
              <textarea
                className="w-full rounded-lg p-3 bg-slate-800"
                rows={3}
                placeholder={field.placeholder}
                value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
                onChange={(e) => onChange(field.key, e.target.value || null)}
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                step={field.step}
                className="w-full rounded-lg p-3 bg-slate-800"
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) => {
                  if (field.type === "number") {
                    onChange(field.key, e.target.value === "" ? null : Number(e.target.value));
                  } else {
                    onChange(field.key, e.target.value || null);
                  }
                }}
              />
            )}

            {errors[field.key] && <p className="mt-1 text-sm text-red-400">{errors[field.key]}</p>}
            {!errors[field.key] && warnings[field.key] && (
              <p className="mt-1 text-sm text-amber-400">{warnings[field.key]}</p>
            )}
          </div>
        ))}
      </div>

      {submitError && <p className="text-sm text-red-400">{submitError}</p>}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-60">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-cyan-500 px-6 py-2 text-black font-semibold disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
