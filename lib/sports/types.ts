import { Discipline, RaceFormat } from "@/lib/race/models";

export type { Discipline };

/**
 * Every sport the onboarding flow can configure an athlete for. Adding a
 * new sport means adding a key here and an entry in catalog.ts — nothing
 * else in the domain (equipment, baselines, onboarding UI) is keyed off
 * this type directly, only off Discipline, so it stays a closed list of
 * identifiers rather than a switch statement scattered through the app.
 */
export type SportKey =
  | "swimming"
  | "cycling"
  | "running"
  | "duathlon"
  | "aquathlon"
  | "triathlon";

export interface EventLeg {
  discipline: Discipline;
  /** meters for swim, kilometers for bike/run — matches the convention
   * already established by lib/race/models.ts LegSplit. */
  distance: number;
}

/** "race": a distance the athlete competes or times themself over.
 * "test": a fitness-testing protocol rather than a race distance (e.g.
 * Cycling's FTP Test) — still selectable as a primary event, since some
 * athletes' whole goal is a test number, not a race. */
export type EventKind = "race" | "test";

export interface EventDefinition {
  /** Unique within its sport, not globally — see registry.ts eventId()
   * for the globally-unique id used as a DB foreign key. */
  key: string;
  label: string;
  kind: EventKind;
  /** Ordered legs an athlete completes for this event. Length 1 for
   * single-discipline sports, >1 for multisport. Empty for is_custom
   * events — the athlete supplies their own legs at selection time. */
  legs: EventLeg[];
  /** True only for each sport's "Custom" catch-all entry, letting an
   * athlete race/train a distance the catalog doesn't enumerate without
   * the catalog needing to anticipate every possible distance. */
  is_custom: boolean;
  /** Present only when this event maps onto the existing Race Intelligence
   * Engine's format catalog (lib/race/targets.ts) — lets race prediction
   * reuse its format-specific targets instead of re-deriving them here. */
  raceFormat?: RaceFormat;
}

export interface SportDefinition {
  key: SportKey;
  label: string;
  emoji: string;
  /**
   * Every discipline this sport draws equipment questions and baseline
   * tests from. A new sport composed of existing disciplines (say, a
   * "swim-bike" event) needs no new equipment or baseline UI — those are
   * generated from this list via lib/sports/equipment.ts, which is keyed
   * by Discipline, not SportKey.
   */
  disciplines: Discipline[];
  events: EventDefinition[];
}
