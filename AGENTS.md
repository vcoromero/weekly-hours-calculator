# Agent Instructions — Weekly Hours Tracker

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Express 5 (ESM) + Prisma + PostgreSQL |
| Frontend | React 19 + Vite 8 + TypeScript 5.6 |
| UI | Tailwind CSS v4 + shadcn/radix-ui (`shared/components/ui/`) |
| DB (dev) | PostgreSQL 16 via Docker Compose |
| Auth | JWT + bcryptjs (single master user via env vars) |
| Routing | react-router v7 (`react-router` directly, no `react-router-dom`) |
| State | TanStack Query v5 |
| Tooling | NX 22.7 (not npm workspaces), tsx, Vite dev proxy |
| Testing | Vitest v3 |

## 📖 Documentation (MANDATORY)

The source of truth for this project is at:

```
~/Documents/PunkRecords/Projects/weekly-hours-tracker/
```

**Read before touching any code:**
- `01 - Overview/06 - Stack and roadmap.md` — current project progress, what's done and what's pending
- `01 - Overview/01 - Business rules.md` — domain rules
- `01 - Overview/02 - DB structure.md` — schema design
- `02 - API specification/01 - API specification.md` — backend endpoints
- `03 - Frontend specification/01 - Frontend specification.md` — UI pages and flows
- `04 - Backend specification/01 - Backend specification.md` — backend architecture
- `01 - Overview/10 - Log.md` — project changelog/log
 
Hexagonal architecture guidance: `~/Documents/PunkRecords/Areas/Architectures/01 - Hexagonal architecture.md`

## 📝 Session Log (MANDATORY)

At the **start** of every session, read `01 - Overview/10 - Log.md` in (`~/Documents/PunkRecords/Projects/weekly-hours-tracker/`) to know the current project state and latest instructions.

At the **end** of every session (or after significant progress), update `01 - Overview/10 - Log.md` recording:
- Date and summary of what was worked on
- Instructions received from the user
- Completed tasks (with checkboxes)
- Next steps

**After confirming each merge:** update immediately:
- `01 - Overview/10 - Log.md` — new entry with completed PR
- Relevant documentation for the area (e.g. `07 - Testing/01 - Unit test plan.md` if in testing phase)
- Commit + push to dev-notes

## 🏗️ Developer Commands

### Infra (Docker)
```bash
npm run docker:up     # docker compose up -d postgres
npm run docker:down   # docker compose down
npm run docker:reset  # docker compose down -v (wipes DB volume)
```

### Full stack
```bash
npm run dev           # nx run-many --target=dev --projects=frontend,backend --parallel
npm run build         # nx run-many --target=build --projects=frontend,backend
npm run lint          # nx run-many --target=lint --projects=frontend,backend
npm test              # nx run-many --target=test --projects=frontend,backend
```

### Database (Prisma)
```bash
npm run db:migrate    # prisma migrate dev
npm run db:generate   # prisma generate
npm run db:seed       # tsx prisma/seed.ts (seeds master user)
npm run db:studio     # prisma studio
```

### UI components (shadcn/radix-ui)
```bash
npx shadcn@latest add [component]   # Add component
```

## 🔀 Workflow

Every feature or change must follow this order **strictly**:

1. **Read documentation** — Review (`~/Documents/PunkRecords/Projects/weekly-hours-tracker/`) to understand current project state.
2. **Assess scope** — Analyze how big the change is, which files/routes it impacts, estimate complexity.
3. **Decide branch strategy** (MANDATORY):
   - `feature/xxx` → new functionality
   - `bugfix/xxx` → bug fixes
   - `hotfix/xxx` → urgent patches
   - `refactor/xxx` → refactoring
   - Base branch: `develop` (or `main` if no develop exists)
4. **Plan** — Define the solution before touching code. Get user approval.
5. **Implement** — Write the code.
6. **Small PRs** — Maximum ~300 lines. Split larger changes into multiple PRs.
7. **No auto-commits** — Do not commit or push automatically without explicit user approval.

## 🧱 Components

- **Small** components with a single responsibility.
- **Functional**, never class-based.
- Each component in its **own file**.
- Location: `src/features/<domain>/components/`
- Shared UI components live in `src/shared/components/ui/` — installed via shadcn CLI.

## 💻 Coding Principles

- **SOLID** and **Clean Code** as baseline standards.
- TypeScript strict mode (enforced in `tsconfig.base.json`).
- Prefer small, focused functional components on the frontend.
- **Naming conventions**:

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `RecordForm.tsx` |
| Functions / variables | camelCase | `getWorkerHistory()` |
| Files (frontend) | kebab-case | `record-form.tsx` |
| Files (backend) | kebab-case | `jwt-bcrypt.adapter.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_HOURS` |
| Enums / types | PascalCase | `WeekStatus` |

## 🌐 Language

- **Code and comments**: English (variable names, function names, docblocks, inline comments)
- **Documentation** (`AGENTS.md`, dev-notes, commit messages): English
- **Product presentation** (UI labels, page titles, error messages, form labels): Spanish

## ✍️ Commits

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- No auto-commit or auto-push without explicit user approval.

## 🛡️ Quality Gates (MANDATORY)

Before committing or pushing, ALL of these must pass:

```bash
npm run lint   # TypeScript type-check (tsc --noEmit) for both apps
npm test      # Vitest unit tests for both apps must pass
```

If either fails, fix the issues before proceeding. There is no auto-fix — errors must be resolved manually.

## ⚠️ Key Quirks & Constraints

### NX project discovery
Each app **must** have a `project.json` at its root (`apps/backend/project.json`, `apps/frontend/project.json`) defining its nx targets. Without them, `npm run dev` from the root fails because nx cannot discover the projects.

### `.env` quoting for `$` characters
Values containing `$` (like bcrypt hashes) **must be wrapped in double quotes** in `.env` files. Otherwise dotenv interprets `$` as variable interpolation and truncates the value silently.

```env
# WRONG — dotenv strips "$ZrA2mj..." as a variable reference, hash becomes 38 chars
MASTER_PASSWORD_HASH=$2a$10$ZrA2mjF8e8nhxLnGQt7Ls.4t9yu.17iXJqLv3oedU1Fsf6TNXQohG

# CORRECT — quoting preserves the full 60-char hash
MASTER_PASSWORD_HASH="$2a$10$ZrA2mjF8e8nhxLnGQt7Ls.4t9yu.17iXJqLv3oedU1Fsf6TNXQohG"
```

### `tsx watch` does NOT reload `.env`
`tsx watch` only restarts on `.ts` file changes. Changes to `.env` or other non-source files **require a manual restart** (`Ctrl+C` and re-run `npm run dev`).

### `.env` files are gitignored
They persist on disk across branch switches but are not tracked in git. Always verify `.env` contents after switching branches.

### Two `.env` files (separation of concerns)
- **Root `.env`** — ONLY for Docker Compose (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
- **`apps/backend/.env`** — Backend vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `MASTER_EMAIL`, `MASTER_PASSWORD_HASH`, `FRONTEND_URL`)

Do not duplicate `MASTER_*` vars in the root `.env`. Backend reads its own env via `dotenv` from `apps/backend/.env`.

### Week status transitions
- `draft` → can save records normally
- `saved` → editable via `updateWeek` (replaces all records). `saveWeek` rejects if already saved.

### Backend build
Backend build = `tsc` (ESM, outputs to `dist/`). Must run `npm run db:generate` after Prisma schema changes or TS will fail on missing types.

### Path alias
`@/` maps to `./src` (Vite resolve alias). Configured in `vite.config.ts` and `tsconfig.base.json`.

### Auto-generated code
Prisma client is generated at `node_modules/.prisma/client` — never edit directly. Run `npm run db:generate` after schema changes.

## 📁 File Locations

### Backend (`apps/backend`)
- Entry: `src/server.ts` → boots Express
- App setup: `src/infrastructure/http/app.ts` → mounts `/api` router + error handler
- Routes: `src/infrastructure/http/routes.ts` → all HTTP routes
- Controllers: `src/infrastructure/http/controllers/`
- Use cases: `src/application/use-cases/`
- Domain: `src/domain/` (entities, ports, services, errors)
- Infrastructure: `src/infrastructure/` (persistence, auth, HTTP)
- DI container: `src/infrastructure/http/container.ts` → wires everything manually
- Config: `src/config/env.ts` → Zod-validated env vars
- Prisma schema: `prisma/schema.prisma`
- `.env`: `apps/backend/.env` (gitignored)

### Frontend (`apps/frontend`)
- Entry: `src/main.tsx` → `src/app/App.tsx` → `src/app/router.tsx`
- Providers: `src/app/providers.tsx` → QueryClient + Auth provider
- Routes: `src/app/router.tsx`
- Features: `src/features/<domain>/components/`
- Shared API: `src/shared/api/` → `queries.ts` (reads), `mutations.ts` (writes), `client.ts`
- Shared hooks: `src/shared/hooks/` → `useAuth.tsx`
- Shared types: `src/shared/types/`
- UI components: `src/shared/components/ui/` (shadcn/radix-ui)
- Vite config: `vite.config.ts` → dev proxy `/api` → `http://localhost:3000`

### Routes (frontend)
`/` · `/login` · `/week-entry` · `/weeks/:id` · `/weeks/:id/edit` · `/workers` · `/workers/:id/dashboard` · `/workers/:id/weeks/:weekId` · `/invoices/builder`

### State & data fetching
- All API hooks live in `shared/api/queries.ts` (reads) and `mutations.ts` (writes).
- `useMutation` callbacks **must invalidate** affected query keys. Pattern: invalidate `["workers"]` prefix to bust dashboard/stats/history/week detail caches simultaneously.
- `staleTime` varies by query (10s–30s). No optimistic updates.
- Query key convention: `["workers"]`, `["weeks"]`, `["weeks", "current"]`, `["records", weekId]`, `["workers", id, "history"]`, etc. Invalidation by prefix busts all child keys.

### Route guards

All routes except `/login` are wrapped in `ProtectedLayout` (`shared/components/Layout.tsx`), which:
- Shows a spinner while `isLoading` from `useAuth()` resolves
- Redirects to `/login` if `isAuthenticated` is false
- Renders `<Header />` + `<Outlet />` for authenticated users

### Invoice PDF naming

Generated invoice PDFs follow a specific filename convention (see `01 - Overview/10 - Log.md`):

- **Single week**: `{workerName}-week-{number}.pdf` (e.g., `victor_romero-week-18.pdf`)
- **Multiple weeks**: `{workerName}-weeks-{numbers}.pdf` (e.g., `victor_romero-weeks-19-20.pdf`)

Worker name is lowercased with spaces replaced by underscores. Week numbers are extracted from the week label. The filename is set via `Content-Disposition` header by `invoice.controller.ts` and consumed by the frontend `useGenerateInvoicePDF` mutation.

## 🏛️ Architecture (Hexagonal)

The backend follows hexagonal architecture (ports & adapters). Strict dependency direction: **infrastructure → application → domain** (never reversed).

### Layers

| Layer | Directory | Contains |
|-------|-----------|----------|
| **Domain** | `src/domain/` | Entities, value objects, ports (interfaces), domain services (pure logic), domain errors |
| **Application** | `src/application/` | Use cases (orchestration), DTOs |
| **Infrastructure** | `src/infrastructure/` | HTTP (Express app, controllers, middleware, routes), persistence (Prisma repositories + mappers), auth adapter |

### Dependency rules

- `domain/` imports nothing from `application/` or `infrastructure/`
- `application/` imports only from `domain/`
- `infrastructure/` imports from both `domain/` and `application/`

### Ports & adapters

Ports (interfaces) live in `src/domain/ports/`, adapters in `src/infrastructure/`:

| Port | Adapter |
|------|---------|
| `WorkerRepository` | `WorkerPrismaRepository` |
| `RecordRepository` | `RecordPrismaRepository` |
| `WeekRepository` | `WeekPrismaRepository` |
| `WorkerPaymentRepository` | `WorkerPaymentPrismaRepository` |
| `AuthPort` | `JwtBcryptAuthAdapter` |

Prisma models are mapped to domain entities via mappers in `src/infrastructure/persistence/mappers/`.

### Request flow

```
HTTP Request
  → routes.ts (Express router)
    → auth.middleware.ts (Bearer token verification)
      → validate.middleware.ts (Zod body/params validation)
        → controller (extracts data, delegates to use case)
          → use case (orchestration)
            → domain service (pure business logic)
            → repository port (interface)
              → Prisma repository (adapter, uses mapper)
                → PostgreSQL
          ← use case returns DTO
        ← controller sends JSON response
    ← error.handler.ts catches any thrown error
```

### DI container

Manual wiring in `src/infrastructure/http/container.ts`. Construction order:
1. Prisma client (`prisma-client.ts`)
2. Repositories (receive `prisma` instance)
3. Domain services (`WeekCalculator`, `TotalsCalculator`, `InvoiceService`) — stateless, no deps
4. Use cases (receive repositories + services)
5. Controllers (receive use cases)
6. Middleware (`createAuthMiddleware` receives `VerifyTokenUseCase`)

### Error handling pattern

Domain errors extend `Error` with a `statusCode` property. The `errorHandler` middleware resolves them:

| Error type | HTTP status |
|------------|-------------|
| `ZodError` (validation) | 400 |
| `Prisma.PrismaClientKnownRequestError` (P2002) | 409 |
| `Prisma.PrismaClientKnownRequestError` (P2003) | 400 |
| `Prisma.PrismaClientKnownRequestError` (P2025) | 404 |
| Domain errors with `statusCode` (e.g., `AuthError` → 401) | As defined |
| Anything else | 500 |

Controllers **do not catch** domain errors — they `throw` and the centralized `errorHandler` formats the response.

## Validation (Zod)

The backend uses Zod in two layers:

### Environment validation
`apps/backend/src/config/env.ts` defines a Zod schema for all env vars. The app fails fast at startup if any variable is missing or invalid. Variables: `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `MASTER_EMAIL`, `MASTER_PASSWORD_HASH`, `FRONTEND_URL`.

### Request validation
Zod schemas are co-located in `apps/backend/src/infrastructure/http/routes.ts` (e.g., `loginSchema`, `createWorkerSchema`, `recordInputSchema`, `invoiceSchema`, etc.). They are applied via middleware:
- `validateBody(schema)` — parses and replaces `req.body` with validated data; rejects with `400` on failure
- `validateParams(schema)` — validates URL params (e.g., UUID format); rejects with `400` on failure

### Response shape on validation failure
Both middleware and the central `errorHandler` return the same shape for Zod errors:

```json
{
  "error": "Validation error",
  "details": [{ "path": ["field"], "message": "..." }]
}
```

Status code is always **400**.

## Database Schema (Prisma)

- `Worker` — id, name (unique), isRegular, createdAt, updatedAt, records[], payments[]
- `WorkRecord` — id, workerId, date, hours, hourlyRate, description, weekId, createdAt
- `Week` — id, label, startDate, endDate, status ("draft" | "saved"), createdAt, records[], payments[]
- `WorkerPayment` — id, workerId, weekId, totalAmount, paidAt (unique constraint on [workerId, weekId])

## 🧪 Testing

Framework: **Vitest v3** with `globals: true`.

| App | Config | Environment | Include pattern |
|-----|--------|-------------|-----------------|
| Backend | `vitest.config.ts` | `node` | `src/**/*.test.ts` |
| Frontend | `vite.config.ts` (`test` block) | `node` | `src/**/*.test.ts` |

### Conventions

- Test files co-located in `__tests__/` directories next to the source file
- Extension: `.test.ts` (pure logic) or `.test.tsx` (React components)
- Use named imports from `vitest`: `describe`, `it`, `expect`, `beforeEach`
- No snapshots without explicit approval

### Current coverage (P0 — pure functions)

| Backend | Frontend |
|---------|----------|
| `WeekCalculator` — 21 tests | `formatters.ts` — 13 tests |
| `TotalsCalculator` — 14 tests | `calculations.ts` — 11 tests |
| | `cn()` — 6 tests |

Consult `07 - Testing/01 - Unit test plan.md` for the full coverage status and pending PRs.

### Coverage thresholds

Target: **80%** on lines, branches, functions, and statements. Currently **disabled** — planned to be activated after PR #16 (see `07 - Testing/06 - PR 14-16 and summary.md`). Coverage exclusions: infrastructure (routes, container, persistence), shadcn/ui, entry points.

### Commands

```bash
npm test                        # All tests (nx run-many --target=test)
npm test -- --filter="TestName" # Single test (vitest --filter pattern)
```

## Authentication

JWT stored in `localStorage` (see `shared/hooks/useAuth.tsx`). Single master user configured entirely via environment variables (`MASTER_EMAIL`, `MASTER_PASSWORD_HASH`). No database user table for auth — the `Worker` entity is unrelated to authentication.

### Auth flow specifics
- Token stored in `localStorage` under key `auth_token`; user object stored under `auth_user`
- API client (`shared/api/client.ts`) attaches token via `Authorization: Bearer <token>` header
- Token expiry configured via `JWT_EXPIRES_IN` env var (default `7d`)
- `AuthProvider` restores session from `localStorage` on mount (parses `auth_user`, validates token presence)
- Login: `POST /auth/login` returns `{ token, user }` — both persisted to `localStorage`
- Logout: removes both `auth_token` and `auth_user` from `localStorage`
