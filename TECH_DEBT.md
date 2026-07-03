# Tech Debt — Deferred Until After MVP v1.0

Everything here is a real, confirmed gap, but none of it blocks a real athlete from using the app every week. Do not work on these until every item in `MVP_CHECKLIST.md` is checked off. Re-evaluate this list after v1.0 ships — some items may get promoted, most should stay deferred per the MVP-first mandate.

## Deferred features

- **Race prediction UI polish** — `lib/race/prediction.ts` (Riegel projections, confidence scoring, sensitivity analysis, "biggest opportunity") has more surface area than just the dashboard's single KPI number (`getSensitivityAnalysis`, `getBiggestOpportunity`). A dedicated prediction breakdown view is a real future feature, not MVP.
- ~~**Edit/delete for swim, bike, run tests**~~ — fixed 2026-07-03: all three modules now support Edit and Delete via the shared `TestHistoryTable` component.
- **Edit CSV import rows before saving** — `ActivityPreviewCard` only supports save-as-is or discard, no inline correction of a misparsed value.
- **Gap-to-goal uses hardcoded defaults, not the athlete's real goal** — Swim/Bike/Run "Gap to Goal" (and the old Swim performance score) compare against `lib/analytics/targets.ts`'s fixed Sub-60 targets, not the athlete's actual `goals` row from onboarding. Wiring real per-athlete goals in is Goals-epic work (mapping a whole-race goal like "Sub-60 Triathlon" down to a swim/bike/run split target isn't a simple 1:1 lookup), not Test Modules.
- ~~**Forgot password**~~ — fixed 2026-07-03: `/forgot-password` and a new `/reset-password` now do a real Supabase recovery flow end-to-end.
- **Server-side route protection (`middleware.ts`)** — fixed 2026-07-03 to the extent possible without a bigger change: protection now lives in `app/dashboard/layout.tsx`, one client-side gate covering the whole `/dashboard/*` subtree instead of inconsistent per-page checks. It's still client-side, not server-side (`middleware.ts` would require moving off the current browser-only `@supabase/supabase-js` client onto `@supabase/ssr`'s cookie-based session handling — a real architecture change, out of scope for the MVP freeze). RLS prevents actual data leakage either way; this only affects whether a signed-out user briefly sees a loading page before the redirect fires.
- ~~**Responsive/collapsible sidebar**~~ — partially fixed 2026-07-03: `Sidebar.tsx` now spans full width on mobile (`w-full md:w-64`) instead of staying a cramped fixed 256px column. Still not a collapsible drawer/hamburger menu — full-width-stacked is a reasonable v1 bar, a proper collapse is still deferred.
- **Password/account settings beyond the basics** — 2FA, email change, account deletion, notification preferences. Basic profile edit and password change now exist (`/dashboard/settings`, built 2026-07-03); equipment editing remains deferred since Equipment was dropped from onboarding's scope entirely, not just from Settings. Everything in this bullet is genuinely post-v1.

## Architecture-level PLANNED items (explicitly out of scope per MVP freeze)

Per `ARCHITECTURE.md`, all of the following are documented future direction, not current work. Do not start any of these during MVP mode regardless of how "clean" they'd make the codebase:

- Unified `performance_records` table replacing `swim_tests`/`bike_tests`/`run_tests`
- Workouts, Training Plans, Seasons/Training Blocks
- Race Results module (distinct from Goals/PerformanceRecords)
- Analytics snapshot table + background recompute jobs
- Generalized (multi-sport) Prediction Engine
- AI Coach and its "never reads raw tables" boundary
- Domain events / outbox pattern
- Additional integrations beyond manual Garmin CSV (Strava, TrainingPeaks, Wahoo, etc.)
- Any microservice extraction
- Partitioning, read replicas, multi-region, connection pooling — none of this matters at single-athlete-to-small-user-base scale

## Code hygiene (low priority, batch whenever touching the relevant file anyway)

- ~~`lib/analytics/bike.analytics.ts` and `lib/analytics/run.analytics.ts` are dead code~~ — fixed 2026-07-03: both now have real callers (Bike/Run pages + main dashboard).
- `services/performanceProfile.service.ts` is currently unused — no baseline-editing surface exists yet (would live in a future Settings/onboarding-baseline feature, which is out of scope per the MVP freeze — baselines were explicitly dropped from onboarding in Epic 1).
- Legacy DB columns `bike_tests.ftp`, `bike_tests.cadence`, `run_tests.cadence`, `run_tests.threshold_pace` are superseded by `max_power`/`avg_cadence`/`avg_cadence`/(dropped) as of the Test Modules epic (2026-07-03) but were left in place rather than dropped, to avoid a destructive migration. Safe to drop in a later cleanup migration once confirmed nothing reads them (grep shows nothing does as of this writing).

## Action required before Test Modules (Epic 2, 2026-07-03) actually works

- **Run `supabase/migrations/20260703_test_modules_fields.sql` against the live Supabase project.** It adds `notes` (all three tables), `max_power`/`avg_cadence` (bike), `avg_cadence`/`stride_length_m` (run), and backfills `avg_cadence` from the old `cadence` column. Until this runs, every Add/Edit Test submission will fail with a Postgres "column does not exist" error — this could not be applied by the agent building this feature (no Supabase CLI/service-role access in this environment), so it's a manual step. See the manual testing checklist delivered with this epic.
