"use client";

import { useEffect, useState } from "react";
import { fetchProfile } from "@/services/profile.service";
import { createTestType, deleteTestType, fetchTestTypes } from "@/services/testType.service";
import { Discipline } from "@/lib/race/models";
import { TestType } from "@/types/testType";

/** Loads the signed-in athlete's test types for one discipline and exposes
 * a create() that both persists the new type and appends it to the local
 * list, so a freshly-created type is immediately selectable without a
 * refetch — mirrors hooks/useRunTests.ts's create/refresh shape. */
export function useTestTypes(discipline: Discipline) {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { profile, error: profileError } = await fetchProfile();
      if (!active) return;

      if (profileError || !profile) {
        setError(profileError);
        setLoading(false);
        return;
      }

      setProfileId(profile.id);
      const { testTypes: data, error: fetchError } = await fetchTestTypes(profile.id, discipline);
      if (!active) return;

      setTestTypes(data);
      setError(fetchError);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [discipline]);

  async function create(name: string): Promise<{ testType: TestType | null; error: string | null }> {
    if (!profileId) return { testType: null, error: "No athlete profile loaded." };

    const { testType, error } = await createTestType(profileId, { discipline, name, event_id: null });
    if (testType) setTestTypes((current) => [...current, testType]);
    return { testType, error };
  }

  async function remove(id: string): Promise<{ error: string | null }> {
    const { error } = await deleteTestType(id);
    if (!error) setTestTypes((current) => current.filter((t) => t.id !== id));
    return { error };
  }

  return { testTypes, loading, error, create, remove };
}
