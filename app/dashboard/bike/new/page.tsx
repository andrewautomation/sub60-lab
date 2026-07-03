"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TestForm, { TestFormValues } from "@/components/tests/TestForm";
import { useBikeTests } from "@/hooks/useBikeTests";
import { useTestTypes } from "@/hooks/useTestTypes";
import { BIKE_TEST_DEFAULT_VALUES, BIKE_TEST_FIELDS, valuesToNewBikeTest } from "@/lib/tests/bikeFields";
import { validateBikeTestForm } from "@/lib/validators/validateBikeTestForm";

export default function NewBikeTestPage() {
  const router = useRouter();
  const { createTest } = useBikeTests();
  const { testTypes, create: createTestType } = useTestTypes("bike");

  const [values, setValues] = useState<TestFormValues>(BIKE_TEST_DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateValue(key: string, value: string | number | null) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    const input = valuesToNewBikeTest(values);
    const result = validateBikeTestForm(input);
    setErrors(result.errors);
    setWarnings(result.warnings);
    if (!result.ok) return;

    setSubmitting(true);
    setSubmitError(null);
    const { error } = await createTest(input);
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    router.push("/dashboard/bike");
  }

  return (
    <div>
      <Link href="/dashboard/bike" className="text-cyan-400">
        ← Bike
      </Link>
      <h1 className="text-4xl font-bold mt-4 mb-8">🚴 Add Bike Test</h1>

      <div className="max-w-2xl rounded-2xl bg-slate-900 p-6">
        <TestForm
          fields={BIKE_TEST_FIELDS}
          values={values}
          onChange={updateValue}
          errors={errors}
          warnings={warnings}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/bike")}
          submitting={submitting}
          submitLabel="Save test"
          submitError={submitError}
          testTypeOptions={testTypes}
          onCreateTestType={createTestType}
        />
      </div>
    </div>
  );
}
