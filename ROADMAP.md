# ROADMAP — MVP v1.0

**Mode: MVP. Scope frozen.** No new features, no architecture changes, no AI, no MCP, no new sports, no experimental systems. This document exists to finish the first usable version, not to expand it.

Audit performed 2026-07-03 by reading every route, hook, service, and lib module in the repo and confirming with `npx tsc --noEmit` and repo-wide `grep`. Every "Status" below is evidence-based, not estimated. See `MVP_CHECKLIST.md` for the release-blocker gate and `TECH_DEBT.md` for deferred items.

---

## Epic: Build Health

**Stories**
- ✅ App compiles (`npx tsc --noEmit` clean)
- ✅ App builds (`next build` succeeds)
- ✅ No dead imports to deleted modules

**Priority:** P0 — blocks everything else, including local dev of any other epic
**Status:** Complete (fixed 2026-07-03)

Root cause was a schema migration (old flat `athlete` shape → new normalized `profiles`/`goals`/`equipment`/`performance_profiles`) applied to `services/`, `types/athlete.ts`, and `lib/athlete/domain.ts`, but never finished in the consumers. Fix: `hooks/useOnboarding.ts`, `hooks/useDashboard.ts`, and `lib/validators/validateOnboarding.ts` were rewired onto `services/profile.service.ts` + `services/goal.service.ts` + the real `types/athlete.ts`/`types/goal.ts`. The dead, unfixable `hooks/useAthlete.ts` (zero real callers) and the Equipment/Baseline onboarding steps (referenced a `lib/sports/equipment.ts` that was never created) were deleted rather than repaired, since the new 4-step onboarding scope (Sport/Event/Profile/Goal) doesn't need them. Verified: `npx tsc --noEmit`, `npm run build`, and `npx eslint .` all clean.

---

## Epic: Authentication

**Stories**
- ✅ Sign up
- ✅ Log in
- ✅ Log out
- ✅ Forgot password
- ✅ Route protection (unauthenticated users can't reach `/dashboard/*`)
- ✅ Error handling
- ✅ Validation
- ✅ Works outside localhost

**Priority:** P0
**Status:** Complete (fixed 2026-07-03)

Sign up/log in/log out are real Supabase Auth calls (`services/auth.service.ts`, `app/login`, `app/register`). Fixes applied: `app/register/page.tsx` now builds its email-confirmation redirect from `window.location.origin` instead of a hardcoded `localhost:3000`. `app/forgot-password/page.tsx` is now a real form calling a new `resetPasswordForEmail` in `services/auth.service.ts`; a new `app/reset-password/page.tsx` handles the recovery-link landing and calls a new `updatePassword` to set the new password. Route protection moved from the inconsistent per-page checks into `app/dashboard/layout.tsx`, which gates the entire `/dashboard/*` subtree once (no session → `/login`; session but onboarding incomplete → `/onboarding`) — verified live with Playwright against the running dev server for `/dashboard`, `/dashboard/swim`, and `/onboarding`. `login`/`register` no longer use `alert()`; errors and success states render inline. Verified live against the real Supabase project: registration succeeds and shows the inline success message, an invalid email is rejected inline, and logging in with an unconfirmed account correctly shows "Email not confirmed."

**Known, deliberately deferred (see `TECH_DEBT.md`):** no `middleware.ts` (server-side protection) — the client-side layout gate is judged sufficient for a single/small-user MVP and avoids the larger architecture change of moving to cookie-based `@supabase/ssr` sessions, which this task's scope explicitly excludes ("do not redesign architecture").

---

## Epic: Athlete Profile / Onboarding

**Stories**
- ✅ Fix broken imports (Build Health epic)
- ✅ Sport + Event selection (already correct)
- ✅ Profile fields (first/last name, birth date, sex, height, weight, country)
- ✅ Goal creation writes to `goals` table (predefined ladder, per event)
- ✅ Review + submit writes real `profiles` (+ `goals`) rows
- ✅ Resume onboarding if interrupted
- ✅ Dashboard access gated on onboarding completion
- ☐ Edit profile after onboarding (Settings epic)
- ~~Baseline fields~~ / ~~Equipment fields~~ — dropped from scope per the 2026-07-03 MVP-freeze directive ("collect only the minimum required information"); the old steps were also unfixably broken (referenced a `lib/sports/equipment.ts` that never existed)

**Priority:** P0
**Status:** Complete (rebuilt 2026-07-03)

Rebuilt as a 4-step wizard — Sport → Event → Profile → Goal — plus a Review/confirm step, matching the explicit MVP-mode spec rather than the old 7-step (sport/event/profile/equipment/baseline/goal/review) flow. `GoalStep.tsx` now selects from the real curated ladder (`lib/goals/registry.ts`) for the chosen event, or shows a "no predefined goals yet" message and lets the user continue when the event has none (e.g. Cycling FTP Test) — it never collects free-text goal times anymore. Submit writes to the real `profiles` table (`upsertProfile`), the real `goals` table when a level was chosen (`createGoal`), then `markOnboardingComplete` — all through existing services, no new tables, no duplicated data. In-progress answers are persisted to `localStorage` (keyed per user id) after each step and restored on reload, so closing the tab mid-wizard doesn't lose progress; the draft is cleared only once the profile is actually saved. On mount, the wizard checks the session (→ `/login` if signed out) and existing profile (→ `/dashboard` if onboarding is already complete) before rendering. Verified end-to-end against the real Supabase project up through account creation; full wizard interaction and the post-confirmation login → onboarding → dashboard path still need a human with a real inbox to click the confirmation link (see manual testing checklist).

---

## Epic: Dashboard

**Stories**
- ✅ Fix broken imports (Build Health epic)
- ✅ Real athlete name header (matches current `Athlete` type)
- ✅ Swim KPI + card
- ✅ Bike KPI + card
- ✅ Run KPI + card
- ☐ Sprint Prediction KPI wired to `lib/race/prediction.ts`
- ☐ All Sidebar links resolve (`/races`, `/analytics`, `/goals`, `/settings` still 404 — `/bike`, `/run` now resolve as of Epic 2)

**Priority:** P1 (remaining items are polish, not blockers)
**Status:** Needs polish

Fixed 2026-07-03 (Epic 1 + Epic 2): `hooks/useDashboard.ts` now loads real swim/bike/run summaries via `lib/analytics/*` and `services/*.service.ts`; `app/dashboard/page.tsx` shows real name, and all three sport KPI cards + `DashboardCard`s show real personal-best/latest-test data once tests exist. Remaining gaps: the Sprint Prediction KPI is still a placeholder (`lib/race/prediction.ts` is written but not wired — deliberately out of scope for the Test Modules epic), and `Sidebar.tsx` still links to `/races`, `/analytics`, `/goals`, `/settings`, which don't exist yet (Goals/Settings epics, not started).

---

## Epic: Swim Module

**Stories**
- ✅ Add Test
- ✅ Edit Test
- ✅ Delete Test
- ✅ History
- ✅ Dashboard Card
- ✅ Analytics (PB, Average, Latest, Gap-to-goal, plus the pre-existing trend/performance-score)
- ✅ Progress Chart
- ✅ CSV Import
- ✅ Validation (manual entry + import path)
- ✅ Error Handling (manual entry + import path)

**Priority:** —
**Status:** Complete (fixed 2026-07-03)

`/dashboard/swim/new` is now a real Add Test form (`components/tests/TestForm.tsx`, config in `lib/tests/swimFields.ts`); `/dashboard/swim/[id]/edit` is new. `app/dashboard/swim/page.tsx` uses the shared `TestHistoryTable` for inline Edit/Delete (with confirm-before-delete and per-row error display) and `TestProgressChart` for the chart. `notes` field added (migration `20260703_test_modules_fields.sql`, not yet applied to the live DB — see manual testing checklist).

---

## Epic: Bike Module

**Stories**
- ✅ Add Test
- ✅ Edit Test
- ✅ Delete Test
- ✅ History
- ✅ Dashboard Card
- ✅ Analytics (PB by avg speed, Average speed, Latest, Gap-to-goal)
- ✅ Progress Chart
- ✅ CSV Import
- ✅ Validation
- ✅ Error Handling

**Priority:** —
**Status:** Complete (built 2026-07-03)

`app/dashboard/bike/page.tsx` (+`new`, +`[id]/edit`) built on the same shared `TestForm`/`TestHistoryTable`/`TestProgressChart` components as Swim, config in `lib/tests/bikeFields.ts`. Field set aligned to this epic's spec: `ftp`/`cadence` replaced with `max_power`/`avg_cadence` (+ `notes`) — old columns left in the DB, not dropped, and existing `cadence` data is backfilled into `avg_cadence` by the migration. `lib/analytics/bike.analytics.ts` is no longer dead code — `getBestSpeed`/`getAverageSpeed`/`getGapToTargetSpeed` now back both the Bike page and the main dashboard's Bike KPI/card.

---

## Epic: Run Module

**Stories**
- ✅ Add Test
- ✅ Edit Test
- ✅ Delete Test
- ✅ History
- ✅ Dashboard Card
- ✅ Analytics (PB by pace, Average pace, Latest, Gap-to-goal)
- ✅ Progress Chart
- ✅ CSV Import
- ✅ Validation
- ✅ Error Handling

**Priority:** —
**Status:** Complete (built 2026-07-03)

Same shape as Bike. `app/dashboard/run/page.tsx` (+`new`, +`[id]/edit`), config in `lib/tests/runFields.ts`. Field set aligned to spec: `threshold_pace`/`cadence` replaced with `avg_cadence`/`stride_length_m` (+ `notes`) — old columns left in place, `cadence` backfilled into `avg_cadence`. `lib/analytics/run.analytics.ts` is no longer dead code.

---

## Epic: CSV Import

**Stories**
- ✅ File upload (drag-and-drop + picker)
- ✅ Parse Garmin CSV
- ✅ Activity type detection (swim/bike/run)
- ✅ Per-discipline normalization
- ✅ Per-discipline validation
- ✅ Preview before save
- ✅ Save to correct table per discipline
- ✅ Error handling
- ☐ Edit a row's values before saving

**Priority:** P2 (only remaining gap is a nice-to-have)
**Status:** Complete

The best-built module in the app. Full pipeline: `CsvDropzone` → `useGarminImport` → `lib/parser/registry.ts` → `garminCsvParser.ts` (+ `activityDetector`, `csvParser`, `fieldUtils`) → discipline normalizer → discipline validator → `services/import.service.ts` → correct `insert*Test` per discipline. Already handles swim, bike, and run (not swim-only). Imported rows land in the same tables the module pages read from — confirmed no data-model mismatch. `ActivityPreviewCard` has real per-row `saving`/`saved`/`error` states. Only gap: no way to correct a misparsed value before saving, only accept-as-is or discard.

---

## Epic: Analytics

**Stories**
- ✅ Swim analytics computed + displayed
- ✅ Bike analytics computed + displayed
- ✅ Run analytics computed + displayed
- ☐ Race prediction computed + displayed

**Priority:** P2 — remaining item is a standalone Dashboard-epic task, not blocking
**Status:** Needs polish

Fixed 2026-07-03: `bike.analytics.ts` and `run.analytics.ts` now have real callers (the Bike/Run pages and the main dashboard). Added `getLatestTest` (shared.ts, generic across all three sports) and `getAverageSpeed` (bike); removed `getFTPTrend` (referenced a field no longer collected). The `lib/race/` prediction engine (`prediction.ts`, `score.ts`, `splits.ts`) is still unwired at the UI layer — but see the new Performance Engine below, which now wraps it.

---

## Epic: Performance Engine v1 (new, not in the original 10-module MVP list)

**Stories**
- ✅ Current Level (per-discipline 0-100 score + tier, weakest-link overall)
- ✅ Goal Gap (projected finish time vs. the athlete's own selected goal, not a generic default)
- ✅ Goal Confidence (new composite: gap 40% / momentum 25% / data quality 20% / pace-to-deadline 15%)
- ✅ Race Prediction (triathlon via `lib/race/prediction.ts`; single-discipline via Riegel)
- ✅ Biggest Bottleneck (largest %-shortfall vs. own target)
- ✅ ROI by Discipline (triathlon via `lib/race/prediction.ts` `getSensitivityAnalysis`; degenerate-but-honest for single-discipline)
- ✅ Trend (per-discipline + majority-vote overall)
- ☐ Wired into any UI (deliberately not done — built pure/headless per spec)
- ☐ "Performance Engine v1 (Preview)" framing + 3-question athlete feedback prompt

**Priority:** P2 — real product value once wired, but explicitly built with no UI/DB dependency this pass
**Status:** Complete (engine) / Not started (UI)

Built 2026-07-03 as `lib/performance-engine/` (`types.ts`, `targets.ts`, `trend.ts`, `currentLevel.ts`, `racePrediction.ts`, `goalGap.ts`, `bottleneck.ts`, `roi.ts`, `goalConfidence.ts`, `engine.ts`, `index.ts`) — pure functions, no Supabase/React imports, single entry point `runPerformanceEngine(input)`. Reuses the existing `lib/race/*` engine and `lib/analytics/*` wherever possible rather than re-deriving; only Goal Confidence's four-factor formula is genuinely new. Verified with a hand-traced synthetic-data smoke test (triathlete, single-discipline runner, duathlete, and a no-data athlete) — every number in the triathlete case was independently recomputed by hand and matched. Duathlon/Aquathlon are honestly marked `supported: false` for Race Prediction and ROI (no transition/pacing model exists for them yet) rather than producing a number from the wrong model.

**Bug found and fixed along the way:** `lib/sports/catalog.ts`'s `triathlonEvent()` helper never set the `raceFormat` field on triathlon events — `getPrimaryRaceFormat()` (in `lib/athlete/domain.ts`, itself unused until now) always returned `null` for every athlete, silently. This meant `lib/race/*`'s entire prediction/confidence/sensitivity engine — built and type-checked, but never actually exercised end-to-end before this — was unreachable for every triathlete in the app. Fixed as a one-line addition (`raceFormat: format`); this is why the smoke test's manual verification mattered enough to do by hand rather than trusting a clean `tsc` run.

**Explicit non-goals for v1 (per the request that specified this):** no UI page, no wiring into the dashboard, no database reads/writes, no test framework added (none exists in this repo; adding one — Vitest/Jest — is a real dependency/config decision, flagged here rather than assumed). Next natural step: a `/dashboard` "Performance Engine v1 (Preview)" card calling `runPerformanceEngine` with the athlete's real profile/goal/tests, plus the three-question athlete feedback prompt (is the race prediction realistic? do you agree with the bottleneck? would this change your training?) — feedback that should shape v2 more than any additional output would.

---

## Epic: Goals

**Stories**
- ✅ Set goal during onboarding (writes to `goals` table)
- ✅ View current goal
- ✅ Edit/change goal after onboarding

**Priority:** —
**Status:** Complete (fixed 2026-07-03)

`components/onboarding/GoalStep.tsx` selects from the real curated ladder and calls `createGoal` on submit (Epic 1). `/dashboard/goals` (`hooks/useGoals.ts`) now shows the current active goal and lets the athlete change it — the old goal is marked `abandoned`, a new one created `active`, so goal history is preserved rather than overwritten. Also exposed `target_date` in the UI for the first time (the DB column existed but nothing ever wrote to it before this). Still true: this epic's "Gap to Goal" analytics on the Swim/Bike/Run pages and main dashboard KPIs deliberately use the hardcoded `lib/analytics/targets.ts` defaults, not the athlete's actual goal — only the Performance Engine's Goal Gap output uses the real per-athlete goal (see `KNOWN_ISSUES.md` #5).

---

## Epic: Settings

**Stories**
- ✅ Edit profile (name, DOB, sex, height, weight, country)
- ☐ Edit equipment
- ✅ Change password
- ✅ Logout (already on dashboard)

**Priority:** —
**Status:** Complete for the MVP bar (fixed 2026-07-03)

`/dashboard/settings` (`hooks/useProfileSettings.ts`) covers profile edit (reusing `validateProfileStep`, the same validator onboarding uses) and password change (reusing `updatePassword`, the same call `/reset-password` uses) as two independently-submittable sections. Equipment editing remains deliberately absent — Equipment was dropped from onboarding's scope entirely in an earlier pass ("collect only the minimum required information"), so there's no equipment data to edit yet; adding it here without onboarding ever collecting it first would be inventing a new data-entry surface, not finishing an existing one.

---

## Implementation Order

Ordered so every step is small enough for one session, each step leaves the app in a working (not more-broken) state, and later steps build on earlier ones. Do not start a step out of order — most later steps assume the compile fix and real onboarding/dashboard data are already in place.

1. ✅ **Fix the build.** *(Done 2026-07-03.)* Callers repointed to `profile.service.ts` + `goal.service.ts`, which already existed and matched the new schema. `npx tsc --noEmit` is clean and `next build` succeeds.
2. ✅ **Fix onboarding end-to-end.** *(Done 2026-07-03 — rescoped.)* Rebuilt as Sport → Event → Profile → Goal → Review per the MVP-freeze directive (Equipment/Baseline steps dropped from scope, not just fixed). `useOnboarding.ts` now calls `upsertProfile` + `createGoal` + `markOnboardingComplete` directly. Verified live up through account creation against the real Supabase project; a human still needs to click a real confirmation email to verify the rest of the wizard interaction end-to-end (see `MANUAL_TESTING` checklist in the Authentication & Onboarding delivery notes).
3. ✅ **Fix the dashboard header.** *(Done 2026-07-03 — partially rescoped.)* `app/dashboard/page.tsx` now reads `first_name`/`last_name`. Pulling the athlete's active goal onto the header was intentionally left out — that's Goals-epic display work, not an Authentication/Onboarding fix — so the header currently shows name + primary event only, no goal/countdown.
4. ✅ **Build the Swim "Add Test" form.** *(Done 2026-07-03.)* `/dashboard/swim/new` is now a real form; edit/delete added too (a superset of the original step, bundled into the same Test Modules epic).
5. ✅ **Build the Bike module page.** *(Done 2026-07-03.)* `app/dashboard/bike/page.tsx` + `new` + `[id]/edit`, on the shared `TestForm`/`TestHistoryTable`/`TestProgressChart` components.
6. ✅ **Build the Run module page.** *(Done 2026-07-03.)* Same as step 5 for Run.
7. ✅ **Wire the dashboard's Race Prediction KPI.** *(Done 2026-07-03 — via the Performance Engine, not a direct `lib/race/prediction.ts` call.)* The stale "Sprint Prediction — Coming soon" KPI is now real, and a full "Performance Engine v1 (Preview)" section (Current Level, Goal Gap, Goal Confidence, Race Prediction, Bottleneck, ROI, Trend) was added below it.
8. ✅ **Build a minimal Goals page.** *(Done 2026-07-03.)* `/dashboard/goals` — view + change, goal history preserved.
9. ✅ **Build a minimal Settings page.** *(Done 2026-07-03 — equipment excluded, see this epic's notes above.)* `/dashboard/settings` — profile edit + password change.
10. ✅ **Clean up navigation.** *(Done 2026-07-03.)* `/races` and `/analytics` removed from `Sidebar.tsx` (map to no real module); every remaining link resolves.
11. ✅ **Auth hardening pass.** *(Done 2026-07-03 — Epic 1.)* Hardcoded redirect fixed, dashboard-wide session gating added, real forgot/reset-password flow built.

**Every step in this roadmap is now done.** The only remaining gate before real athletes can use this app is operational: applying the pending database migration to a live Supabase project (see `KNOWN_ISSUES.md` #1) and a human running the full auth flow with a real inbox (`KNOWN_ISSUES.md` #2). See `RELEASE_CHECKLIST.md`, `TEST_PLAN.md`, and `KNOWN_ISSUES.md` for the Release Candidate audit this roadmap fed into.
