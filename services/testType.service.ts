import { supabase } from "@/lib/supabase";
import { Discipline } from "@/lib/race/models";
import { NewTestType, TestType } from "@/types/testType";

const TEST_TYPE_COLUMNS = "id, discipline, name, event_id";

export async function fetchTestTypes(
  profileId: string,
  discipline: Discipline
): Promise<{ testTypes: TestType[]; error: string | null }> {
  const { data, error } = await supabase
    .from("test_types")
    .select(TEST_TYPE_COLUMNS)
    .eq("profile_id", profileId)
    .eq("discipline", discipline)
    .order("created_at", { ascending: true });

  if (error) return { testTypes: [], error: error.message };
  return { testTypes: data ?? [], error: null };
}

export async function createTestType(
  profileId: string,
  input: NewTestType
): Promise<{ testType: TestType | null; error: string | null }> {
  const { data, error } = await supabase
    .from("test_types")
    .insert({ ...input, profile_id: profileId })
    .select(TEST_TYPE_COLUMNS)
    .single();

  if (error || !data) return { testType: null, error: error?.message ?? "Could not create test type." };
  return { testType: data, error: null };
}

/** Deleting a type never deletes the athlete's logged tests — the FK
 * (see supabase/migrations/20260703160000_test_types_delete_set_null.sql)
 * is ON DELETE SET NULL, so its tests just fall back to "Unsorted". */
export async function deleteTestType(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("test_types").delete().eq("id", id);
  return { error: error?.message ?? null };
}
