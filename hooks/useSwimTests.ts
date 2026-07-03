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
 * services/swim.service.ts, so pages never call the service directly. */
export function useSwimTests() {
  const [tests, setTests] = useState<SwimTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchSwimTests();
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
    const data = await fetchSwimTests();
    setTests(data);
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

  return { tests, loading, refresh, createTest, editTest, removeTest };
}
