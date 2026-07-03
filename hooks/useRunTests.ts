"use client";

import { useEffect, useState } from "react";
import {
  deleteRunTest,
  fetchRunTests,
  insertRunTest,
  updateRunTest,
} from "@/services/run.service";
import { NewRunTest, RunTest } from "@/types/run";

/** Loads run tests and exposes create/edit/remove wrapping
 * services/run.service.ts, so pages never call the service directly.
 * `error` is only set on a genuine fetch failure — never for "no tests
 * yet" — so pages can show a retryable error instead of a false
 * empty-state. */
export function useRunTests() {
  const [tests, setTests] = useState<RunTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { tests: data, error } = await fetchRunTests();
      if (active) {
        setTests(data);
        setError(error);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    const { tests: data, error } = await fetchRunTests();
    setTests(data);
    setError(error);
  }

  async function createTest(input: NewRunTest) {
    const { error } = await insertRunTest(input);
    if (!error) await refresh();
    return { error };
  }

  async function editTest(id: string, input: NewRunTest) {
    const { error } = await updateRunTest(id, input);
    if (!error) await refresh();
    return { error };
  }

  async function removeTest(id: string) {
    const { error } = await deleteRunTest(id);
    if (!error) await refresh();
    return { error };
  }

  return { tests, loading, error, refresh, createTest, editTest, removeTest };
}
