import { Discipline, EventKind, EventLeg, SportKey } from "@/lib/sports/types";

/**
 * DB row for the `sports` table — a persisted, seeded mirror of
 * lib/sports/catalog.ts SPORT_CATALOG, existing only so per-athlete rows
 * (profiles.primary_sport_id) can hold a real foreign key with referential
 * integrity. Pure calculation code (race prediction, analytics, AI
 * coaching) should prefer lib/sports/registry.ts — same data, no network
 * round trip.
 */
export interface Sport {
  id: SportKey;
  name: string;
  emoji: string;
  disciplines: Discipline[];
  created_at: string;
}

/**
 * DB row for the `events` table — a persisted, seeded mirror of each
 * SportDefinition's events. `id` is the composite key produced by
 * lib/sports/registry.ts eventId(), so it's directly resolvable back into
 * the catalog without a lookup.
 */
export interface EventRow {
  id: string;
  sport_id: SportKey;
  key: string;
  name: string;
  kind: EventKind;
  /** Null for is_custom rows — the athlete supplies legs themselves. */
  legs: EventLeg[] | null;
  is_custom: boolean;
  sort_order: number;
}
