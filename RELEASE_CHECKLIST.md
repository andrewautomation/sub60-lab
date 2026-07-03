# Release Checklist — MVP v1.0 Release Candidate

Audited 2026-07-03. Every module below is checked against the same 10 criteria used throughout this Release Candidate pass: (1) missing functionality, (2) bugs, (3) UX, (4) validation, (5) loading states, (6) empty states, (7) responsive layout, (8) duplicate code, (9) uses services/hooks, (10) deployable without errors.

## Ship gate (must all be true before this is a release candidate in practice, not just in code)

- [x] `npx tsc --noEmit` clean
- [x] `npx eslint .` clean (zero errors, zero warnings)
- [x] `npm run build` succeeds — all 19 routes compile (16 static, 3 dynamic `[id]/edit`)
- [x] No direct Supabase imports outside `services/*.service.ts` (verified by grep across `app/`, `components/`, `hooks/`)
- [x] No `alert()` calls anywhere in the UI
- [x] No dead/placeholder UI text ("Coming soon", "TBD", etc.) — verified by grep
- [x] No dead navigation links — `Sidebar.tsx` now only links to routes that exist
- [ ] **`supabase/migrations/20260703_test_modules_fields.sql` has been run against the live Supabase project.** This is the single biggest blocker to a working release — until it runs, every Add/Edit Test submission on Bike or Run fails with a Postgres "column does not exist" error, and Swim's `notes` field does too. See `KNOWN_ISSUES.md`.
- [ ] A real Supabase account has been used to click through Register → confirm email → Login → Onboarding → Dashboard once, by a human with real email access (the agent building this has no such access — see `TEST_PLAN.md`).

## Authentication

- [x] Sign up, log in, log out, forgot/reset password all call real Supabase Auth
- [x] Bug fixed: register's email-confirmation redirect no longer hardcodes `localhost:3000`
- [x] Bug fixed: `/reset-password` no longer imports the Supabase client directly — added `onPasswordRecovery`/reused `getSession` in `services/auth.service.ts`
- [x] Route protection centralized in `app/dashboard/layout.tsx` — covers every nested route, not just `/dashboard` root
- [x] Inline validation + error messages (no `alert()`), loading states on every submit button
- [x] Responsive (centered card layout, fluid width)
- [ ] Server-side (`middleware.ts`) protection — known, deliberate limitation (see `KNOWN_ISSUES.md`)

## Onboarding

- [x] 4-step wizard (Sport → Event → Profile → Goal) + Review, writes real `profiles`/`goals` rows
- [x] Resume-if-interrupted via `localStorage` draft, keyed per user
- [x] Validation on every step, loading state during session/profile bootstrap
- [x] Goal step gracefully handles events with no predefined ladder (skippable, not blocked)
- [x] Redirects both ways: signed-out → `/login`; already-onboarded → `/dashboard`
- [x] Responsive (single-column steps, `sm:grid-cols-2` where fields pair up)

## Dashboard

- [x] Real athlete name + primary event shown
- [x] Swim/Bike/Run KPI cards and history cards show real personal-best/latest data
- [x] Bug fixed: stale "Sprint Prediction — Coming soon" KPI replaced with a real Race Prediction value from the Performance Engine
- [x] Performance Engine v1 (Preview) section added — all 7 outputs rendered with graceful null/unsupported states
- [x] Loading state while profile/tests/goal/engine load
- [x] Responsive (`flex-col sm:flex-row` header, responsive KPI/card grids)
- [x] Sidebar dead links removed (`/races`, `/analytics` — no such modules in this app's scope); Sidebar width now responsive (`w-full md:w-64`)

## Swim / Bike / Run (identical shape, audited together)

- [x] Add / Edit / Delete all work, backed by `hooks/use{Swim,Bike,Run}Tests.ts` wrapping the corresponding service — no page calls a service or Supabase directly
- [x] History table (desktop) / card list (mobile) via shared `TestHistoryTable`
- [x] Analytics: PB, Average, Latest, Gap-to-Goal on every module page
- [x] Validation (manual-entry validators, distinct from the CSV-import validators) with inline errors + non-blocking range warnings
- [x] Delete requires confirmation, shows a per-row error if it fails
- [x] Empty states ("No {sport} tests yet — log one manually or import from Garmin.")
- [x] Loading states on initial fetch and on submit
- [x] Responsive (shared `TestForm`/`TestHistoryTable`/`TestProgressChart` components)
- [x] `notes` field present on all three (pending the migration above)

## Goals

- [x] View current active goal for the athlete's primary event (level name/description or custom target, target date + days-remaining if set)
- [x] Change goal — abandons the old one, creates a new active one (goal history preserved, not overwritten)
- [x] Empty state ("No goal set yet for this event")
- [x] Validation reuses `validateGoalStep` (the same rule onboarding uses — a ladder event requires a pick, others don't)
- [x] Target date field exposed for the first time (existing DB column, never had UI before this pass)
- [x] Loading state, responsive layout
- [x] Uses `hooks/useGoals.ts` wrapping `services/goal.service.ts` — no direct service/Supabase calls in the page

## CSV Import

- [x] Full pipeline unchanged and still correct after the Test Modules field renames (`avg_cadence`, `max_power`, `stride_length_m`, `notes`)
- [x] Parsing/empty/unsupported/per-row saving states all present
- [x] Responsive activity-type cards
- [x] Bug fixed this pass: header now wraps responsively on narrow screens (`flex-col sm:flex-row`)
- [ ] No way to correct a misparsed value before saving (known limitation, see `KNOWN_ISSUES.md`)

## Performance Engine

- [x] All 7 outputs (Current Level, Goal Gap, Goal Confidence, Race Prediction, Biggest Bottleneck, ROI by Discipline, Trend) implemented as pure functions in `lib/performance-engine/`
- [x] **Wired into the UI this pass** — a read-only "Performance Engine v1 (Preview)" section on the main dashboard, via `components/PerformanceEngineSection.tsx`
- [x] Every null/unsupported case shows the engine's own explanation string, not generic UI copy
- [x] Bug found and fixed during this work: `lib/sports/catalog.ts`'s `triathlonEvent()` never set `raceFormat`, so the entire triathlon prediction path was silently unreachable for every athlete until now
- [x] Loading state (part of the dashboard's own loading state), empty/no-data states handled gracefully
- [ ] No structured feedback collection for the 3 reflection questions (static text only — persisting responses needs a new table, out of scope for "no new concepts")

## Settings

- [x] Edit profile (first/last name, birth date, sex, height, weight, country) — reuses `validateProfileStep`, the same validator onboarding uses
- [x] Change password (reuses `services/auth.service.ts` `updatePassword`, same call `/reset-password` uses)
- [x] Loading, error, and success states on both forms independently
- [x] Responsive (`sm:grid-cols-2` field pairs, matches onboarding's ProfileStep layout)
- [x] Uses `hooks/useProfileSettings.ts` — no direct service/Supabase calls in the page
- [ ] No equipment editing — deliberately out of scope; Equipment/Baseline were explicitly dropped from onboarding's scope in an earlier pass ("collect only the minimum required information"), so there's nothing to edit here yet

## Cross-cutting fixes made during this pass

- Extracted `validatePassword` into `lib/validators/shared.ts`, used by both `/reset-password` and Settings — removed duplicated password-validation logic
- `lib/sports/catalog.ts` bug fix (see Performance Engine above) — this was silently broken since it was written; nothing had ever called the affected function until the Performance Engine did
