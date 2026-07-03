"use client";

import { useState } from "react";
import { getEventsForSport } from "@/lib/sports/registry";
import { validateEventStep } from "@/lib/validators/validateOnboarding";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function EventStep({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState<string | null>(null);

  if (!data.primary_sport) return null;
  const sport = data.primary_sport;
  const events = getEventsForSport(sport);

  function handleNext() {
    const result = validateEventStep(sport, data.primary_event_key);
    if (!result.ok) {
      setError(result.errors.primary_event_key);
      return;
    }
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Which event?</h1>
      <p className="text-slate-400 mb-8">Pick the distance you&apos;re training for.</p>

      <div className="space-y-3">
        {events.map((event) => {
          const selected = data.primary_event_key === event.key;
          return (
            <button
              key={event.key}
              onClick={() => {
                updateData({ primary_event_key: event.key });
                setError(null);
              }}
              className={`w-full text-left rounded-xl p-4 transition ${
                selected ? "bg-cyan-500 text-black font-semibold" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              <div className="font-semibold">{event.label}</div>
              <div className={`text-sm ${selected ? "text-black/70" : "text-slate-400"}`}>
                {event.legs
                  .map((leg) => `${leg.distance}${leg.discipline === "swim" ? "m" : "km"} ${leg.discipline}`)
                  .join(" · ")}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg bg-slate-800 px-4 py-2">
          Back
        </button>
        <button onClick={handleNext} className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
          Next
        </button>
      </div>
    </div>
  );
}
