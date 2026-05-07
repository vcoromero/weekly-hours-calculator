# Weekly Hours Tracker

Aplicacion web para registrar y calcular horas de trabajo semanales por empleado. Permite registrar jornadas con fecha, horas trabajadas y tarifa horaria, organizar los registros en semanas con estado draft/saved, y visualizar resumenes por trabajador.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19, Vite 8, TypeScript 5.6 |
| Backend | Express 5, TypeScript 5.6 |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma |
| Monorepo | NX 22 |
| Estilos | Tailwind CSS 4, shadcn/ui |
| Routing | react-router v7 |
| Fetching | TanStack Query v5 |
| Auth | JWT + bcrypt |

## Requisitos

- Node.js >= 18
- Docker + Docker Compose
- PostgreSQL (via Docker)

## Inicio rapido

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno del backend
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env con los valores correctos

# Crear archivo .env en raiz para Docker Compose
# POSTGRES_USER=...
# POSTGRES_PASSWORD=...
# POSTGRES_DB=...

# Iniciar base de datos
npm run docker:up

# Ejecutar migraciones y seed
npm run db:generate
npm run db:migrate
npm run db:seed

# Iniciar desarrollo (frontend + backend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api

Mas detalles tecnicos en [AGENTS.md](./AGENTS.md).
