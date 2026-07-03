import { Discipline } from "@/lib/race/models";

export interface TestType {
  id: string;
  discipline: Discipline;
  name: string;
  event_id: string | null;
  /** Meters for swim, kilometers for bike/run — the *total* distance
   * (reps * distance_per_rep for an interval-style type), set once at
   * creation and never changed. Descriptive for an interval type — the
   * Distance field on the Add/Edit Test form locks to distance_per_rep
   * instead, since a rep's pace only makes sense against a rep's
   * distance. Null only for types created before this existed. */
  distance: number | null;
  /** Set only for interval-style types ("12 x 400m") — distance_per_rep is
   * what the Distance field actually locks to for these; reps and
   * rest_seconds are purely descriptive. */
  reps: number | null;
  distance_per_rep: number | null;
  /** Optional rest between reps — purely descriptive, shown back to the
   * athlete when logging a test under this type. */
  rest_seconds: number | null;
}

export type NewTestType = Omit<TestType, "id">;

/** Input shape for creating a test type from the UI (components/tests/TestForm.tsx)
 * — distance is always the total (reps * distancePerRep for an interval
 * type), computed by the caller before this reaches the service layer. */
export interface NewTestTypeInput {
  name: string;
  distance: number;
  reps: number | null;
  distancePerRep: number | null;
  restSeconds: number | null;
}
