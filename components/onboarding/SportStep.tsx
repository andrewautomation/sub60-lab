"use client";

import { listSports } from "@/lib/sports/registry";
import { SportKey } from "@/lib/sports/types";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  updateData: (patch: Partial<OnboardingFormState>) => void;
  onNext: () => void;
}

export default function SportStep({ data, updateData, onNext }: Props) {
  const sports = listSports();

  function choose(sportKey: SportKey) {
    // Changing sport invalidates any previously chosen event for the old one.
    updateData({ primary_sport: sportKey, primary_event_key: null });
    onNext();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">What&apos;s your sport?</h1>
      <p className="text-slate-400 mb-8">
        This decides which events, equipment questions, and baseline tests we&apos;ll ask about next.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sports.map((sport) => (
          <button
            key={sport.key}
            onClick={() => choose(sport.key)}
            className={`rounded-2xl p-6 text-left transition ${
              data.primary_sport === sport.key
                ? "bg-cyan-500 text-black"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            <div className="text-3xl mb-3">{sport.emoji}</div>
            <div className="font-semibold">{sport.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
