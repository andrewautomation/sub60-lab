"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import ErrorState from "@/components/ErrorState";
import { getEvent, getSport, parseEventId } from "@/lib/sports/registry";
import { getGoalLevelsForEvent } from "@/lib/goals/registry";
import { validateGoalStep } from "@/lib/validators/validateOnboarding";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";
import { formatDuration } from "@/lib/format/time";
import { daysUntilGoal, describeGoal } from "@/lib/athlete/domain";

export default function GoalsPage() {
  const { athlete, goal, loading, error: loadError, refresh, changeGoal, markGoalAchieved } = useGoals();
  const [editing, setEditing] = useState(false);
  const [levelKey, setLevelKey] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customTargetSeconds, setCustomTargetSeconds] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [achieving, setAchieving] = useState(false);
  const [achievedError, setAchievedError] = useState<string | null>(null);
  const [justAchievedLabel, setJustAchievedLabel] = useState<string | null>(null);

  if (loading) {
    return <p className="text-slate-400">Loading your goal...</p>;
  }

  if (loadError) {
    return <ErrorState message={`Couldn't load your goal: ${loadError}`} onRetry={refresh} />;
  }

  if (!athlete) {
    return <p className="text-slate-400">Could not load your profile.</p>;
  }

  const parsed = parseEventId(athlete.primary_event_id);
  const sport = getSport(athlete.primary_sport_id);
  const event = parsed ? getEvent(parsed.sportKey, parsed.eventKey) : null;
  const levels = getGoalLevelsForEvent(athlete.primary_event_id);
  const days = goal ? daysUntilGoal(goal) : null;

  function startEditing() {
    setLevelKey(goal?.level_key ?? null);
    setCustomMode(goal?.custom_target_value != null);
    setCustomTargetSeconds(goal?.custom_target_value ?? null);
    setCustomText(goal?.custom_target_value != null ? formatDuration(goal.custom_target_value) : "");
    setTargetDate(goal?.target_date ?? null);
    setError(null);
    setEditing(true);
  }

  function selectCustom() {
    setCustomMode(true);
    setLevelKey(null);
    setError(null);
  }

  function handleCustomTextChange(value: string) {
    setCustomText(value);
    const parsedSeconds = parseDurationToSeconds(value);
    setCustomTargetSeconds(parsedSeconds && parsedSeconds > 0 ? parsedSeconds : null);
    setError(null);
  }

  async function handleSave() {
    if (!parsed) return;

    const result = validateGoalStep(parsed.sportKey, parsed.eventKey, levelKey, customTargetSeconds);
    if (!result.ok) {
      setError(result.errors.goal_level_key);
      return;
    }

    setSaving(true);
    setError(null);
    const { error: saveError } = await changeGoal({
      level_key: levelKey,
      custom_target_value: levelKey ? null : customTargetSeconds,
      target_date: targetDate,
    });
    setSaving(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    setEditing(false);
  }

  async function handleMarkAchieved() {
    if (!goal) return;

    setAchieving(true);
    setAchievedError(null);
    const label = describeGoal(goal);
    const { error: achieveError } = await markGoalAchieved();
    setAchieving(false);

    if (achieveError) {
      setAchievedError(achieveError);
      return;
    }

    setJustAchievedLabel(label);
  }

  return (
    <div>
      <p className="text-cyan-400 tracking-[0.3em] text-sm">GOAL</p>
      <h1 className="text-4xl font-bold mt-2 mb-8">🎯 Your Goal</h1>

      <div className="max-w-2xl rounded-2xl bg-slate-900 p-6">
        <p className="text-slate-400 text-sm">
          {sport.emoji} {sport.label} — {event?.label ?? "—"}
        </p>

        {!editing && (
          <>
            {goal ? (
              <div className="mt-4 space-y-2">
                <p className="text-3xl font-bold">{describeGoal(goal)}</p>
                {goal.target_date && (
                  <p className="text-slate-400">
                    Target date: {goal.target_date}
                    {days !== null && days >= 0 && ` · ${days} day${days === 1 ? "" : "s"} to go`}
                    {days !== null && days < 0 && " · date has passed"}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {justAchievedLabel ? (
                  <p className="text-emerald-400">🏆 Achieved: {justAchievedLabel} — set your next goal below.</p>
                ) : (
                  <p className="text-slate-400">No goal set yet for this event.</p>
                )}
              </div>
            )}

            {achievedError && <p className="mt-2 text-sm text-red-400">{achievedError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={startEditing}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
              >
                {goal ? "Change Goal" : "Set a Goal"}
              </button>

              {goal && (
                <button
                  onClick={handleMarkAchieved}
                  disabled={achieving}
                  className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700 disabled:opacity-60"
                >
                  {achieving ? "Saving..." : "🏆 Mark as Achieved"}
                </button>
              )}
            </div>
          </>
        )}

        {editing && (
          <div className="mt-6">
            <div className="space-y-3">
              {levels.map((level) => {
                const selected = !customMode && levelKey === level.key;
                return (
                  <button
                    key={level.key}
                    onClick={() => {
                      setCustomMode(false);
                      setCustomText("");
                      setCustomTargetSeconds(null);
                      setLevelKey(level.key);
                      setError(null);
                    }}
                    className={`w-full text-left rounded-xl p-4 transition ${
                      selected ? "bg-cyan-500 text-black font-semibold" : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    <div className="font-semibold">{level.display_name}</div>
                    <div className={`text-sm ${selected ? "text-black/70" : "text-slate-400"}`}>
                      {level.description}
                    </div>
                  </button>
                );
              })}

              <button
                onClick={selectCustom}
                className={`w-full text-left rounded-xl p-4 transition ${
                  customMode ? "bg-cyan-500 text-black font-semibold" : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <div className="font-semibold">Custom</div>
                <div className={`text-sm ${customMode ? "text-black/70" : "text-slate-400"}`}>
                  Set your own target time.
                </div>
              </button>

              {customMode && (
                <input
                  type="text"
                  autoFocus
                  value={customText}
                  onChange={(e) => handleCustomTextChange(e.target.value)}
                  placeholder="H:MM:SS"
                  className="w-full rounded-xl bg-slate-700 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm text-slate-400 mb-2">Target date (optional)</label>
              <input
                type="date"
                className="rounded-lg p-3 bg-slate-800"
                value={targetDate ?? ""}
                onChange={(e) => setTargetDate(e.target.value || null)}
              />
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-6 py-2 text-black font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
