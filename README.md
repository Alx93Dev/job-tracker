# Job Tracker

Full-stack app to track job applications from wishlist to offer. Built as a portfolio project to practise a modern React + NestJS stack end to end.

> **Status:** Phase 4 of 6 — AI features. See the [roadmap](#roadmap).

## Features

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
| Testing  | Vitest + Testing Library (web), Jest (api)                                                           |
| Tooling  | pnpm workspaces, ESLint, Prettier, Docker Compose, GitHub Actions                                    |

## Architecture

```
job-tracker/
├── apps/
│   ├── web/                     Next.js client
│   │   └── src/
│   │       ├── app/             Routes (board/list, new, edit, login, register)
│   │       ├── features/        Feature modules: ai, auth, job-applications, profile
│   │       ├── components/      Shared UI (form fields, theme toggle)
│   │       ├── hooks/           Shared hooks (debounce)
│   │       ├── lib/             HTTP client with session refresh, routes
│   │       └── middleware.ts    Redirects signed-out visitors to /login
│   └── api/                     NestJS REST API
│       ├── prisma/              Schema, migrations, seed
│       └── src/
│           ├── ai/              Claude client, prompts, Zod output schemas
│           ├── auth/            Register, login, demo, refresh, logout, guards
│           ├── config/          Env validation and constants
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

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Run web and api in watch mode |
| `pnpm test`      | Run all unit tests            |
| `pnpm lint`      | Lint both apps                |
| `pnpm typecheck` | Type-check both apps          |
| `pnpm build`     | Production build of both apps |

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

## Roadmap

- [x] **Phase 1 — Foundation:** monorepo, CRUD API, list and form UI, CI
- [x] **Phase 2 — Kanban & UX:** drag-and-drop board, optimistic updates, search, dark mode toggle
- [x] **Phase 3 — Auth:** sign-up / login, per-user data, demo account
- [x] **Phase 4 — AI:** extract fields from a job posting, match it against your CV
- [ ] **Phase 5 — Reminders & analytics:** follow-up jobs, response-rate dashboard
- [ ] **Phase 6 — Polish:** Playwright E2E, Lighthouse > 90, deployment
