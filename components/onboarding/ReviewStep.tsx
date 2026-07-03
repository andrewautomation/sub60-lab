"use client";

import { getEvent, getSport } from "@/lib/sports/registry";
import { getGoalLevel } from "@/lib/goals/registry";
import { eventId } from "@/lib/sports/registry";
import { OnboardingFormState } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingFormState;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function ReviewStep({ data, onBack, onSubmit, submitting, submitError, submitSuccess }: Props) {
  if (!data.primary_sport || !data.primary_event_key) return null;

  const sport = getSport(data.primary_sport);
  const event = getEvent(data.primary_sport, data.primary_event_key);
  const goalLevel = data.goal_level_key
    ? getGoalLevel(eventId(data.primary_sport, data.primary_event_key), data.goal_level_key)
    : null;

  if (submitSuccess) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re all set!</h1>
        <p className="text-slate-400">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Review</h1>
      <p className="text-slate-400 mb-8">Confirm before we set up your dashboard.</p>

      <div className="space-y-4 rounded-2xl bg-slate-900 p-6">
        <Row label="Name" value={`${data.first_name} ${data.last_name}`.trim() || "—"} />
        <Row label="Sport" value={`${sport.emoji} ${sport.label}`} />
        <Row label="Event" value={event?.label ?? "—"} />
        <Row label="Country" value={data.country ?? "—"} />
        <Row label="Goal" value={goalLevel?.display_name ?? "Not set"} />
      </div>

      {submitError && <p className="mt-4 text-sm text-red-400">{submitError}</p>}

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} disabled={submitting} className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-60">
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="rounded-lg bg-cyan-500 px-6 py-2 text-black font-semibold disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Finish setup"}
        </button>
      </div>
    </div>
  );
}
