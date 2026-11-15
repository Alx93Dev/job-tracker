# Job Tracker

Full-stack app to track job applications from wishlist to offer. Built as a portfolio project to practise a modern React + NestJS stack end to end.

> **Status:** all six phases built and tested; public deployment pending. See the [roadmap](#roadmap).

| Board                                                                         | Analytics                                                                             |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ![Kanban board with applications in five columns](docs/screenshots/board.png) | ![Analytics page with rates, weekly chart and funnel](docs/screenshots/analytics.png) |

## Features

- **📊 Analytics:** response, interview and offer rates, average time to first answer, a funnel, applications per week and where every application stands
- **⏰ Follow-up reminders:** moving a card to Applied schedules a follow-up a week later; a background job turns due follow-ups into in-app notifications
- **✨ Fill in from a job posting:** paste a posting and AI extracts company, position, location, salary, seniority and skills into the form
- **✨ CV match:** compare an application with your CV and get a score, strengths, gaps and talking points for the cover letter or interview
- **Accounts with secure sessions:** sign up, sign in and sign out; every user only sees their own applications
- **One-click demo** (`Try the demo`) so anyone can explore the app with sample data, no sign-up needed
- **Kanban board** with drag and drop between Wishlist → Applied → Interview → Offer → Rejected, usable with mouse, touch **and keyboard** (space to pick up, ←/→ to change column) with screen reader announcements
- **Optimistic updates:** cards move instantly and roll back automatically if the server rejects the change
- **Search** across company, position and location (debounced, server-side)
- **Board / list views**, kept in the URL (`?view=list`) so they survive reloads and can be shared
- **Light / dark / system theme** without flash on load
- Create, edit and delete applications with validated, accessible forms

## Tech stack

| Layer    | Technology                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4                                        |
| Data     | TanStack Query 5 (server state)                                                                      |
| Forms    | React Hook Form + Zod                                                                                |
| UX       | dnd-kit (accessible drag and drop), next-themes                                                      |
| Backend  | NestJS 11, class-validator, Swagger / OpenAPI                                                        |
| AI       | Claude API (Claude Opus 5.5) via the Anthropic TypeScript SDK, structured outputs validated with Zod |
| Auth     | JWT in httpOnly cookies, rotating refresh tokens, Argon2id, @nestjs/throttler                        |
| Database | PostgreSQL 17 + Prisma 6                                                                             |
| Testing  | Vitest + Testing Library (web), Jest (api), Playwright + axe-core (end to end and accessibility)     |
| Tooling  | pnpm workspaces, ESLint, Prettier, Docker, Docker Compose, GitHub Actions                            |

## Architecture

```
job-tracker/
├── apps/
│   ├── web/                     Next.js client
│   │   └── src/
│   │       ├── app/             Routes (board/list, new, edit, login, register)
│   │       ├── features/        Feature modules: ai, analytics, auth, job-applications, notifications, profile
│   │       ├── components/      Shared UI (form fields, theme toggle)
│   │       ├── hooks/           Shared hooks (debounce)
│   │       ├── lib/             HTTP client with session refresh, routes
│   │       └── middleware.ts    Redirects signed-out visitors to /login
│   └── api/                     NestJS REST API
│       ├── prisma/              Schema, migrations, seed
│       └── src/
│           ├── ai/              Claude client, prompts, Zod output schemas
│           ├── analytics/       Metrics computed from the status history
│           ├── auth/            Register, login, demo, refresh, logout, guards
│           ├── config/          Env validation and constants
│           ├── notifications/   Follow-up reminder job and notifications
│           ├── prisma/          PrismaService (global module)
│           ├── profile/         CV storage
│           └── job-applications/ Controller, service, DTOs
├── docker-compose.yml           PostgreSQL (+ API with the `full` profile)
└── .github/workflows/ci.yml     Lint, typecheck, test and build on every push
```

```
Browser ──► Next.js ──(rewrite /api/*)──► NestJS /api ──Prisma──► PostgreSQL
             same origin: auth cookies are first-party
```

## Getting started

Requirements: Node 24, pnpm 11 and Docker (or a local PostgreSQL).

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env   # set JWT_ACCESS_SECRET (and ANTHROPIC_API_KEY for AI)
cp apps/web/.env.example apps/web/.env.local
pnpm db:up          # start PostgreSQL in Docker
pnpm db:migrate     # apply migrations
pnpm db:seed        # demo account with sample data
pnpm dev            # web on :3000, api on :4000
```

- App: http://localhost:3000
- API docs (Swagger): http://localhost:4000/docs
- Click **Try the demo** on the login page, or create an account

### Useful scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Run web and api in watch mode              |
| `pnpm test`      | Run all unit tests                         |
| `pnpm lint`      | Lint both apps                             |
| `pnpm typecheck` | Type-check both apps                       |
| `pnpm build`     | Production build of both apps              |
| `pnpm test:e2e`  | End-to-end tests (see [Testing](#testing)) |

## Testing

| Layer         | Tool                     | What it covers                                                                                                                 |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Unit (API)    | Jest                     | Services, guards, token rotation, lifecycle rules, analytics, reminder job, env validation                                     |
| Unit (web)    | Vitest + Testing Library | Forms, hooks, optimistic updates, API client refresh, components                                                               |
| End to end    | Playwright               | Sign up / log in / log out, keyboard drag and drop, search, follow-up badges, AI import and CV match, analytics, notifications |
| Accessibility | axe-core in Playwright   | WCAG 2.1 AA on every page, in light and dark mode                                                                              |

The end-to-end suite runs the production builds of both apps against a real PostgreSQL and a local stand-in for the Claude API, so it never calls (or pays for) the real model. It needs a throwaway database:

```bash
pnpm build
pnpm --filter web exec playwright install chromium
E2E_DATABASE_URL=postgresql://jobtracker:jobtracker@localhost:5432/jobtracker_e2e pnpm test:e2e
```

In CI it runs on every pull request with a PostgreSQL service container. `CAPTURE_SCREENSHOTS=1 pnpm test:e2e screenshots` regenerates the README screenshots.

### Lighthouse

Production build, measured locally (median of three runs):

| Page      | Performance (mobile) | Performance (desktop) | Accessibility | Best practices | SEO |
| --------- | -------------------- | --------------------- | ------------- | -------------- | --- |
| Login     | 97                   | 100                   | 100           | 100            | 100 |
| Board     | 85                   | 100                   | 100           | 100            | —   |
| Analytics | 90                   | 100                   | 100           | 100            | —   |

Signed-in pages are excluded from indexing on purpose (`robots.txt`), so their SEO score is not meaningful. On the mobile profile the board's remaining cost is React hydration and drag-and-drop measuring the columns.

## Deployment

### Vercel (recommended)

The repository deploys as **two Vercel projects** from the same Git repository, plus a managed PostgreSQL:

```
Browser ──► web project (Next.js) ──rewrite /api/*──► api project (NestJS function) ──► PostgreSQL (Neon)
                                                          ▲
                                     Vercel Cron Job ─────┘ GET /api/cron/follow-up-reminders (daily)
```

- **API project** (Root Directory `apps/api`): NestJS runs as a single Vercel Function. `apps/api/vercel.json` sets the build command (`scripts/vercel-build.mjs`) and a daily cron job. **Production** builds apply pending migrations and refresh the demo account; **preview** builds never touch the database.
- **Web project** (Root Directory `apps/web`): standard Next.js. `API_PROXY_TARGET` points at the API project's production URL, so the browser only talks to the web domain and the auth cookies stay first-party.
- **Reminders:** serverless instances are frozen between requests, so on Vercel (`VERCEL=1`) the in-process scheduler is off and the Vercel Cron Job calls `/api/cron/follow-up-reminders` with `Authorization: Bearer <CRON_SECRET>`. On the Hobby plan cron jobs run once a day, within the scheduled hour.

**Environment variables**

| Project | Variable              | Value                                                      |
| ------- | --------------------- | ---------------------------------------------------------- |
| api     | `DATABASE_URL`        | Pooled connection string, with `pgbouncer=true` added      |
| api     | `DIRECT_DATABASE_URL` | Direct (unpooled) connection string, used for migrations   |
| api     | `JWT_ACCESS_SECRET`   | Random, at least 32 characters                             |
| api     | `CRON_SECRET`         | Random letters and numbers, at least 16 characters         |
| api     | `COOKIE_SECURE`       | `true`                                                     |
| api     | `CORS_ORIGIN`         | The web project's production URL                           |
| api     | `DEMO_USER_EMAIL`     | `demo@jobtracker.dev` (enables **Try the demo**)           |
| api     | `ANTHROPIC_API_KEY`   | Optional; without it the AI features answer 503            |
| web     | `API_PROXY_TARGET`    | The API project's production URL, without a trailing slash |

Set the database variables for the **Production** environment only, so preview deployments cannot reach production data. Every production deployment of the API resets the shared demo account.

### Docker

Both apps ship as Docker images (built in CI on every pull request):

- **API** (`apps/api/Dockerfile`): applies pending migrations on start (`prisma migrate deploy`, never destructive), runs as a non-root user and exposes `GET /api/health` for the platform's health check.
- **Web** (`apps/web/Dockerfile`): Next.js standalone server, non-root. `API_PROXY_TARGET` is a **build argument** because Next.js bakes rewrites into the build: set it to the address at which the web container reaches the API.

Run the whole stack locally with `docker compose --profile full up --build`.

**Production settings for the API**

| Variable             | Value                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`       | Managed PostgreSQL connection string                                                                                                 |
| `JWT_ACCESS_SECRET`  | Random, at least 32 characters                                                                                                       |
| `COOKIE_SECURE`      | `true` (HTTPS only)                                                                                                                  |
| `CORS_ORIGIN`        | Public URL of the web app                                                                                                            |
| `TRUSTED_PROXY_HOPS` | Proxies in front of the API: Next.js plus the platform's load balancer, usually `2`. Needed so rate limiting sees the real client IP |
| `DEMO_USER_EMAIL`    | Enables **Try the demo**; run `pnpm db:seed` once against the production database                                                    |
| `ANTHROPIC_API_KEY`  | Optional; without it the AI features answer 503                                                                                      |

The demo account is shared by every visitor, so re-running the seed resets its applications and CV.

## API

| Method | Endpoint                             | Description                                |
| ------ | ------------------------------------ | ------------------------------------------ |
| POST   | `/api/auth/register`                 | Create an account and start a session      |
| POST   | `/api/auth/login`                    | Start a session                            |
| POST   | `/api/auth/demo`                     | Start a session as the demo user           |
| POST   | `/api/auth/refresh`                  | Rotate the refresh token                   |
| POST   | `/api/auth/logout`                   | Revoke the refresh token and clear cookies |
| GET    | `/api/auth/me`                       | Current user                               |
| GET    | `/api/job-applications`              | List applications (`?status=`, `?search=`) |
| GET    | `/api/job-applications/:id`          | Get one application                        |
| POST   | `/api/job-applications`              | Create an application                      |
| PATCH  | `/api/job-applications/:id`          | Update an application                      |
| DELETE | `/api/job-applications/:id`          | Delete an application                      |
| POST   | `/api/job-applications/:id/cv-match` | Compare the application with the user's CV |
| POST   | `/api/ai/job-postings/extract`       | Extract structured data from a job posting |
| GET    | `/api/profile/cv`                    | Get the current user's CV                  |
| PUT    | `/api/profile/cv`                    | Save the current user's CV                 |
| GET    | `/api/analytics/summary`             | Search metrics for the current user        |
| GET    | `/api/notifications`                 | Latest notifications and unread count      |
| POST   | `/api/notifications/:id/read`        | Mark one notification as read              |
| POST   | `/api/notifications/read-all`        | Mark every notification as read            |

Every endpoint except register, login, demo, refresh and logout requires a session. Job application endpoints only touch the current user's data and answer `404` for anyone else's, so ids cannot be probed.

## Technical decisions

- **Separate NestJS backend instead of Next.js route handlers.** Keeps a clear client/server boundary, makes the API reusable and documents it with OpenAPI. NestJS modules and dependency injection also map closely to Angular concepts.
- **TanStack Query for server state.** Caching, invalidation and loading/error states come for free; there is no client state worth a global store yet.
- **Zod on the client, class-validator on the server.** The client validates for UX, the server validates for safety. Both enforce the same length limits.
- **Prisma `select` projections.** Every read returns only the fields in the response DTO instead of full entities.
- **Feature-based folders** (`features/job-applications`) so each domain area owns its API calls, hooks, schemas and components.
- **Accessibility from the start:** labelled inputs, `aria-invalid` + `aria-describedby` on errors, `role="alert"` for failures, `aria-pressed` on filters.
- **Optimistic status changes across every cached list.** On drop, the mutation snapshots all cached list queries, applies the change to each one (removing the card from lists filtered by its old status), and restores the snapshots if the request fails. The logic lives in a pure `applyStatusChange` function so it is unit-tested without React.
- **Column-to-column keyboard dragging.** dnd-kit's default keyboard sensor moves in small pixel steps; a custom coordinate getter jumps straight to the adjacent column, so a keyboard user needs one key press per column.
- **dnd-kit `core` instead of `sortable`.** Cards are ordered by last update, so the board only needs to move cards between columns; manual ordering within a column would need a persisted position field and is left out on purpose.

### Authentication and security

- **Tokens in httpOnly cookies, not localStorage.** JavaScript cannot read them, so an XSS bug cannot steal a session. `SameSite=Lax` plus JSON-only endpoints protect against CSRF.
- **Same-origin API through a Next.js rewrite.** The browser only talks to the web app, which proxies `/api` to NestJS. Cookies stay first-party (third-party cookies are increasingly blocked) and production needs no CORS.
- **Short-lived access token (15 min) + rotating refresh token (7 days).** Refresh tokens are random, single use and stored only as SHA-256 hashes. Reusing an already rotated token is treated as theft and revokes every session of that user.
- **One shared refresh on the client.** When several requests get a `401` at once, they wait for a single refresh call and retry, instead of racing and triggering reuse detection.
- **Argon2id** for passwords, plus a dummy hash check for unknown emails so login timing does not reveal which emails are registered. Wrong email and wrong password return the same message.
- **Rate limiting:** 5 requests per minute per IP on register, login and demo; 120 per minute elsewhere.
- **No open redirects:** the `?next=` page after login only accepts same-site relative paths.
- **Middleware is a UX hint, the API is the gate.** Next.js middleware only checks that a session cookie exists to avoid flashing protected pages; the API validates the token on every request.

### AI

- **The model is only called from the API.** The API key never reaches the browser, and every AI endpoint requires a session and is rate limited to 10 requests per minute.
- **Structured outputs with Zod.** Each feature has a Zod schema that is sent to Claude as the output format and used again to parse the answer, so the rest of the code works with typed data and never parses free text.
- **Inputs are treated as data.** Postings and CVs are pasted by users, so the prompts wrap them in tags and tell the model to ignore any instructions inside them.
- **Effort per task:** `low` for extraction (a reading task: fast and cheap) and `medium` for the CV comparison, which needs judgement.
- **Failure handling:** a declined request answers `422`, a truncated or invalid answer `502`, a busy provider `503`. Server-side fallbacks are enabled, so if the model declines a request the API retries it on a fallback model automatically.
- **Results are stored.** The CV match is saved on the application, so reopening it does not call (and pay for) the model again; it is cleared when the job description changes.
- **Optional by design.** Without `ANTHROPIC_API_KEY` the AI endpoints answer `503` and the rest of the app keeps working.

### Reminders and analytics

- **Status history as the source of truth.** Every status change is stored as a `StatusChange` row, so metrics such as response rate or days to first answer come from what actually happened, not from the current status alone. The migration backfills one entry per existing application.
- **Business rules in one pure function** (`deriveLifecycleChanges`): moving to Applied fills in today's date if missing and schedules a follow-up 7 days later (never in the past); Offer and Rejected cancel a pending follow-up; the user's own dates always win. It is unit-tested without a database.
- **Background job with `@nestjs/schedule`.** An hourly cron turns due follow-ups into notifications. Each application is notified once (`followUpNotifiedAt` is set in the same transaction) and re-armed only when the user picks a new date. With several API instances this job would need a distributed lock or a queue.
- **Honest metrics.** The first entry of a history (an application created directly as Rejected, or a backfilled row) is not counted as an answer when measuring response time. Rates are `null` instead of dividing by zero.
- **Charts without a chart library.** The weekly chart and bar lists are plain HTML: one validated color for light and dark mode, thin rounded bars on a zero baseline, a recessive grid, hover tooltips that stay inside the chart, labels on every bar and a table view for screen readers and keyboard users.

## Roadmap

- [x] **Phase 1 — Foundation:** monorepo, CRUD API, list and form UI, CI
- [x] **Phase 2 — Kanban & UX:** drag-and-drop board, optimistic updates, search, dark mode toggle
- [x] **Phase 3 — Auth:** sign-up / login, per-user data, demo account
- [x] **Phase 4 — AI:** extract fields from a job posting, match it against your CV
- [x] **Phase 5 — Reminders & analytics:** follow-up jobs, response-rate dashboard
- [x] **Phase 6 — Polish:** Playwright E2E with axe accessibility checks, Lighthouse audit and fixes, production Docker images, health check
- [ ] **Public deployment** with the demo URL in the repository description
