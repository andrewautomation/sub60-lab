# SUB-60 Performance Lab — Architecture Blueprint

## Objective

Build a personal performance analysis system for Sprint Triathlon with focus on:

- Swim 400 m
- Bike 10 km
- Run 2.5 km
- Target: Sprint Triathlon < 60 minutes

The app is not a generic fitness tracker.
It is a race-specific performance system.

---

## Core Architecture

```
app/
  UI pages only.

components/
  Reusable UI components.

lib/
  Pure calculations and performance logic.

services/
  Supabase database communication.

hooks/
  Client-side data fetching and state logic.

types/
  Shared TypeScript types.

supabase/
  Database schema and migrations.
```

---

## Layer Responsibilities

### app/

Pages only.

Allowed:
- layout
- routing
- displaying components

Not allowed:
- direct Supabase queries
- performance calculations
- duplicated business logic

---

### services/

All database calls live here.

Examples:

- swim.service.ts
- bike.service.ts
- run.service.ts
- auth.service.ts

Pages should not call:

```ts
supabase.from(...)
```

directly.

---

### lib/performance/

Pure performance calculations.

Examples:

- swim.ts
- bike.ts
- run.ts
- race.ts

No Supabase.
No UI.
No React.

---

### hooks/

Hooks connect services + UI.

Examples:

- useSwimTests()
- useDashboard()
- useRacePrediction()

---

## Database Tables

### swim_tests

Stores swim test data.

Primary use:

- 400 m TT tracking
- SWOLF trends
- stroke rate
- efficiency

### bike_tests

Stores bike test data.

Primary use:

- 10 km TT
- FTP
- average power
- normalized power
- cadence

### run_tests

Stores run test data.

Primary use:

- 2.5 km TT
- 5 km TT
- threshold pace
- cadence

---

## Future Modules

### Garmin Import Engine

CSV upload → parse → validate → save to database.

### Race Prediction Engine

Uses latest/PB test data to estimate:

- swim split
- T1
- bike split
- T2
- run split
- total race time

### Analytics Engine

Calculates:

- PB
- average
- trend
- rate of improvement
- gap to target
- regression/prediction

### AI Coach / MCP

Future MCP access should read from database and performance engine, not raw scattered pages.

---

## Development Rule

Every new feature must answer:

- Where does the data live?
- Which service reads/writes it?
- Which performance function analyzes it?
- Which component displays it?
- Which page uses it?

No duplicated logic.
No direct Supabase calls inside pages unless temporary.
