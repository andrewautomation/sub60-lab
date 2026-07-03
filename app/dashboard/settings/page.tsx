"use client";

import { useState } from "react";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { usePerformanceBenchmarks } from "@/hooks/usePerformanceBenchmarks";
import { validateProfileStep } from "@/lib/validators/validateOnboarding";
import { validatePassword } from "@/lib/validators/shared";
import { BENCHMARK_FIELDS_BY_SPORT } from "@/lib/benchmarks/fields";
import { parseDurationToSeconds } from "@/lib/parser/fieldUtils";
import { formatDuration } from "@/lib/format/time";
import ErrorState from "@/components/ErrorState";
import { Sex } from "@/types/athlete";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  sex: Sex;
  height_cm: number | null;
  weight_kg: number | null;
  country: string | null;
}

export default function SettingsPage() {
  const { athlete, loading, error, retry, saveProfile, changePassword } = useProfileSettings();
  const { benchmarks, loading: benchmarksLoading, save: saveBenchmarks } = usePerformanceBenchmarks();

  const [profileValues, setProfileValues] = useState<ProfileFormValues | null>(null);
  const [benchmarkValues, setBenchmarkValues] = useState<Record<string, number | null> | null>(null);
  const [benchmarkDurationText, setBenchmarkDurationText] = useState<Record<string, string>>({});
  const [benchmarksSeeded, setBenchmarksSeeded] = useState(false);
  const [savingBenchmarks, setSavingBenchmarks] = useState(false);
  const [benchmarksSaved, setBenchmarksSaved] = useState(false);
  const [benchmarksError, setBenchmarksError] = useState<string | null>(null);
  const [seededId, setSeededId] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileWarnings, setProfileWarnings] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Seed the editable copy once the profile loads — a render-time state
  // adjustment (React's documented pattern), not an effect.
  if (athlete && athlete.id !== seededId) {
    setSeededId(athlete.id);
    setProfileValues({
      first_name: athlete.first_name,
      last_name: athlete.last_name,
      birth_date: athlete.birth_date,
      sex: athlete.sex,
      height_cm: athlete.height_cm,
      weight_kg: athlete.weight_kg,
      country: athlete.country,
    });
  }

  // Same render-time seeding pattern as the profile form above, gated on
  // the benchmarks fetch finishing rather than an id (a fresh athlete
  // legitimately has no performance_profiles row yet).
  if (athlete && !benchmarksLoading && !benchmarksSeeded) {
    setBenchmarksSeeded(true);
    const fields = BENCHMARK_FIELDS_BY_SPORT[athlete.primary_sport_id];
    setBenchmarkValues(
      Object.fromEntries(fields.map((f) => [f.key, (benchmarks?.[f.key] as number | null) ?? null]))
    );
  }

  function updateBenchmarkValue(key: string, value: number | null) {
    setBenchmarkValues((current) => (current ? { ...current, [key]: value } : current));
    setBenchmarksSaved(false);
  }

  async function handleSaveBenchmarks() {
    if (!benchmarkValues) return;

    setSavingBenchmarks(true);
    setBenchmarksError(null);
    const { error } = await saveBenchmarks(benchmarkValues);
    setSavingBenchmarks(false);

    if (error) {
      setBenchmarksError(error);
      return;
    }
    setBenchmarksSaved(true);
  }

  function updateProfileValue<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setProfileValues((current) => (current ? { ...current, [key]: value } : current));
    setProfileSaved(false);
  }

  async function handleSaveProfile() {
    if (!profileValues) return;

    const result = validateProfileStep(profileValues);
    setProfileErrors(result.errors);
    setProfileWarnings(result.warnings);
    if (!result.ok) return;

    setSavingProfile(true);
    setProfileError(null);
    const { error } = await saveProfile(profileValues);
    setSavingProfile(false);

    if (error) {
      setProfileError(error);
      return;
    }
    setProfileSaved(true);
  }

  async function handleChangePassword() {
    const validation = validatePassword(newPassword, confirmPassword);
    if (!validation.ok) {
      setPasswordError(validation.error);
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    const { error } = await changePassword(newPassword);
    setSavingPassword(false);

    if (error) {
      setPasswordError(error);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
  }

  if (loading) {
    return <p className="text-slate-400">Loading your settings...</p>;
  }

  if (error) {
    return <ErrorState message={`Couldn't load your settings: ${error}`} onRetry={retry} />;
  }

  if (!athlete || !profileValues) {
    return <p className="text-slate-400">Could not load your profile.</p>;
  }

  return (
    <div>
      <p className="text-cyan-400 tracking-[0.3em] text-sm">SETTINGS</p>
      <h1 className="text-4xl font-bold mt-2 mb-8">⚙ Settings</h1>

      <div className="max-w-2xl space-y-8">
        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  className="w-full rounded-lg p-3 bg-slate-800"
                  placeholder="First name"
                  value={profileValues.first_name}
                  onChange={(e) => updateProfileValue("first_name", e.target.value)}
                />
                {profileErrors.first_name && <p className="mt-1 text-sm text-red-400">{profileErrors.first_name}</p>}
              </div>
              <div>
                <input
                  className="w-full rounded-lg p-3 bg-slate-800"
                  placeholder="Last name"
                  value={profileValues.last_name}
                  onChange={(e) => updateProfileValue("last_name", e.target.value)}
                />
                {profileErrors.last_name && <p className="mt-1 text-sm text-red-400">{profileErrors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  className="w-full rounded-lg p-3 bg-slate-800"
                  value={profileValues.birth_date ?? ""}
                  onChange={(e) => updateProfileValue("birth_date", e.target.value || null)}
                />
                {profileErrors.birth_date && <p className="mt-1 text-sm text-red-400">{profileErrors.birth_date}</p>}
              </div>

              <select
                className="w-full rounded-lg p-3 bg-slate-800"
                value={profileValues.sex}
                onChange={(e) => updateProfileValue("sex", e.target.value as Sex)}
              >
                {SEX_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  className="w-full rounded-lg p-3 bg-slate-800"
                  placeholder="Height (cm)"
                  value={profileValues.height_cm ?? ""}
                  onChange={(e) => updateProfileValue("height_cm", e.target.value ? Number(e.target.value) : null)}
                />
                {profileWarnings.height_cm && <p className="mt-1 text-sm text-amber-400">{profileWarnings.height_cm}</p>}
              </div>
              <div>
                <input
                  type="number"
                  className="w-full rounded-lg p-3 bg-slate-800"
                  placeholder="Weight (kg)"
                  value={profileValues.weight_kg ?? ""}
                  onChange={(e) => updateProfileValue("weight_kg", e.target.value ? Number(e.target.value) : null)}
                />
                {profileWarnings.weight_kg && <p className="mt-1 text-sm text-amber-400">{profileWarnings.weight_kg}</p>}
              </div>
            </div>

            <div>
              <input
                className="w-full rounded-lg p-3 bg-slate-800"
                placeholder="Country"
                value={profileValues.country ?? ""}
                onChange={(e) => updateProfileValue("country", e.target.value || null)}
              />
              {profileErrors.country && <p className="mt-1 text-sm text-red-400">{profileErrors.country}</p>}
            </div>
          </div>

          {profileError && <p className="mt-4 text-sm text-red-400">{profileError}</p>}
          {profileSaved && !profileError && <p className="mt-4 text-sm text-emerald-400">Profile saved.</p>}

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="mt-6 rounded-lg bg-cyan-500 px-6 py-2 text-black font-semibold disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold mb-2">Performance Benchmarks</h2>
          <p className="text-sm text-slate-400 mb-6">
            Optional standard-distance/format times — powers the estimated ranking badge on your dashboard.
          </p>

          {!benchmarkValues ? (
            <p className="text-slate-400">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BENCHMARK_FIELDS_BY_SPORT[athlete.primary_sport_id].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
                    {field.type === "watts" ? (
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 250"
                        className="w-full rounded-lg p-3 bg-slate-800"
                        value={benchmarkValues[field.key] ?? ""}
                        onChange={(e) =>
                          updateBenchmarkValue(field.key, e.target.value === "" ? null : Number(e.target.value))
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="H:MM:SS"
                        className="w-full rounded-lg p-3 bg-slate-800"
                        value={
                          benchmarkDurationText[field.key] ??
                          (benchmarkValues[field.key] != null ? formatDuration(benchmarkValues[field.key] as number) : "")
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBenchmarkDurationText((current) => ({ ...current, [field.key]: value }));
                          const parsed = parseDurationToSeconds(value);
                          updateBenchmarkValue(field.key, parsed && parsed > 0 ? parsed : null);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {benchmarksError && <p className="mt-4 text-sm text-red-400">{benchmarksError}</p>}
              {benchmarksSaved && !benchmarksError && <p className="mt-4 text-sm text-emerald-400">Benchmarks saved.</p>}

              <button
                onClick={handleSaveBenchmarks}
                disabled={savingBenchmarks}
                className="mt-6 rounded-lg bg-cyan-500 px-6 py-2 text-black font-semibold disabled:opacity-60"
              >
                {savingBenchmarks ? "Saving..." : "Save Benchmarks"}
              </button>
            </>
          )}
        </section>

        <section className="rounded-2xl bg-slate-900 p-6">
          <h2 className="text-2xl font-bold mb-6">Change Password</h2>

          <div className="space-y-4">
            <input
              type="password"
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordSaved(false);
              }}
              autoComplete="new-password"
            />
            <input
              type="password"
              className="w-full rounded-lg p-3 bg-slate-800"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordSaved(false);
              }}
              autoComplete="new-password"
            />
          </div>

          {passwordError && <p className="mt-4 text-sm text-red-400">{passwordError}</p>}
          {passwordSaved && !passwordError && <p className="mt-4 text-sm text-emerald-400">Password updated.</p>}

          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="mt-6 rounded-lg bg-cyan-500 px-6 py-2 text-black font-semibold disabled:opacity-60"
          >
            {savingPassword ? "Saving..." : "Update Password"}
          </button>
        </section>
      </div>
    </div>
  );
}
