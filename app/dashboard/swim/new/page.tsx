"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TestForm, { TestFormValues } from "@/components/tests/TestForm";
import { useSwimTests } from "@/hooks/useSwimTests";
import { useTestTypes } from "@/hooks/useTestTypes";
import { SWIM_TEST_DEFAULT_VALUES, SWIM_TEST_FIELDS, valuesToNewSwimTest } from "@/lib/tests/swimFields";
import { validateSwimTestForm } from "@/lib/validators/validateSwimTestForm";

export default function NewSwimTestPage() {
  const router = useRouter();
  const { createTest } = useSwimTests();
  const { testTypes, create: createTestType } = useTestTypes("swim");

  const [values, setValues] = useState<TestFormValues>(SWIM_TEST_DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateValue(key: string, value: string | number | null) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    const input = valuesToNewSwimTest(values);
    const result = validateSwimTestForm(input);
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

    router.push("/dashboard/swim");
  }

  return (
    <div>
      <Link href="/dashboard/swim" className="text-cyan-400">
        ← Swim
      </Link>
      <h1 className="text-4xl font-bold mt-4 mb-8">🏊 Add Swim Test</h1>

      <div className="max-w-2xl rounded-2xl bg-slate-900 p-6">
        <TestForm
          fields={SWIM_TEST_FIELDS}
          values={values}
          onChange={updateValue}
          errors={errors}
          warnings={warnings}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/swim")}
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
