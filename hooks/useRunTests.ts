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
 * services/run.service.ts, so pages never call the service directly. */
export function useRunTests() {
  const [tests, setTests] = useState<RunTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchRunTests();
      if (active) {
        setTests(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    const data = await fetchRunTests();
    setTests(data);
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

  return { tests, loading, refresh, createTest, editTest, removeTest };
}
