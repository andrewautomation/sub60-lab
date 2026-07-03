import { SwimTest } from "./swim";
import { BikeTest } from "./bike";
import { RunTest } from "./run";

/** One sport's dashboard summary: latest logged test, personal best, and
 * gap to this app's default target for that discipline (see
 * lib/analytics/targets.ts). All null until at least one test exists. */
export interface SportSummary<T> {
  latest: T | null;
  personalBest: T | null;
  gapToTarget: number | null;
}

export interface DashboardSummary {
  swim: SportSummary<SwimTest>;
  bike: SportSummary<BikeTest>;
  run: SportSummary<RunTest>;
}
