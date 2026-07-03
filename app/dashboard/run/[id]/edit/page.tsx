"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TestForm, { TestFormValues } from "@/components/tests/TestForm";
import { useRunTests } from "@/hooks/useRunTests";
import { useTestTypes } from "@/hooks/useTestTypes";
import { RUN_TEST_FIELDS, runTestToValues, valuesToNewRunTest, withDerivedRunFields } from "@/lib/tests/runFields";
import { validateRunTestForm } from "@/lib/validators/validateRunTestForm";

export default function EditRunTestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { tests, loading, editTest } = useRunTests();
  const { testTypes, create: createTestType } = useTestTypes("run");

  const [values, setValues] = useState<TestFormValues | null>(null);
  const [loadedTestId, setLoadedTestId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const test = tests.find((t) => t.id === params.id) ?? null;

  // Seed the editable copy from the loaded test the first time it's
  // available — a render-time state adjustment (React's documented
  // pattern for this), not an effect, since it's a pure derivation from
  // already-rendered data rather than a sync with an external system.
  if (test && test.id !== loadedTestId) {
    setLoadedTestId(test.id);
    setValues(runTestToValues(test));
  }

  function updateValue(key: string, value: string | number | null) {
    setValues((current) => (current ? withDerivedRunFields(current, key, value) : current));
  }

  async function handleSubmit() {
    if (!values) return;

    const input = valuesToNewRunTest(values);
    const result = validateRunTestForm(input);
    setErrors(result.errors);
    setWarnings(result.warnings);
    if (!result.ok) return;

    setSubmitting(true);
    setSubmitError(null);
    const { error } = await editTest(params.id, input);
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    router.push("/dashboard/run");
  }

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  if (!test || !values) {
    return (
      <div>
        <Link href="/dashboard/run" className="text-cyan-400">
          ← Run
        </Link>
        <p className="mt-6 text-slate-400">Test not found — it may have already been deleted.</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/run" className="text-cyan-400">
        ← Run
      </Link>
      <h1 className="text-4xl font-bold mt-4 mb-8">🏃 Edit Run Test</h1>

      <div className="max-w-2xl rounded-2xl bg-slate-900 p-6">
        <TestForm
          fields={RUN_TEST_FIELDS}
          values={values}
          onChange={updateValue}
          errors={errors}
          warnings={warnings}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/run")}
          submitting={submitting}
          submitLabel="Save changes"
          submitError={submitError}
          testTypeOptions={testTypes}
          onCreateTestType={createTestType}
        />
      </div>
    </div>
  );
}
