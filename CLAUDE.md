# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Product

**CouncilInsight** (package name `rest-express`) — a council-meeting
intelligence app built for the District of Oak Bay, BC. It scrapes, stores,
and surfaces council meetings, decisions, topics, and neighborhood impacts so
staff and residents can search and understand what council actually did.

This repo is **prior art**, not a greenfield product. Within the Fit For Gov
product family it is the **source of the future `CouncilBot` module** for the
MuniTech platform — see [Ecosystem position](#ecosystem-position) below. Treat
new work here through that lens: features that prove out council intelligence
are valuable; features that deepen this app's standalone Express/Vite
architecture are usually *not* worth the investment, because the destination
stack is Next.js multi-tenant, not Express + Vite.

## Ecosystem position

This is one of three repos in an active working set, all part of the Fit For
Gov / **Samundra Corp** practice (principal: Jesse James, Victoria BC). The
canonical cross-property map lives in **`MuniTech/docs/ECOSYSTEM.md`** — read
it before any cross-repo work.

| Repo | Role | Stack |
|---|---|---|
| **MuniTech** (`cherishwins/MuniTech`) | The multi-tenant SaaS **platform/engine** — the destination. RAG, Stripe billing, tenant resolver, modules. | Next.js 15 · pgvector · AI Gateway |
| **annapolis-royal-project** (`cherishwins/...`) | The **first live customer** deployment (RFP demo) — customer-branded. | Next.js 16 · Payload CMS · bilingual |
| **muni3** (this repo) | **Council-intelligence prior art** → becomes the **CouncilBot module** inside MuniTech. | Express · Vite · Drizzle · Maxun |

**The integration plan** (MuniTech `docs/ROADMAP.md` Phase 2): the
council-intelligence *logic and data model* here are pulled forward and
rebuilt on the MuniTech stack (Next.js App Router, pgvector, tenant-scoped).
This repo is **not** deployed as a MuniTech tenant and shares **no database**
with it. Repos in this family communicate by URL (HTTP), never by package
import — no monorepo, no shared npm packages.

When you change something here that affects the CouncilBot migration (the
schema, the scraper contract, the AI ingestion shape), note it so it can be
carried into MuniTech rather than silently diverging.

## Stack (actual, verified)

- **Server:** Express 4 (`api/index.ts` exports the app for Vercel
  serverless; there is no long-running Node server in production).
- **Routes:** `api/routes.ts` (meetings, decisions, topics, neighborhoods,
  CSV/JSON upload) + `api/routes/multimodal.ts` (AI endpoints).
- **Storage:** `api/storage.ts` — `DatabaseStorage` class, full CRUD over
  Drizzle. **Not** in-memory; it talks to real Postgres.
- **Database:** Neon Postgres via Drizzle ORM (`api/db.ts`). Schema in
  `shared/schema.ts`. **Plain relational — there is no pgvector / embeddings /
  semantic search here.** (Adding it is part of the CouncilBot migration, not
  this repo.)
- **Auth:** Passport local strategy + Postgres-backed Express sessions
  (`api/auth.ts`), role-based (admin / staff / user) via a `ProtectedRoute`
  wrapper on the client.
- **Frontend:** Vite + React 18, Wouter for routing, TanStack Query for data
  fetching, shadcn/ui + Tailwind. Pages in `client/src/pages/`.
- **Scraper:** Maxun service in `maxun/` (separate Node/TS service, deploys to
  Google Cloud Run via `maxun/Dockerfile`). API client in `api/maxun-client.ts`.
- **Deploy:** dual-target — web app + API on Vercel (`vercel.json`,
  `deploy-vercel.sh`), Maxun scraper on Cloud Run (`deploy-cloudrun.sh`).

## Common commands

```bash
npm run dev      # tsx server/index.ts — Express + Vite dev (single process)
npm run build    # vite build (client bundle)
npm run db:push  # drizzle-kit push schema to Postgres
```

Requires `DATABASE_URL` (Neon Postgres). Optional: `OPENAI_API_KEY` for the
multimodal routes, `VITE_MAXUN_*` for the scraper integration. See
`README.md` (CouncilInsight docs) for the full env var list and the Maxun
Docker setup.

There is **no test runner** wired into `package.json`.

## Data model (`shared/schema.ts`)

Relational tables: `users`, `meetings` (with `keyDiscussions` / `keyDecisions`
JSONB), `decisions` (vote counts, `meetingId` FK), `topics`, `neighborhoods`,
`meetingDiscussions` (transcript-like segments with speaker + timestamp),
`meetingKeyMoments`. No tenant column — single-tenant (Oak Bay) by design.
**The CouncilBot migration will need to add a `tenantId`/`municipalitySlug`
scope to every table**, matching MuniTech's tenant pattern.

## How data actually gets in

1. **Maxun scraper** (real): `maxun/robots/oakbay-council-robot.js` is a
   Puppeteer scraper for Oak Bay's CivicWeb portal
   (`oakbay.civicweb.net`). Runs on Cloud Run, triggered via `/api/maxun/*`,
   writes to Postgres.
2. **CSV/JSON upload** (real): `POST /api/meetings/upload`,
   `/api/decisions/upload`, `/api/topics/upload` — admin/staff only.
3. **OpenAI multimodal** (real): `api/openai-service.ts` (GPT-4o) powers
   `/api/multimodal/*` — image / document / map analysis, location
   extraction, DALL·E visualization.

## What is real vs. stubbed (do not trust the README's optimism)

The `README.md` here is aspirational product documentation. Ground-truth
state, so you don't waste time:

**Real & working:** Express API + Postgres CRUD with role auth · OpenAI
multimodal routes · Maxun Oak Bay scraper + Cloud Run deploy · CSV/JSON bulk
upload · Vercel + GCP deploy configs.

**Stubbed / dead / broken — known gaps:**

- **`@anthropic-ai/sdk` is installed but never imported.** Dead dependency.
  (When CouncilBot moves to MuniTech, Claude is wired via the Vercel AI
  Gateway there — not via this SDK.)
- **Gemini "adaptive website analyzer"** — `maxun/gemini-integration.js`
  exists and the Data Ingestion UI calls `/api/adaptive/analyze-website` and
  `/api/adaptive/extract-data`, but **those endpoints do not exist in
  `api/routes.ts`.** The UI calls dead routes.
- **Document upload is a stub** — `POST /api/documents/upload`
  (`api/routes.ts` ~line 363) logs the file and does nothing else. No
  OCR/parsing/embedding.
- **Seeding is disabled** — `storage.initializeData()` (`api/storage.ts`
  ~288–335) is gutted ("code omitted for brevity"). A cold database has no
  data until something is uploaded or scraped.
- **Project pages** (`client/src/pages/projects/*` — housing, transportation,
  parks, planning) render **hardcoded fake data**; there are no backing tables
  or endpoints. The dashboard's `publicDelegations: 32` is likewise hardcoded.

If you're asked to "finish" this app standalone, fix in this order: wire the
missing `/api/adaptive/*` endpoints (or delete the UI that calls them),
implement document processing, re-enable seeding, then back the project pages
with real data. **But first confirm the goal** — most of the time the higher-
value move is to migrate the proven council-intelligence pieces into MuniTech
as CouncilBot, not to harden this Express app.

## Conventions

- TypeScript throughout (client and `api/`).
- Client routing is Wouter, not React Router — `useLocation`, `<Route>`,
  `<Link>` come from `wouter`.
- Server data access goes through the `DatabaseStorage` interface in
  `api/storage.ts`; don't reach into Drizzle directly from route handlers.
- AI provider here is OpenAI (multimodal). Do not add new OpenAI surface area
  for council *text* intelligence — that belongs in MuniTech on Claude via the
  AI Gateway. Keep new AI work provider-portable.
