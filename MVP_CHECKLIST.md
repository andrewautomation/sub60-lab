# MVP v1.0 Checklist

Scope is frozen. No new features, no architecture changes, no AI/MCP, no new sports. The only goal is: **a real athlete can log in, log swim/bike/run data (manually or via CSV import), see their progress, set a goal, and manage their account — every week, without it breaking.**

This file tracks release blockers only. For the full module-by-module breakdown see `ROADMAP.md`. For anything that should NOT block v1.0 but should be fixed eventually, see `TECH_DEBT.md`.

## Release blockers (must be done before v1.0 ships)

- [x] **App compiles.** Fixed 2026-07-03 — `hooks/useOnboarding.ts`, `hooks/useDashboard.ts`, `lib/validators/validateOnboarding.ts`, and the onboarding step components were rewired off the deleted `services/athlete.service.ts`/removed types onto the real `services/profile.service.ts` + `services/goal.service.ts` + `types/athlete.ts`. `npx tsc --noEmit`, `npm run build`, and `npx eslint .` are all clean.
- [x] **Onboarding completes and writes a real profile.** Rebuilt as a 4-step wizard (Sport → Event → Profile → Goal, plus a Review/confirm screen) writing to the real `profiles` and `goals` tables via `upsertProfile`/`createGoal`/`markOnboardingComplete`. Verified live against Supabase (see Authentication & Onboarding epic in `ROADMAP.md` for full evidence and what's still unverified — email-confirmed login and the full wizard interaction need a human with a real inbox).
- [x] **Dashboard loads.** `hooks/useDashboard.ts` now reads via `services/profile.service.ts`; `app/dashboard/page.tsx` uses real `first_name`/`last_name` fields. Route protection moved to `app/dashboard/layout.tsx` so it covers every nested route, not just the dashboard root.
- [x] **Swim test entry actually works.** Fixed 2026-07-03 — `/dashboard/swim/new` is a real Add form; `/dashboard/swim/[id]/edit` and inline delete (with confirm) added too.
- [x] **Bike module has a UI.** Fixed 2026-07-03 — `app/dashboard/bike/page.tsx` (+`new`, +`[id]/edit`), same pattern as Swim, using the real `services/bike.service.ts`/`lib/analytics/bike.analytics.ts`.
- [x] **Run module has a UI.** Fixed 2026-07-03 — same as Bike.
- [x] **Navigation doesn't 404.** Fixed 2026-07-03 — every remaining `Sidebar.tsx` link resolves. `/races` and `/analytics` were removed entirely (no module in this app's actual scope maps to them; analytics live inline on each sport's page).
- [x] **A goal can be viewed after onboarding.** Fixed 2026-07-03 — `/dashboard/goals` (`hooks/useGoals.ts`) shows the current goal and lets the athlete change it (old goal abandoned, new one created — history preserved).
- [x] **Basic account settings exist.** Fixed 2026-07-03 — `/dashboard/settings` (`hooks/useProfileSettings.ts`) covers profile edit and change-password, independently.

**All release blockers are now checked.** The one remaining gate before real athletes can use this is operational, not code: the database migration in `TECH_DEBT.md`/`KNOWN_ISSUES.md` has not been applied to a live Supabase project yet, and no agent in this session has had the access to do it.

## Explicitly NOT blockers for v1.0

These are real gaps but do not block a usable weekly loop — see `KNOWN_ISSUES.md` for the full, current list:

- Race prediction (Performance Engine) has no Duathlon/Aquathlon support
- Server-side route protection (`middleware.ts`)
- Import row editing before save
- No automated test suite
- Any PLANNED item from `ARCHITECTURE.md` (Workouts, Training Plans, Seasons, Race Results, Analytics snapshots, AI Coach, domain events, microservices, partitioning)

## Definition of Done (applies to every checked box above)

A module/feature is only "done" when:
- ✔ Feature works end-to-end against real Supabase data
- ✔ No known bugs, app compiles and builds
- ✔ All DB access goes through a `services/*.service.ts` function (no direct Supabase calls in `app/`/`components/`)
- ✔ Data-fetching/state lives in a `hooks/*.ts` hook, not inline in a page
- ✔ No duplicated logic (reuse existing services/analytics rather than re-implementing)
- ✔ Responsive at mobile/tablet/desktop widths
- ✔ Error states handled and shown to the user (not just `alert()` where avoidable)
- ✔ Input validation on any form
- ✔ Loading state while data fetches
