import { RaceFormat } from "@/lib/race/models";
import { getRaceTargets } from "@/lib/race/targets";
import { EventDefinition, SportDefinition, SportKey } from "./types";

/**
 * Sport & Event Catalog.
 *
 * The single source of truth for every sport and event the onboarding flow
 * (and, downstream, dashboards/analytics/race prediction/AI coaching) can
 * reason about. New sports or events are added here as data — no other
 * module branches on SportKey or an event key, so extending this catalog
 * never requires touching the onboarding UI, equipment/baseline forms, or
 * the athlete domain helpers in lib/athlete/domain.ts.
 *
 * The `sports` / `events` DB tables (see supabase/migrations) are a seeded
 * mirror of this file, keyed by the same stable strings — see
 * lib/sports/registry.ts eventId(). This file stays the source of truth
 * for shape and behavior (pure, no network); the DB tables exist so
 * per-athlete rows (profiles, goals) can hold a real foreign key.
 */

function raceEvent(key: string, label: string, legs: EventDefinition["legs"]): EventDefinition {
  return { key, label, kind: "race", legs, is_custom: false };
}

function testEvent(key: string, label: string, legs: EventDefinition["legs"]): EventDefinition {
  return { key, label, kind: "test", legs, is_custom: false };
}

/** Every sport gets one of these: lets an athlete train/race a distance
 * the catalog doesn't enumerate without the catalog anticipating every
 * possible number. `legs` is empty here — the athlete supplies their own
 * at selection time (see Athlete.primary_event_custom_legs). */
function customEvent(): EventDefinition {
  return { key: "custom", label: "Custom", kind: "race", legs: [], is_custom: true };
}

/** Triathlon events reuse the Race Intelligence Engine's own distances
 * (lib/race/targets.ts) instead of duplicating them here, so there's
 * exactly one place that defines a race format's distances. */
function triathlonEvent(format: RaceFormat, label: string): EventDefinition {
  const { distances } = getRaceTargets(format);
  return raceEvent(format, label, [
    { discipline: "swim", distance: distances.swimMeters },
    { discipline: "bike", distance: distances.bikeKm },
    { discipline: "run", distance: distances.runKm },
  ]);
}

export const SPORT_CATALOG: Record<SportKey, SportDefinition> = {
  swimming: {
    key: "swimming",
    label: "Swimming",
    emoji: "🏊",
    disciplines: ["swim"],
    events: [
      raceEvent("swim_100m", "100 m", [{ discipline: "swim", distance: 100 }]),
      raceEvent("swim_200m", "200 m", [{ discipline: "swim", distance: 200 }]),
      raceEvent("swim_400m", "400 m", [{ discipline: "swim", distance: 400 }]),
      raceEvent("swim_800m", "800 m", [{ discipline: "swim", distance: 800 }]),
      raceEvent("swim_1500m", "1500 m", [{ discipline: "swim", distance: 1500 }]),
      testEvent("swim_css", "CSS (Critical Swim Speed) Test", [{ discipline: "swim", distance: 400 }]),
      customEvent(),
    ],
  },

  cycling: {
    key: "cycling",
    label: "Cycling",
    emoji: "🚴",
    disciplines: ["bike"],
    events: [
      testEvent("bike_ftp", "FTP Test", [{ discipline: "bike", distance: 20 }]),
      raceEvent("bike_10k", "10K Time Trial", [{ discipline: "bike", distance: 10 }]),
      raceEvent("bike_20k", "20K Time Trial", [{ discipline: "bike", distance: 20 }]),
      raceEvent("bike_40k", "40K Time Trial", [{ discipline: "bike", distance: 40 }]),
      raceEvent("bike_hill_climb", "Hill Climb", [{ discipline: "bike", distance: 10 }]),
      customEvent(),
    ],
  },

  running: {
    key: "running",
    label: "Running",
    emoji: "🏃",
    disciplines: ["run"],
    events: [
      raceEvent("run_800m", "800 m", [{ discipline: "run", distance: 0.8 }]),
      raceEvent("run_1500m", "1500 m", [{ discipline: "run", distance: 1.5 }]),
      raceEvent("run_3000m", "3000 m", [{ discipline: "run", distance: 3 }]),
      raceEvent("run_5k", "5K", [{ discipline: "run", distance: 5 }]),
      raceEvent("run_10k", "10K", [{ discipline: "run", distance: 10 }]),
      raceEvent("run_half_marathon", "Half Marathon", [{ discipline: "run", distance: 21.1 }]),
      raceEvent("run_marathon", "Marathon", [{ discipline: "run", distance: 42.2 }]),
      customEvent(),
    ],
  },

  duathlon: {
    key: "duathlon",
    label: "Duathlon",
    emoji: "🏃🚴",
    disciplines: ["run", "bike"],
    events: [
      raceEvent("duathlon_sprint", "Sprint (5K-20K-2.5K)", [
        { discipline: "run", distance: 5 },
        { discipline: "bike", distance: 20 },
        { discipline: "run", distance: 2.5 },
      ]),
      raceEvent("duathlon_standard", "Standard (10K-40K-5K)", [
        { discipline: "run", distance: 10 },
        { discipline: "bike", distance: 40 },
        { discipline: "run", distance: 5 },
      ]),
      customEvent(),
    ],
  },

  aquathlon: {
    key: "aquathlon",
    label: "Aquathlon",
    emoji: "🏊🏃",
    disciplines: ["swim", "run"],
    events: [
      raceEvent("aquathlon_sprint", "Sprint (500 m Swim - 2.5K Run)", [
        { discipline: "swim", distance: 500 },
        { discipline: "run", distance: 2.5 },
      ]),
      raceEvent("aquathlon_standard", "Standard (1K Swim - 5K Run)", [
        { discipline: "swim", distance: 1000 },
        { discipline: "run", distance: 5 },
      ]),
      customEvent(),
    ],
  },

  triathlon: {
    key: "triathlon",
    label: "Triathlon",
    emoji: "🏊🚴🏃",
    disciplines: ["swim", "bike", "run"],
    events: [
      triathlonEvent("super_sprint", "Super Sprint"),
      triathlonEvent("sprint", "Sprint"),
      triathlonEvent("olympic", "Olympic"),
      triathlonEvent("half_iron", "70.3"),
      triathlonEvent("full_iron", "140.6"),
      customEvent(),
    ],
  },
};
