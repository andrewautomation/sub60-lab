import { BikeTest } from "@/types/bike";
import { RunTest } from "@/types/run";
import { SwimTest } from "@/types/swim";
import { average, riegelPredict, sortByDateAscending, takeMostRecent } from "@/lib/analytics/shared";
import { BikeBasis, LegSplit, PredictionMode, RunBasis, SwimBasis } from "./models";

const DEFAULT_ROLLING_WINDOW = 3;

/** Cycling speed scales roughly with the cube root of power once
 * aerodynamic drag dominates (power ∝ speed^3 at TT-relevant speeds). Used
 * to convert a "what if I had X more watts" input into an equivalent speed
 * gain — see applyBikePowerWhatIf. Treat as a rough estimate, same caveat
 * as riegelPredict. */
const BIKE_POWER_SPEED_EXPONENT = 1 / 3;

function paceSecondsPer100m(test: SwimTest): number {
  return (test.time_seconds / test.distance_m) * 100;
}

function paceSecondsPerKm(test: RunTest): number {
  return test.time_seconds / test.distance_km;
}

// ---- Swim ----

/** Resolves the swim effort to project from, per the selected prediction
 * mode. "personal_best" compares by pace rather than raw time since swim
 * tests aren't always run at the same distance. */
export function resolveSwimBasis(
  tests: SwimTest[],
  mode: PredictionMode,
  rollingWindow = DEFAULT_ROLLING_WINDOW
): SwimBasis | null {
  if (tests.length === 0) return null;
  const chronological = sortByDateAscending(tests);

  if (mode === "latest") {
    const latest = chronological[chronological.length - 1];
    return {
      mode,
      time_seconds: latest.time_seconds,
      distance_m: latest.distance_m,
      sourceTestDates: [latest.test_date],
    };
  }

  if (mode === "personal_best") {
    const best = tests.reduce((best, current) =>
      paceSecondsPer100m(current) < paceSecondsPer100m(best) ? current : best
    );
    return {
      mode,
      time_seconds: best.time_seconds,
      distance_m: best.distance_m,
      sourceTestDates: [best.test_date],
    };
  }

  // rolling_average: average pace over the last N tests, expressed against
  // a nominal 100m so the basis stays a valid (time, distance) pair for
  // riegelPredict.
  const recent = takeMostRecent(chronological, rollingWindow);
  const avgPace = average(recent.map(paceSecondsPer100m));
  if (avgPace === null) return null;
  return {
    mode,
    time_seconds: avgPace,
    distance_m: 100,
    sourceTestDates: recent.map((t) => t.test_date),
  };
}

export function projectSwimSplit(basis: SwimBasis, targetDistanceMeters: number): LegSplit {
  const time_seconds = Math.round(
    riegelPredict(basis.time_seconds, basis.distance_m, targetDistanceMeters)
  );
  return { distance: targetDistanceMeters, time_seconds };
}

/** Applied post-projection: "improve swim by 15 sec" reads most naturally
 * as shaving time off the predicted race split itself. */
export function applySwimWhatIf(split: LegSplit, improvementSeconds = 0): LegSplit {
  return { ...split, time_seconds: Math.max(0, split.time_seconds - improvementSeconds) };
}

// ---- Bike ----

export function resolveBikeBasis(
  tests: BikeTest[],
  mode: PredictionMode,
  rollingWindow = DEFAULT_ROLLING_WINDOW
): BikeBasis | null {
  const withSpeed = tests.filter(
    (t): t is BikeTest & { avg_speed_kmh: number } => t.avg_speed_kmh !== null
  );
  if (withSpeed.length === 0) return null;
  const chronological = sortByDateAscending(withSpeed);

  if (mode === "latest") {
    const latest = chronological[chronological.length - 1];
    return { mode, avg_speed_kmh: latest.avg_speed_kmh, sourceTestDates: [latest.test_date] };
  }

  if (mode === "personal_best") {
    const best = withSpeed.reduce((best, current) =>
      current.avg_speed_kmh > best.avg_speed_kmh ? current : best
    );
    return { mode, avg_speed_kmh: best.avg_speed_kmh, sourceTestDates: [best.test_date] };
  }

  const recent = takeMostRecent(chronological, rollingWindow);
  const avgSpeed = average(recent.map((t) => t.avg_speed_kmh));
  if (avgSpeed === null) return null;
  return { mode, avg_speed_kmh: avgSpeed, sourceTestDates: recent.map((t) => t.test_date) };
}

/** Constant-speed model: short/moderate multisport bike legs don't show the
 * same fatigue-with-distance curve running and swimming do (mirrors the
 * assumption already made in lib/analytics/race.analytics.ts). */
export function projectBikeSplit(basis: BikeBasis, targetDistanceKm: number): LegSplit {
  const time_seconds = Math.round((targetDistanceKm / basis.avg_speed_kmh) * 3600);
  return { distance: targetDistanceKm, time_seconds };
}

export function applyBikeSpeedWhatIf(basis: BikeBasis, speedKmhImprovement = 0): BikeBasis {
  return { ...basis, avg_speed_kmh: Math.max(0, basis.avg_speed_kmh + speedKmhImprovement) };
}

/** Converts a hypothetical power gain into an equivalent speed gain via
 * power ∝ speed^3. Requires a current power reading to establish the
 * athlete's own power-to-speed ratio; returns the basis unchanged (no-op)
 * if none is available, rather than guessing a ratio. */
export function applyBikePowerWhatIf(
  basis: BikeBasis,
  currentAvgPower: number | null,
  wattsImprovement = 0
): BikeBasis {
  if (!currentAvgPower || currentAvgPower <= 0 || wattsImprovement === 0) return basis;
  const newPower = currentAvgPower + wattsImprovement;
  const speedFactor = Math.pow(newPower / currentAvgPower, BIKE_POWER_SPEED_EXPONENT);
  return { ...basis, avg_speed_kmh: basis.avg_speed_kmh * speedFactor };
}

// ---- Run ----

export function resolveRunBasis(
  tests: RunTest[],
  mode: PredictionMode,
  rollingWindow = DEFAULT_ROLLING_WINDOW
): RunBasis | null {
  const withDistance = tests.filter((t) => t.distance_km > 0);
  if (withDistance.length === 0) return null;
  const chronological = sortByDateAscending(withDistance);

  if (mode === "latest") {
    const latest = chronological[chronological.length - 1];
    return {
      mode,
      time_seconds: latest.time_seconds,
      distance_km: latest.distance_km,
      sourceTestDates: [latest.test_date],
    };
  }

  if (mode === "personal_best") {
    const best = withDistance.reduce((best, current) =>
      paceSecondsPerKm(current) < paceSecondsPerKm(best) ? current : best
    );
    return {
      mode,
      time_seconds: best.time_seconds,
      distance_km: best.distance_km,
      sourceTestDates: [best.test_date],
    };
  }

  const recent = takeMostRecent(chronological, rollingWindow);
  const avgPace = average(recent.map(paceSecondsPerKm));
  if (avgPace === null) return null;
  return {
    mode,
    time_seconds: avgPace,
    distance_km: 1,
    sourceTestDates: recent.map((t) => t.test_date),
  };
}

export function projectRunSplit(basis: RunBasis, targetDistanceKm: number): LegSplit {
  const time_seconds = Math.round(
    riegelPredict(basis.time_seconds, basis.distance_km, targetDistanceKm)
  );
  return { distance: targetDistanceKm, time_seconds };
}

/** Applied pre-projection (on pace), unlike swim/bike what-ifs: pace is
 * the natural unit for "improve run pace by 5 sec/km", and applying it
 * before the Riegel projection lets the improvement scale correctly with
 * distance. */
export function applyRunWhatIf(basis: RunBasis, paceSecondsPerKmImprovement = 0): RunBasis {
  const improvedPace = Math.max(
    0,
    basis.time_seconds / basis.distance_km - paceSecondsPerKmImprovement
  );
  return { ...basis, time_seconds: improvedPace * basis.distance_km };
}
