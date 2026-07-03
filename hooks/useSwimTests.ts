"use client";

import { useEffect, useState } from "react";
import {
  deleteSwimTest,
  fetchSwimTests,
  insertSwimTest,
  updateSwimTest,
} from "@/services/swim.service";
import { NewSwimTest, SwimTest } from "@/types/swim";

/** Loads swim tests and exposes create/edit/remove wrapping
 * services/swim.service.ts, so pages never call the service directly.
 * `error` is only set on a genuine fetch failure — never for "no tests
 * yet" — so pages can show a retryable error instead of a false
 * empty-state. */
export function useSwimTests() {
  const [tests, setTests] = useState<SwimTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { tests: data, error } = await fetchSwimTests();
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
    const { tests: data, error } = await fetchSwimTests();
    setTests(data);
    setError(error);
  }

  async function createTest(input: NewSwimTest) {
    const { error } = await insertSwimTest(input);
    if (!error) await refresh();
    return { error };
  }

  async function editTest(id: string, input: NewSwimTest) {
    const { error } = await updateSwimTest(id, input);
    if (!error) await refresh();
    return { error };
  }

  async function removeTest(id: string) {
    const { error } = await deleteSwimTest(id);
    if (!error) await refresh();
    return { error };
  }

  return { tests, loading, error, refresh, createTest, editTest, removeTest };
}
