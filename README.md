# Susi Air Pilot App

A small, mobile-first web app for pilots. A pilot signs in, sees flight hours against regulatory limits, checks document expiry, and views a monthly duty schedule.

- `nest/`: NestJS API (TypeScript). Loads three JSON data files into memory.
- `nuxt/`: Nuxt 3 app (Pinia, SCSS).

## 1. Overview and live URLs

| App | URL |
|---|---|
| Frontend (Vercel) | https://susiair-pilot-app.vercel.app |
| Backend (Render) | https://susiair-pilot-app.onrender.com |

The backend runs on a free tier that sleeps when idle. The first request after a pause can take 30–60 seconds; the app shows loading skeletons meanwhile.

Screens:
- **Sign In**: username and password, loading state, clear error messages.
- **Home**: greeting and total flight hours, four limit cards (daily, weekly, monthly, annual), a rolling-sum chart with `1w | 1m | 3m | 6m | 1y`, and the pilot's documents with their status.
- **Schedule**: monthly calendar with duty colors, a logged/remaining indicator per day, and the legend. Tapping a date opens a placeholder detail page.
- **Logbook** and **More**: "Coming soon" placeholders so the bottom navigation never leads to a 404.

API (all routes except `/auth/login` and `/health` need `Authorization: Bearer <token>`):

| Method | Path | Returns |
|---|---|---|
| POST | `/auth/login` | `{ accessToken, tokenType, expiresIn }` |
| GET | `/health` | `{ status: "ok" }` |
| GET | `/pilot/me` | `{ name, totalFlightHours, avatarUrl, asOf }` |
| GET | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | daily hours, zero-filled, max 400 days |
| GET | `/flight-hours/summary?range=1w\|1m\|3m\|6m\|1y` | 15 chart points, limit, Y max, four limit cards |
| GET | `/documents` | documents with `daysRemaining` and `status` |
| GET | `/schedules?year=YYYY&month=MM` | days of the month and the legend (`month` is 1–12, with or without a leading zero) |

Every error uses one shape:

```json
{ "statusCode": 401, "error": "Unauthorized", "message": "Invalid username or password", "path": "/auth/login", "timestamp": "..." }
```

## 2. Run locally

Requirements: Node.js 22 (22.12 or newer; developed on 22.15) and npm 10 or newer.

Backend (http://localhost:3000):

```bash
cd nest
npm ci
cp .env.example .env
npm run start:dev
```

On Windows PowerShell use `Copy-Item .env.example .env` instead of `cp`. Set a long random `JWT_SECRET` in `.env`.

Frontend (http://localhost:3001), in a second terminal:

```bash
cd nuxt
npm ci
npm run dev
```

The frontend calls `http://localhost:3000` by default, so it needs no `.env` locally.

Checks:

| App | Commands |
|---|---|
| nest | `npm run build` · `npm run lint` · `npm test` · `npm run test:e2e` |
| nuxt | `npm run build` · `npm run lint` · `npm run typecheck` |

Production run of the backend: `npm run build`, then `node dist/main.js` from `nest/` (the JSON files are copied to `dist/data/` by the build).

### Deployment

Backend on Render (Web Service):
- Root directory: `nest`
- Build command: `npm ci && npm run build`
- Start command: `node dist/main.js`
- Health check path: `/health`
- Environment: `JWT_SECRET`, `APP_TODAY=2026-05-15`, `CORS_ORIGIN=<frontend URL>`. Render sets `PORT`. Add `NODE_VERSION=22`.

Frontend on Vercel:
- Root directory: `nuxt`
- Environment: `NUXT_PUBLIC_API_BASE=<backend URL>`
- Node.js version 22 in the project settings.

`CORS_ORIGIN` must match the frontend origin exactly (scheme and host, no trailing slash). Several origins can be given as a comma-separated list, for example a preview URL next to the production URL.

## 3. Environment variables

Backend (`nest/.env.example`):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | no | `3000` | HTTP port (set by the host in production) |
| `JWT_SECRET` | yes | – | Secret used to sign tokens. Startup fails without it |
| `APP_TODAY` | no | `2026-05-15` | The app's fixed "today" (`YYYY-MM-DD`). Startup fails on an invalid date |
| `CORS_ORIGIN` | yes in production | – | Allowed browser origins, comma-separated |

```env
PORT=3000
JWT_SECRET=change-me-to-a-long-random-string
APP_TODAY=2026-05-15
CORS_ORIGIN=http://localhost:3001
```

Frontend (`nuxt/.env.example`):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NUXT_PUBLIC_API_BASE` | yes in production | `http://localhost:3000` | Base URL of the API |

```env
NUXT_PUBLIC_API_BASE=http://localhost:3000
```

## 4. Test credentials

| Username | Password |
|---|---|
| `johndoe` | `susiairtest` |

## 5. Main choices and why

- **Fixed "today".** Today is 2026-05-15, read from `APP_TODAY` by a single `ClockService`, and returned by the API as `asOf`. The frontend never uses the browser's clock; it takes the default month from `asOf`, and the greeting does not depend on the time of day. Dates are `YYYY-MM-DD` strings handled in UTC.
- **Rolling sum window.** For day `d` and window size N, the sum covers the N days ending on `d`, both ends included (`[d − N + 1, d]`). Windows: 1w = 7, 1m = 30, 3m = 90, 6m = 180, 1y = 365 days. It uses prefix sums, so it stays fast.
- **Zero-fill.** A day without a record counts as 0 hours, so no date is ever skipped.
- **Before the dataset starts.** Days before the first record (2024-12-27) count as 0, so the window simply extends into empty days.
- **Future dates.** The chart shows today − 7 to today + 7. Future days use the data when it has them and 0 when it does not, and are always marked `isFuture` and drawn lighter and dashed.
- **Document status on the server.** The API computes `safe`, `soon`, or `expired` from the expiry date and the threshold in the data (30 days); the frontend only displays it. A document that expires today counts as `expired`, following the rule written in the data file.
- **Total flight hours.** This value comes from the pilot profile in the data and covers records up to 31 May 2026; the sum up to today (15 May 2026) is 1385.4.
- **Avatar.** The data has no avatar, so the API returns a placeholder path served by the frontend. In production this would be the pilot's real profile image URL.
- **Schedule.** Duty codes in the data (DTY, RLV, TRD, TRX, ULV) are mapped once at startup to DUTY, RL, TR, TX, UL. Each day is colored with its `baseColor`, shows a tick or the remaining count, and shows its base code (`baseName`) in small type under the date.
- **SVG chart.** A small custom SVG instead of a chart library: only 15 points are needed, and it gives full control over the today highlight, the limit line, and values above the maximum.
- **JWT.** The login checks the single hardcoded account and returns a token valid for 12 hours, signed with `JWT_SECRET`. A global guard protects every route except `/auth/login` and `/health`. The frontend keeps the token in a cookie, and any 401 sends the user back to Sign In.
- **Project structure.** `nest/src` has one module per feature (auth, pilot, flight-hours, documents, schedules), a data module that loads the JSON once, and shared helpers in `common`. `nuxt` has Pinia stores that call the API, presentational components, and pages. Tests are in `nest/src/**/*.spec.ts` and `nest/test`.

## 6. What I would change with more time

- Real authentication: users in a database, hashed passwords, refresh tokens, and rate limiting on login.
- A database instead of JSON files.
- Browser end-to-end tests and a CI pipeline running lint, type checks, and tests on every push.
- The date detail, Logbook, and More screens.
