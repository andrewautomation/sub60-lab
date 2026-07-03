"use client";

import { useEffect, useState } from "react";
import {
  deleteBikeTest,
  fetchBikeTests,
  insertBikeTest,
  updateBikeTest,
} from "@/services/bike.service";
import { BikeTest, NewBikeTest } from "@/types/bike";

/** Loads bike tests and exposes create/edit/remove wrapping
 * services/bike.service.ts, so pages never call the service directly.
 * `error` is only set on a genuine fetch failure — never for "no tests
 * yet" — so pages can show a retryable error instead of a false
 * empty-state. */
export function useBikeTests() {
  const [tests, setTests] = useState<BikeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { tests: data, error } = await fetchBikeTests();
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
    const { tests: data, error } = await fetchBikeTests();
    setTests(data);
    setError(error);
  }

  async function createTest(input: NewBikeTest) {
    const { error } = await insertBikeTest(input);
    if (!error) await refresh();
    return { error };
  }

  async function editTest(id: string, input: NewBikeTest) {
    const { error } = await updateBikeTest(id, input);
    if (!error) await refresh();
    return { error };
  }

  async function removeTest(id: string) {
    const { error } = await deleteBikeTest(id);
    if (!error) await refresh();
    return { error };
  }

  return { tests, loading, error, refresh, createTest, editTest, removeTest };
}
