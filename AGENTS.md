# AGENTS.md — Weekly Hours Tracker

## Monorepo & Commands

- **Tool**: NX 22.7 (not npm workspaces). Root scripts delegate to NX: `npm run dev`, `npm run build`, `npm run lint`.
- **Apps**: `apps/backend` (Express), `apps/frontend` (React 19 + Vite 8). No library packages in active use.
- **No test suite** exists in the repo. `lint` = `tsc --noEmit` for both apps.

### Essential commands
```bash
# Start everything (postgres + backend + frontend)
npm run docker:up     # docker compose up -d postgres
npm run docker:down   # docker compose down
npm run docker:reset  # docker compose down -v (wipes DB volume)
npm run dev           # nx run-many --target=dev --projects=frontend,backend --parallel

# Type-check only
npm run lint

# Database
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate
npm run db:seed      # tsx prisma/seed.ts
npm run db:studio    # prisma studio
```

## Backend (`apps/backend`)

### Stack
- **Express 5** with `/api` prefix. Port 3000.
- **Prisma** + PostgreSQL.
- **Clean Architecture**: `domain/` (models, ports, services) → `application/` (services/use cases) → `infrastructure/` (controllers, repositories, auth adapters).
- **DI container**: `infrastructure/http/container.ts` wires everything manually.

### Entry points
- `src/server.ts` — boots Express.
- `src/infrastructure/http/app.ts` — mounts `/api` router + error handler.
- `src/infrastructure/http/routes.ts` — all HTTP routes.

### Env (required)
Copy `apps/backend/.env.example` → `apps/backend/.env`. Required vars:
- `DATABASE_URL` — Postgres connection string.
- `JWT_SECRET` — min 10 chars.
- `JWT_EXPIRES_IN` — token expiry (defaults to `"7d"`).
- `MASTER_EMAIL`, `MASTER_PASSWORD_HASH` — seed admin user.
- `FRONTEND_URL` — CORS origin (default `http://localhost:5173`).

Root `.env` is **only for Docker Compose** (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB). Backend reads its own env via `dotenv` from `apps/backend/.env`.

### Prisma workflow
1. Edit `prisma/schema.prisma`
2. `npm run db:generate` (regenerates client types)
3. `npm run db:migrate` (creates/apply migrations)
4. `npm run db:seed` (optional, seeds master user)

## Frontend (`apps/frontend`)

### Stack
- **React 19** + **Vite 8** + **TypeScript 5.6**
- **react-router v7** (no `react-router-dom` — use `react-router` directly)
- **TanStack Query v5**
- **Tailwind CSS v4** + `@tailwindcss/vite` plugin
- **shadcn/radix-ui** components in `shared/components/ui/`
- Alias `@/` → `./src` (Vite resolve alias)

### Dev proxy
Vite dev server proxies `/api` → `http://localhost:3000`. Frontend calls `fetch('/api/...')`, not `fetch('http://localhost:3000/api/...')`.

### Entry points
- `src/main.tsx` → `src/app/App.tsx` → `src/app/router.tsx`
- `src/app/providers.tsx` — wraps QueryClient + Auth provider

### Feature structure
```
src/features/
  dashboard/components/
  week-entry/components/    ← WeekEntryPage, WeekDetailPage, WorkerWeekDetailPage, RecordForm, RecordList, WeekPreview
  workers/components/       ← WorkersPage, WorkerDashboardPage
  auth/components/
src/shared/
  api/          ← queries.ts, mutations.ts, client.ts
  components/ui/ ← shadcn components
  types/
```

### State & data fetching
- All API hooks live in `shared/api/queries.ts` (reads) and `mutations.ts` (writes).
- `useMutation` callbacks **must invalidate** affected query keys. Pattern: invalidate `["workers"]` prefix to bust dashboard/stats/history/week detail caches simultaneously.
- `staleTime` varies by query (10s–30s). No optimistic updates.

## Database Schema (Prisma)

- `Worker` — id, name (unique), isRegular, records[]
- `WorkRecord` — id, workerId, date, hours, hourlyRate, description, weekId
- `Week` — id, label, startDate, endDate, status ("draft" | "saved"), records[]

## Important Constraints

- **Backend build** = `tsc` (ESM, outputs to `dist/`). Must run `npm run db:generate` after schema changes or TS will fail on missing Prisma types.
- **Week status**: `draft` → can save; `saved` → editable via `updateWeek` (replaces all records). `saveWeek` rejects if already saved.
- **Authentication**: JWT stored in `localStorage` (see `useAuth.tsx`). Single master user seeded via `db:seed`.


## Code Style

- TypeScript strict mode (enforced in `tsconfig.base.json`).
- Don't autocommit or push — always ask the user first.
- Prefer small, focused functional components on the frontend.
