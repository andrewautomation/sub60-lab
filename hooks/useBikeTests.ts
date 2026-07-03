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
 * services/bike.service.ts, so pages never call the service directly. */
export function useBikeTests() {
  const [tests, setTests] = useState<BikeTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchBikeTests();
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
    const data = await fetchBikeTests();
    setTests(data);
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

  return { tests, loading, refresh, createTest, editTest, removeTest };
}
