# SuiteCRM Modern

A modern web rebuild of [SuiteCRM](https://suitecrm.com/)'s core CRM modules — same data model and module relationships, modern stack and idioms.

> **Status:** Phase 1 (foundation) complete. Auth, multi-tenant scaffold, audit log, and dashboard shell are live. CRM modules (Accounts, Contacts, Leads, Opportunities) arrive in Phase 2.

## Stack

| Layer        | Choice                                                              |
| ------------ | ------------------------------------------------------------------- |
| Frontend     | React 18 · Vite · TypeScript · Tailwind · shadcn/ui · TanStack Query · React Router 6 · React Hook Form + Zod |
| Backend      | Fastify 4 · TypeScript · Prisma 5 · Zod (via `fastify-type-provider-zod`) · argon2 · JWT |
| Database     | PostgreSQL 16                                                       |
| Cache/queues | Redis 7 (used from Phase 4)                                         |
| Tooling      | pnpm workspaces · Vitest · ESLint · Prettier · Docker Compose       |

## Repository layout

```
suitecrm-modern/
├── apps/
│   ├── api/              # Fastify backend
│   │   ├── prisma/       # schema + migrations + seed
│   │   └── src/
│   │       ├── core/     # config, prisma, auth helpers, errors, audit
│   │       ├── plugins/  # error-handler, auth, tenant-scope
│   │       ├── modules/  # one folder per CRM module (auth in Phase 1)
│   │       └── server.ts
│   └── web/              # React SPA
│       └── src/
│           ├── components/     # ui primitives + layout
│           ├── lib/            # api client, query client
│           ├── modules/        # mirrors API modules
│           └── routes/
└── packages/
    └── shared/           # Zod schemas + enums shared across api/web
```

## Prerequisites

- **Node.js 20+**
- **pnpm 10+** (`npm i -g pnpm`)
- **Docker & Docker Compose** (for Postgres + Redis)

## Quick start

```bash
# 1. install deps
pnpm install

# 2. copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. start postgres + redis (host ports 5433 / 6380 to avoid clashing with anything already running on the standard ports)
pnpm db:up

# 4. run migrations + seed (creates default tenant, roles/permissions, admin user)
pnpm db:migrate
pnpm db:seed

# 5. start api + web in parallel
pnpm dev
```

Then open <http://localhost:5173> and sign in:

- **Email:** `admin@example.com`
- **Password:** `admin123`

The Vite dev server proxies `/api` → `http://localhost:4000`, so no CORS dance during local dev.

## Useful scripts

```bash
pnpm dev              # api + web in parallel
pnpm dev:api          # api only
pnpm dev:web          # web only

pnpm db:up            # docker compose up postgres + redis
pnpm db:down          # stop containers
pnpm db:migrate       # apply prisma migrations (interactive in dev)
pnpm db:seed          # seed admin/roles/permissions
pnpm db:reset         # drop, re-migrate, re-seed (⚠ destructive)

pnpm --filter api test
pnpm --filter web test
pnpm test             # both
pnpm build            # type-check both packages
pnpm lint             # eslint everywhere
pnpm format           # prettier write
```

## API surface (Phase 1)

| Method | Path                    | Description                              |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/health`               | Liveness probe                           |
| POST   | `/api/v1/auth/login`    | Email + password → access/refresh pair   |
| POST   | `/api/v1/auth/refresh`  | Rotate refresh token, get new access     |
| POST   | `/api/v1/auth/logout`   | Revoke a refresh token                   |
| GET    | `/api/v1/auth/me`       | Current user, roles, permissions         |

All errors are returned as RFC 7807 `application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid credentials"
}
```

## Architectural conventions

- **Multi-tenant from day 1.** Every business entity has a `tenant_id`. The auth plugin extracts it from the JWT and decorates `request.tenantId` for downstream handlers and the repository layer.
- **Soft deletes.** Every business entity has `deleted_at`; default queries filter it out.
- **Audit trail.** `created_at`, `updated_at`, `created_by`, `updated_by` on every business entity, plus a global `audit_logs` table written by the `core/audit.ts` helper.
- **Layering.**
  - `routes.ts` parses + validates + calls service.
  - `service.ts` is the only place with business logic.
  - `repository.ts` is the only place that touches Prisma.
- **Validation.** All routes use `fastify-type-provider-zod`. Schemas live in `packages/shared` and are imported by both api and web — one source of truth for DTO shapes.
- **Auth.**
  - Access tokens: HS256 JWT, 15 minute TTL, contain `sub`, `tid`, `roles`, `permissions`.
  - Refresh tokens: HS256 JWT, 7 day TTL, *and* a row in `refresh_tokens` with the token argon2-hashed. Rotation on every refresh, full revocation on logout.
  - Passwords: argon2id.
- **CORS:** the api allows `CORS_ORIGIN` (default `http://localhost:5173`), comma-separated for multiple.

## Why ports 5433 / 6380 in docker-compose?

Many dev machines already have Postgres on 5432 and Redis on 6379. To avoid silent conflicts the compose file maps the containers to **5433** and **6380** on the host. The connection strings in `apps/api/.env.example` already reflect this — no extra steps needed.

## Roadmap

- ✅ **Phase 1** — foundation: auth, multi-tenant scaffold, audit log, dashboard shell
- ⏳ **Phase 2** — Accounts, Contacts, Leads, Opportunities (CRUD + list/detail UI)
- ⏳ **Phase 3** — Cases + activities (Calls, Meetings, Tasks, Notes) with timeline + calendar
- ⏳ **Phase 4** — workflow engine (BullMQ + Redis), email via Nodemailer, scheduled jobs
- ⏳ **Phase 5** — saved views, reports, dashboards (Recharts + react-grid-layout)
- ⏳ **Phase 6** — Studio (custom fields per entity)

## License

MIT
