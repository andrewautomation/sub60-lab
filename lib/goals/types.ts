/**
 * One rung on an event's structured goal ladder — e.g. Sprint Triathlon's
 * Finish / Sub-90 / Sub-75 / Sub-60 / Elite. An athlete's Goal always
 * resolves to one of these (or an explicit custom target — see
 * types/goal.ts), never free text, so "how close is the athlete to their
 * goal" is always a real number comparison against target_seconds.
 */
export interface GoalLevel {
  /** Unique within its event's ladder. */
  key: string;
  display_name: string;
  description: string;
  /** Seconds — a finish/split time target. Null means "no time
   * requirement, just complete the distance" (a ladder's "Finish" rung). */
  target_seconds: number | null;
}
