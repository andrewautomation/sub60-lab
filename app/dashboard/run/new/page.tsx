"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TestForm, { TestFormValues } from "@/components/tests/TestForm";
import { useRunTests } from "@/hooks/useRunTests";
import { RUN_TEST_DEFAULT_VALUES, RUN_TEST_FIELDS, valuesToNewRunTest } from "@/lib/tests/runFields";
import { validateRunTestForm } from "@/lib/validators/validateRunTestForm";

export default function NewRunTestPage() {
  const router = useRouter();
  const { createTest } = useRunTests();

  const [values, setValues] = useState<TestFormValues>(RUN_TEST_DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateValue(key: string, value: string | number | null) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    const input = valuesToNewRunTest(values);
    const result = validateRunTestForm(input);
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

    router.push("/dashboard/run");
  }

  return (
    <div>
      <Link href="/dashboard/run" className="text-cyan-400">
        ← Run
      </Link>
      <h1 className="text-4xl font-bold mt-4 mb-8">🏃 Add Run Test</h1>

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
          submitLabel="Save test"
          submitError={submitError}
        />
      </div>
    </div>
  );
}
