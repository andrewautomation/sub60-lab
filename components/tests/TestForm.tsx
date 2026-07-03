"use client";

import { useState } from "react";
import { NewTestTypeInput, TestType } from "@/types/testType";
import { formatDuration } from "@/lib/format/time";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";

export type TestFieldType = "date" | "text" | "number" | "duration" | "textarea" | "test_type";

export interface TestFieldConfig {
  key: string;
  label: string;
  type: TestFieldType;
  required?: boolean;
  placeholder?: string;
  step?: number;
  unit?: string;
  /** Marks the Distance field so TestForm can auto-fill and lock it to
   * the selected Test Type's fixed distance (see TestTypeInput) — every
   * test logged under a type only stays comparable if they're all the
   * same distance. For an interval-style type, this locks to
   * distance_per_rep (a rep's pace only makes sense against a rep's
   * distance), not the type's total. */
  isDistance?: boolean;
  /** Marks the Time field so TestForm can relabel it "Rep time" when the
   * selected test type is interval-style — the value entered is one rep's
   * time, not the whole session's. */
  isTime?: boolean;
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

const NEW_TEST_TYPE_OPTION = "__new__";

interface NewTestTypeModalProps {
  distanceUnit: string;
  onCreate: (input: NewTestTypeInput) => Promise<{ testType: TestType | null; error: string | null }>;
  onCreated: (testType: TestType) => void;
  onClose: () => void;
}

/** A proper centered dialog rather than cramming name + distance + mode
 * into the same half-width form cell the dropdown lives in — that layout
 * couldn't fit "Intervals" mode's extra reps/per-rep inputs without
 * becoming unreadable. A new type's structure is captured once here and
 * never editable again (see TestForm's isDistance lock) — that's what
 * keeps every test logged under it comparable. */
function NewTestTypeModal({ distanceUnit, onCreate, onCreated, onClose }: NewTestTypeModalProps) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"single" | "intervals">("single");
  const [distance, setDistance] = useState("");
  const [reps, setReps] = useState("");
  // Always entered in meters — interval distances (400m, 800m, 1000m...)
  // are near-universally meter-denominated even for run/bike, whose
  // single-distance mode uses km. Storing "400" as 400km instead of 0.4km
  // silently produced an absurd Rep time once paired with a pace, so this
  // input never shares a unit with the single-distance one.
  const [distancePerRepMeters, setDistancePerRepMeters] = useState("");
  const [restText, setRestText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const metersPerUnit = distanceUnit === "km" ? 1000 : 1;
  const distancePerRep = (Number(distancePerRepMeters) || 0) / metersPerUnit;
  const totalDistance =
    mode === "single"
      ? Number(distance) || 0
      : Math.round((Number(reps) || 0) * distancePerRep * 1000) / 1000;

  async function handleCreate() {
    if (!name.trim()) {
      setError("Enter a name for this test type.");
      return;
    }
    if (totalDistance <= 0) {
      setError(
        mode === "single" ? "Enter the distance for this test type." : "Enter repetitions and distance per rep."
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    const { testType, error: createError } = await onCreate({
      name: name.trim(),
      distance: totalDistance,
      reps: mode === "intervals" ? Number(reps) : null,
      distancePerRep: mode === "intervals" ? distancePerRep : null,
      restSeconds: mode === "intervals" ? parseDurationToSeconds(restText) : null,
    });
    setSubmitting(false);

    if (createError || !testType) {
      setError(createError ?? "Could not create test type.");
      return;
    }
    onCreated(testType);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6">
        <h3 className="text-lg font-bold">New test type</h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              type="text"
              autoFocus
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="e.g. 5K Time Trial"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm ${
                mode === "single" ? "bg-cyan-500 text-black font-semibold" : "bg-slate-800 text-slate-300"
              }`}
            >
              Single distance
            </button>
            <button
              type="button"
              onClick={() => setMode("intervals")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm ${
                mode === "intervals" ? "bg-cyan-500 text-black font-semibold" : "bg-slate-800 text-slate-300"
              }`}
            >
              Intervals
            </button>
          </div>

          {mode === "single" ? (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Distance ({distanceUnit})</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg p-3 bg-slate-800"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Repetitions</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg p-3 bg-slate-800"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Distance per rep (m)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg p-3 bg-slate-800"
                  value={distancePerRepMeters}
                  onChange={(e) => setDistancePerRepMeters(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Rest between reps (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1:30"
                  className="w-full rounded-lg p-3 bg-slate-800"
                  value={restText}
                  onChange={(e) => setRestText(e.target.value)}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500">
            {mode === "single"
              ? "This distance is fixed for this test type — every test logged under it will use it."
              : totalDistance > 0
                ? `${reps} × ${distancePerRepMeters}m = ${totalDistance}${distanceUnit} total. When logging a test, Distance locks to ${
                    distanceUnit === "km" ? `${distancePerRep}km (${distancePerRepMeters}m)` : `${distancePerRepMeters}m`
                  } per rep and Time is one rep's time.`
                : "Distance per rep is fixed for this test type once set — Time will be one rep's time, not the whole session."}
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-60">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-black disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TestTypeInputProps {
  testTypeId: string | null;
  options: TestType[];
  distanceUnit: string;
  onSelect: (testType: TestType) => void;
  onCreate: (input: NewTestTypeInput) => Promise<{ testType: TestType | null; error: string | null }>;
}

/** Select-or-create for the athlete's own named test protocols ("5K Time
 * Trial", "6x400m Intervals"). */
function TestTypeInput({ testTypeId, options, distanceUnit, onSelect, onCreate }: TestTypeInputProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <select
        className="w-full rounded-lg p-3 bg-slate-800"
        value={testTypeId ?? ""}
        onChange={(e) => {
          if (e.target.value === NEW_TEST_TYPE_OPTION) {
            setShowModal(true);
            return;
          }
          const selected = options.find((t) => t.id === e.target.value);
          if (selected) onSelect(selected);
        }}
      >
        <option value="" disabled>
          Select a test type
        </option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
        <option value={NEW_TEST_TYPE_OPTION}>+ New test type...</option>
      </select>

      {showModal && (
        <NewTestTypeModal
          distanceUnit={distanceUnit}
          onCreate={onCreate}
          onClose={() => setShowModal(false)}
          onCreated={(testType) => {
            setShowModal(false);
            onSelect(testType);
          }}
        />
      )}
    </>
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
  testTypeOptions?: TestType[];
  onCreateTestType?: (input: NewTestTypeInput) => Promise<{ testType: TestType | null; error: string | null }>;
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
  testTypeOptions = [],
  onCreateTestType,
}: Props) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const testTypeField = fields.find((f) => f.type === "test_type");
  const distanceField = fields.find((f) => f.isDistance);
  const selectedTestType = testTypeField
    ? testTypeOptions.find((t) => t.id === values[testTypeField.key])
    : undefined;
  const isInterval = !!selectedTestType && selectedTestType.reps !== null && selectedTestType.distance_per_rep !== null;
  const isDistanceLocked = !!selectedTestType && selectedTestType.distance !== null;
  // A rep's pace only makes sense against a rep's distance, so an interval
  // type locks Distance to distance_per_rep — the type's `distance` field
  // stays the descriptive total (reps * distance_per_rep).
  const lockedDistanceValue = isInterval ? selectedTestType!.distance_per_rep : selectedTestType?.distance ?? null;

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
              {field.isTime && isInterval ? "Rep time" : field.label}
              {field.required && <span className="text-cyan-400"> *</span>}
              {field.unit && <span className="text-slate-500"> ({field.unit})</span>}
            </label>

            {field.type === "duration" ? (
              <DurationInput
                totalSeconds={typeof values[field.key] === "number" ? (values[field.key] as number) : null}
                onChange={(seconds) => onChange(field.key, seconds)}
              />
            ) : field.type === "test_type" && onCreateTestType ? (
              <TestTypeInput
                testTypeId={typeof values[field.key] === "string" ? (values[field.key] as string) : null}
                options={testTypeOptions}
                distanceUnit={distanceField?.unit ?? ""}
                onCreate={onCreateTestType}
                onSelect={(testType) => {
                  onChange(field.key, testType.id);
                  onChange("test_type", testType.name);
                  if (distanceField) {
                    const lockValue =
                      testType.reps !== null && testType.distance_per_rep !== null
                        ? testType.distance_per_rep
                        : testType.distance;
                    if (lockValue !== null) onChange(distanceField.key, lockValue);
                  }
                }}
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
                max={field.type === "date" ? todayIso : undefined}
                disabled={field.isDistance && isDistanceLocked}
                className="w-full rounded-lg p-3 bg-slate-800 disabled:opacity-60"
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

            {field.isDistance && isDistanceLocked && (
              <p className="mt-1 text-xs text-slate-500">
                {isInterval
                  ? `Fixed to ${lockedDistanceValue}${distanceField?.unit ?? ""}${
                      distanceField?.unit === "km" ? ` (${Math.round((lockedDistanceValue ?? 0) * 1000)}m)` : ""
                    } per rep by the "${selectedTestType?.name}" test type (${selectedTestType?.reps} reps, ${selectedTestType?.distance}${distanceField?.unit ?? ""} total).`
                  : `Fixed by the "${selectedTestType?.name}" test type.`}
              </p>
            )}
            {field.isTime && isInterval && (
              <p className="mt-1 text-xs text-slate-500">
                Time for one rep{" "}
                {selectedTestType?.rest_seconds != null && `— rest ${formatDuration(selectedTestType.rest_seconds)} between reps`}
              </p>
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
