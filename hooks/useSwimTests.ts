"use client";

import { useEffect, useState } from "react";
import { fetchSwimTests } from "@/services/swim.service";
import { SwimTest } from "@/types/swim";

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

  return { tests, loading };
}
