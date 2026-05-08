# Weekly Hours Tracker

Web application for tracking and calculating weekly work hours per employee. It allows logging shifts with date, hours worked, and hourly rate, organizing records into weeks with draft/saved status, and viewing summaries per worker.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TypeScript 5.6 |
| Backend | Express 5, TypeScript 5.6 |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Monorepo | NX 22 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Routing | react-router v7 |
| Data Fetching | TanStack Query v5 |
| Auth | JWT + bcrypt |

## Requirements

- Node.js >= 18
- Docker + Docker Compose
- PostgreSQL (via Docker)

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure backend environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with the correct values

# Create root .env file for Docker Compose
# POSTGRES_USER=...
# POSTGRES_PASSWORD=...
# POSTGRES_DB=...

# Start the database
npm run docker:up

# Run migrations and seed
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development (frontend + backend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api

More technical details in [AGENTS.md](./AGENTS.md).
