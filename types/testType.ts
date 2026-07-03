import { Discipline } from "@/lib/race/models";

export interface TestType {
  id: string;
  discipline: Discipline;
  name: string;
  event_id: string | null;
}

export type NewTestType = Omit<TestType, "id">;
