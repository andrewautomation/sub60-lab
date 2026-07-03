# Test Plan — MVP v1.0

Manual test plan for a human to run before shipping, and again after any future change to auth, onboarding, or the test modules. Everything here was designed to be run by one person with one real email inbox and one Supabase project — no special tooling required beyond a browser and, optionally, the Supabase SQL editor to spot-check rows.

**Before you start:** run `supabase/migrations/20260703_test_modules_fields.sql` against your Supabase project. Nothing involving Bike, Run, or Swim's notes field will work until you do.

Each section lists **Steps**, **Expected result**, and — where it matters — **Edge cases** to also try. Check items off as you go; anything that fails belongs in `KNOWN_ISSUES.md`, not silently ignored.

---

## 1. Authentication

**Steps**
1. Go to `/register`, sign up with a real email you control and a password ≥6 characters.
2. Try registering again with an obviously invalid email (e.g. `not-an-email`) — confirm inline error, no page reload/`alert()`.
3. Check your inbox for the confirmation email; click the link.
4. Go to `/login` and try logging in *before* confirming (use a second test account, or catch the window before clicking the link) — confirm you see "Email not confirmed" inline.
5. After confirming, log in with the correct credentials.
6. Log out from the dashboard.
7. Go to `/forgot-password`, request a reset link for your account.
8. Click the emailed link, land on `/reset-password`, set a new password.
9. Log in with the new password.

**Expected result:** every step succeeds with inline feedback (no browser `alert()` anywhere), and step 9's login works with the newly-set password.

**Edge cases**
- Try `/dashboard`, `/dashboard/swim`, `/dashboard/goals`, `/dashboard/settings` while signed out — all should redirect to `/login` with no flash of real content.
- Try `/onboarding` while already fully onboarded — should redirect straight to `/dashboard`, not re-show the wizard.

---

## 2. Onboarding

**Steps**
1. As a brand-new confirmed account, log in — confirm you land on `/onboarding`, not `/dashboard`.
2. Step through Sport → Event → Profile → Goal → Review. Try leaving required fields blank at each step and confirm you can't advance without an inline error.
3. On the Profile step, enter an out-of-range height/weight (e.g. height 5) — confirm you get a *warning*, not a blocker (you can still proceed).
4. On the Goal step, pick a sport/event combination that has a predefined ladder (e.g. Triathlon → Super Sprint) — confirm you must pick a level to continue. Then separately test a sport/event with no ladder (e.g. Cycling → FTP Test) — confirm you can proceed without picking anything, with an explanatory message shown.
5. Midway through the wizard (after Profile, before Review), refresh the browser tab. Confirm you land back on the same step with your answers intact.
6. Complete Review and submit. Confirm the success screen appears, then redirect to `/dashboard`.
7. In the Supabase dashboard, confirm a row exists in `profiles` and (if you picked a goal level) `goals`.

**Expected result:** cannot skip a required field; draft persists across a refresh; final submit creates real rows; redirect to `/dashboard` with your real name showing.

---

## 3. Dashboard

**Steps**
1. Land on `/dashboard` right after onboarding with zero tests logged. Confirm all three sport cards show "No {sport} tests yet," all KPI cards show "—," and the Performance Engine section shows graceful "no data yet" messaging rather than blank space or an error.
2. Log 2-3 tests per sport (see sections 4-6 below), then return to `/dashboard`.
3. Confirm the Swim/Bike/Run KPI cards and cards under them now show real personal-best/latest values that match what you just logged.
4. Confirm the Performance Engine section shows Current Level, Goal Gap (if you set a goal), Race Prediction, Bottleneck, ROI, and Trend, all with non-placeholder values.
5. Resize the browser to a phone width (~375px). Confirm the header stacks vertically, the KPI/card grids collapse to fewer columns, and the sidebar becomes a full-width stacked menu rather than a squeezed narrow column.
6. Click every Sidebar link (Dashboard, Import, Swim, Bike, Run, Goals, Settings) — confirm none 404.

**Expected result:** every number on the dashboard traces back to a test you actually logged; no dead links; usable on a phone-width screen.

---

## 4-6. Swim / Bike / Run (run this same plan three times, once per sport)

**Steps**
1. From the dashboard card, click "New" — confirm you land on a real Add Test form (not a duplicate history table).
2. Submit with the date/type/distance/time fields blank — confirm inline errors block submission (no partial save).
3. Enter an implausible optional value (e.g. Avg HR = 300) — confirm a warning appears but you can still save.
4. Fill in a complete, realistic test and save. Confirm redirect to the module's history page and the new row appears immediately.
5. Click "Edit" on that row — confirm the form pre-fills with the exact values you entered, change one field, save, and confirm the change is reflected in the history list.
6. Click "Delete" — confirm a confirmation dialog appears before anything happens; confirm the deletion; confirm the row disappears and the dashboard's card/KPI update to match.
7. Log at least 2 tests, then check the PB / Average / Latest / Gap-to-Goal tiles at the top of the module page — confirm the numbers are sensible (PB is your fastest/best, Average is a plausible mean, Latest matches your most recent test's date).
8. Resize to phone width — confirm the history table becomes a stacked card list, and the Add/Edit form's fields stack into a single column.
9. Navigate to `/dashboard/{sport}/<a-uuid-that-does-not-exist>/edit` directly — confirm a graceful "Test not found" message, not a crash.

**Expected result:** full CRUD works, validation blocks bad input without blocking good input, mobile layout is usable, deleting requires confirmation.

---

## 7. CSV Import

**Steps**
1. Export a real activity CSV from Garmin Connect (or use a sample one covering Pool Swim, Cycling, and Running activities).
2. Drop the file on `/dashboard/import`. Confirm a "Parsing..." state appears briefly.
3. Confirm detected activities are grouped correctly by type (swim/bike/run) and any warnings (e.g. implausible HR) are shown per-row before saving.
4. Save one row individually, then use "Save All" for the rest. Confirm each row's status updates to "Saved" and errors (if any) show inline per row.
5. Navigate to the corresponding sport's history page and confirm the imported test appears there with the correct discipline-specific fields populated (e.g. `avg_cadence` for a bike ride, not left null when the CSV had a cadence column).
6. Try uploading a non-CSV file, or a CSV with no recognizable activities — confirm the "unsupported"/"empty" messages appear rather than a crash.

**Expected result:** imported data is indistinguishable from manually-entered data once saved — same tables, same pages, same analytics.

---

## 8. Goals

**Steps**
1. Navigate to `/dashboard/goals`. If you picked a goal during onboarding, confirm it displays correctly (level name/description or custom target, target date if set).
2. Click "Change Goal," pick a different level, optionally set a target date, save. Confirm the display updates immediately.
3. In Supabase, confirm the *old* goal row now has `status = 'abandoned'` and a *new* row exists with `status = 'active'` — goal history should never be silently overwritten.
4. If your primary event has no predefined ladder, confirm the page says so clearly rather than showing an empty/broken picker.

**Expected result:** goal changes are visible immediately and preserved as history in the database, not overwritten in place.

---

## 9. Performance Engine (as surfaced on the Dashboard)

**Steps**
1. With a goal set and at least 2-3 tests per relevant discipline, review the Performance Engine section on `/dashboard`.
2. Confirm Current Level shows a tier (Beginner/Intermediate/Advanced/Elite) and a 0-100 score per discipline your sport actually trains — a runner should never see a swim entry.
3. Confirm Goal Gap's explanation text makes sense relative to the number shown (e.g. "X faster than the goal" when the number is negative).
4. Confirm Race Prediction shows a real time for a triathlete, and for a Duathlon/Aquathlon athlete confirm it honestly says prediction isn't supported yet rather than showing a fabricated number.
5. Confirm Biggest Bottleneck and ROI by Discipline don't necessarily agree with each other — this is expected (see `ROADMAP.md`), not a bug, as long as each one's own reasoning is internally consistent with the Current Level scores shown.
6. Read the three reflection questions at the bottom — this is a manual/qualitative check: do they read as genuinely useful prompts for a real athlete, not filler text?

**Expected result:** every number is explainable by reading its accompanying text, no output silently contradicts the raw Current Level/test data shown elsewhere on the same page.

---

## 10. Settings

**Steps**
1. Navigate to `/dashboard/settings`. Confirm your current profile info is pre-filled correctly.
2. Change your name, clear a required field (e.g. first name), try to save — confirm inline error blocks it.
3. Fix it, save successfully — confirm a success message appears and the change persists after a page refresh.
4. In the password section, try a password under 6 characters — confirm inline error. Try mismatched confirm — confirm inline error.
5. Set a valid new password, save, log out, log back in with the new password.

**Expected result:** profile and password can each be updated independently, with their own success/error feedback, and changes survive a refresh/re-login.

---

## Deployment sanity check

1. `npx tsc --noEmit`, `npx eslint .`, `npm run build` all exit 0.
2. Confirm `.env.local` (or your deploy platform's env vars) has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` pointed at the correct project.
3. Confirm the migration in the "before you start" note has been applied to that same project.
4. Deploy, then re-run sections 1-3 of this plan (Auth, Onboarding, Dashboard) against the deployed URL, not just `localhost`.
