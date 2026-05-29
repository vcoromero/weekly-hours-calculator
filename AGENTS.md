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
| Testing | None yet |

## 📖 Documentation (MANDATORY)

The source of truth for this project is at:

```
~/Documents/dev/dev-notes/Projects/weekly-hours-calculator/
```

**Read before touching any code:**
- `06 - Stack & roadmap.md` — current project progress, what's done and what's pending
- `01 - Business rules.md` — domain rules
- `02 - DB structure.md` — schema design
- `03 - API spec.md` — backend endpoints
- `04 - Frontend spec.md` — UI pages and flows
- `05 - Backend spec.md` — backend architecture
- `10 - Bitácora.md` 

Hexagonal architecture guidance: `~/Documents/dev/dev-notes/Areas/Architectures/01 - Hexagonal architecture.md`

## 📝 Session Log (MANDATORY)

At the **start** of every session, read `10 - Bitácora.md` in the dev-notes
(`Projects/weekly-hours-calculator/`) to know the current project state and latest instructions (if it does not exist, create it). 

At the **end** of every session (or after significant progress), update `03 - Bitácora.md` recording:
- Date and summary of what was worked on
- Instructions received from the user
- Completed tasks (with checkboxes)
- Next steps

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
npm run lint          # nx run-many --target=lint (tsc --noEmit for both apps)
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

1. **Read documentation** — Review the dev-notes (`~/Documents/dev/dev-notes/Projects/weekly-hours-calculator/`) to understand current project state.
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
```

If it fails, fix the issues before proceeding. There is no auto-fix — TypeScript errors must be resolved manually.

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

## Database Schema (Prisma)

- `Worker` — id, name (unique), isRegular, records[]
- `WorkRecord` — id, workerId, date, hours, hourlyRate, description, weekId
- `Week` — id, label, startDate, endDate, status ("draft" | "saved"), records[]
- `WorkerPayment` — id, workerId, weekIds[], amount, paidAt

## 🧪 Testing

No test suite exists in the repo yet. `npm run lint` (= `tsc --noEmit` for both apps) is the current quality gate.

When a test suite is added, follow:
```bash
npm test                        # All tests
npm test -- --filter="TestName" # Single test
```

## Authentication

JWT stored in `localStorage` (see `shared/hooks/useAuth.tsx`). Single master user configured entirely via environment variables (`MASTER_EMAIL`, `MASTER_PASSWORD_HASH`). No database user table for auth — the `Worker` entity is unrelated to authentication.
