import { SPORT_CATALOG } from "./catalog";
import { Discipline, EventDefinition, SportDefinition, SportKey } from "./types";

/**
 * Read-only accessors over the Sport & Event Catalog. Every consumer
 * (onboarding UI, athlete domain helpers, future dashboards/analytics)
 * goes through these instead of importing SPORT_CATALOG directly, so the
 * catalog's shape can evolve without touching call sites.
 */

export function listSports(): SportDefinition[] {
  return Object.values(SPORT_CATALOG);
}

export function getSport(sportKey: SportKey): SportDefinition {
  return SPORT_CATALOG[sportKey];
}

export function getEventsForSport(sportKey: SportKey): EventDefinition[] {
  return getSport(sportKey).events;
}

export function getEvent(sportKey: SportKey, eventKey: string): EventDefinition | null {
  return getEventsForSport(sportKey).find((event) => event.key === eventKey) ?? null;
}

export function isValidEvent(sportKey: SportKey, eventKey: string): boolean {
  return getEvent(sportKey, eventKey) !== null;
}

export function getDisciplinesForSport(sportKey: SportKey): Discipline[] {
  return getSport(sportKey).disciplines;
}

/**
 * Globally-unique, stable, human-readable id for an event — used as the
 * `events.id` primary key in the DB (see supabase/migrations) so that
 * per-athlete rows (profiles.primary_event_id, goals.event_id) can hold a
 * real foreign key while application code still resolves it straight back
 * into the catalog without a join or a uuid lookup table.
 */
export function eventId(sportKey: SportKey, eventKey: string): string {
  return `${sportKey}:${eventKey}`;
}

export function parseEventId(id: string): { sportKey: SportKey; eventKey: string } | null {
  const [sportKey, ...rest] = id.split(":");
  if (!sportKey || rest.length === 0) return null;
  return { sportKey: sportKey as SportKey, eventKey: rest.join(":") };
}

export function getEventById(id: string): EventDefinition | null {
  const parsed = parseEventId(id);
  if (!parsed) return null;
  return getEvent(parsed.sportKey, parsed.eventKey);
}
