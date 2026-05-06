# Plan: Mejoras de fechas, semanas, dashboard de trabajadores + Clean Code/SOLID/React

## 1. Fechas en español + número de semana

### Problema actual
- `week-calculator.ts` genera labels como `"apr 27 - may 3, 2026"` (en inglés)
- `formatters.ts` usa `en-US` locale para fechas
- No hay cálculo de número de semana ISO

### Cambios

#### 1.1 Backend — `week-calculator.ts`
- Cambiar `formatLabel()` para usar locale `es-ES` en lugar de `en-US`
- Agregar método `getWeekNumber(date: Date)` que calcule el número ISO de semana
- Modificar `formatLabel()` para incluir el número de semana: `"Semana 20 · 27 abr - 3 may 2026"`

#### 1.2 Frontend — `formatters.ts`
- Cambiar `formatDate()` para usar locale `es-ES`
- Cambiar `formatDateShort()` para usar locale `es-ES`
- Agregar `formatDateWithYear(dateStr: string)` → formato `dd/mm/yyyy` (ej: `27/04/2026`)

#### 1.3 Frontend — `WeekCard.tsx`
- El label ya viene del backend, no necesita cambios (se muestra directo)

#### 1.4 Frontend — Dashboard y otras vistas que usen fechas
- Usar `formatDateWithYear` donde se muestren fechas individuales en formato día/mes/año

---

## 2. Selector de semana para agregar registros

### Problema actual
- `WeekEntryPage` solo funciona con la semana actual (`getOrCreateCurrentWeek`)
- No se pueden agregar registros a semanas pasadas

### Cambios

#### 2.1 Backend — `weeks.service.ts`
- Agregar método `listAllWeeks()` que devuelva todas las semanas (draft + saved), no solo saved
- El endpoint `GET /weeks` actualmente solo devuelve saved (usa `findAllSaved`). Modificar para incluir draft también, o crear nuevo endpoint `GET /weeks/all`

#### 2.2 Backend — `routes.ts`
- Agregar nuevo endpoint `GET /weeks/available` que liste semanas disponibles para edición

#### 2.3 Frontend — `queries.ts`
- Agregar hook `useAvailableWeeks()` que llame al nuevo endpoint

#### 2.4 Frontend — `WeekEntryPage.tsx`
- Agregar selector de semana (dropdown) en la parte superior
- Si el usuario selecciona una semana existente → modo edición (`isEditing = true`)
- Si el usuario selecciona "Nueva semana" → comportamiento actual (semana actual draft)
- El selector muestra: label de la semana (ya incluye número + fechas en español) + badge de status

#### 2.5 Frontend — `mutations.ts`
- `useAddRecord` ya funciona con cualquier `weekId`, no necesita cambios

---

## 3. Nueva página de dashboard por trabajador

### Problema actual
- `WorkersPage` muestra stats inline con 4 números (total horas, ganancias, semanas, costo prom)
- No muestra las semanas individuales del trabajador

### Cambios

#### 3.1 Backend — `workers.service.ts`
- El método `getHistory()` ya existe y devuelve semanas con registros del trabajador
- Agregar método `getDashboard(workerId: string)` que combine:
  - Stats actuales (totalHours, totalEarnings, weeksActive, averageHourlyRate)
  - Lista de semanas del trabajador (weekId, label, startDate, endDate, totalHours, totalEarnings, status)
- O reutilizar `getHistory()` y agregarle el status de cada semana

#### 3.2 Backend — `routes.ts`
- Agregar endpoint `GET /workers/:id/dashboard` (o modificar el history existente para incluir más datos)

#### 3.3 Frontend — Tipos (`shared/types/index.ts`)
- Agregar interfaz `WorkerDashboard`:
  ```typescript
  interface WorkerDashboard {
    stats: WorkerStats;
    weeks: Array<{
      weekId: string;
      label: string;
      startDate: string;
      endDate: string;
      totalHours: number;
      totalEarnings: number;
      status: 'draft' | 'saved';
      recordCount: number;
    }>;
  }
  ```

#### 3.4 Frontend — `queries.ts`
- Agregar hook `useWorkerDashboard(workerId: string)`

#### 3.5 Frontend — Nueva página `WorkerDashboardPage.tsx`
- Ruta: `/workers/:id/dashboard`
- Mostrar:
  - Header con nombre del trabajador y botón volver
  - Cards de estadísticas (total horas, ganancias, semanas activas, costo promedio)
  - Tabla/lista de semanas del trabajador con:
    - Label (Semana N · fechas)
    - Status (draft/saved)
    - Total horas
    - Total ganancias
    - Cantidad de registros
    - Link para editar la semana (`/weeks/:id`)
- Ordenar semanas más recientes primero

#### 3.6 Frontend — `WorkersPage.tsx`
- Reemplazar el `WorkerStatsCard` inline con un botón "Ver dashboard" que navegue a `/workers/:id/dashboard`
- Eliminar el componente `WorkerStatsCard` o simplificarlo

#### 3.7 Frontend — Router (`App.tsx` o `router.tsx`)
- Agregar ruta `/workers/:id/dashboard` → `WorkerDashboardPage`

---

## 4. Refactor Clean Code + SOLID + React Mini-Componentes

### 4.1 Backend — Eliminar duplicación en `weeks.service.ts`
- **Problema**: `getCurrentWeek()` y `getWeekDetail()` son casi idénticas (30+ líneas duplicadas)
- **Problema**: `saveWeek` y `updateWeek` tienen lógica idéntica de delete+createMany
- **Problema**: `totalsByWorker()` se llama dos veces seguidas en varias líneas
- **Solución**: Extraer métodos privados:
  - `buildWeekWithTotals(week, records)` → construye `WeekWithTotals`
  - `replaceWeekRecords(weekId, records)` → delete + createMany
  - Cachear resultado de `totalsByWorker()` en variable

### 4.2 Backend — Inyección de dependencias (DIP)
- **Problema**: `WeekApplicationService`, `RecordApplicationService`, `WorkerApplicationService` instancian `new WeekCalculator()` y `new TotalsCalculator()` internamente
- **Solución**: Inyectar calculators via constructor para testabilidad
  ```typescript
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly workerRepo: WorkerRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly totalsCalc: TotalsCalculator
  ) {}
  ```
- **Problema**: Repositorios Prisma importan directamente el singleton `prisma`
- **Solución**: Inyectar `PrismaClient` via constructor en cada repositorio

### 4.3 Frontend — Extraer `useWeekEntryFlow` hook (SRP)
- **Problema**: `WeekEntryPage.tsx` (200 líneas) maneja: data fetching, step management, preview logic, save/update logic, error handling, navigation
- **Solución**: Extraer custom hook `useWeekEntryFlow(weekId?)` que encapsule toda la lógica de negocio. El componente queda solo con rendering.

### 4.4 Frontend — Descomponer `WorkersPage.tsx` (SRP + Mini-Componentes)
- **Problema**: `WorkersPage.tsx` (300 líneas) maneja: CRUD, filtering, stats, form state, inline stats card
- **Solución**: Extraer componentes:
  - `WorkerList` → lista de trabajadores con cards
  - `WorkerCard` → card individual con acciones
  - `WorkerForm` → formulario create/edit (ya existe inline, extraer)
  - `WorkerFilters` → badges de filtro (all/regular/occasional)
  - `useWorkerManagement` hook → lógica de CRUD + filtering

### 4.5 Frontend — Componente compartido `Spinner` (DRY)
- **Problema**: El mismo spinner está duplicado en 5+ archivos
- **Solución**: Crear `shared/components/ui/spinner.tsx` y usarlo en todos lados

### 4.6 Frontend — Consolidar tipos duplicados (DRY)
- **Problema**: `packages/shared/src/types/index.ts` y `apps/frontend/src/shared/types/index.ts` tienen tipos casi idénticos
- **Solución**: Frontend importa de `packages/shared`, eliminar duplicado

### 4.7 Frontend — `WorkerSelector` no debe fetchear datos internamente (SRP)
- **Problema**: `WorkerSelector` llama `useWorkers()` internamente — cada instancia del componente dispara su propia query
- **Solución**: Recibir `workers` como prop, el padre ya tiene los datos

### 4.8 Frontend — Usar shadcn `Select` en vez de `<select>` nativo
- **Problema**: `WorkerSelector.tsx` y `WorkersPage.tsx` usan `<select>` raw en vez del componente shadcn
- **Solución**: Reemplazar con `Select` de `shared/components/ui/select.tsx` para consistencia

### 4.9 Backend — Error handler con registry pattern (OCP)
- **Problema**: `error.handler.ts` tiene cadena de `instanceof` — agregar nuevo error requiere modificar el archivo
- **Solución**: Cada clase de error define su propio `statusCode`, el handler solo lee `err.statusCode ?? 500`

### 4.10 Backend — Constantes en vez de magic numbers
- **Problema**: `100` para rounding en `totals-calculator.ts`, `hours: 8` / `hourlyRate: 15` como defaults en `RecordForm`
- **Solución**: Extraer constantes nombradas: `DECIMAL_PRECISION = 100`, `DEFAULT_HOURS = 8`, `DEFAULT_HOURLY_RATE = 15`

---

## 5. Documentación (dev-notes)

### 5.1 `01 - Business rules.md`
- Sección 3.1: Agregar que el label de semana incluye número ISO de semana + rango de fechas en español
- Sección 4.2: Actualizar regla de fechas — ahora se pueden agregar registros a cualquier semana pasada, no solo la semana actual
- Sección 2.4: Actualizar administración de trabajadores — ahora incluye dashboard dedicado con historial de semanas

### 5.2 `04 - Frontend spec.md`
- Sección 5.2 (Dashboard): Actualizar formato de fechas en tarjetas
- Sección 5.3 (Week Entry): Agregar selector de semana
- Sección 5.5 (Workers): Actualizar con nueva página de dashboard por trabajador
- Sección 3 (Estructura): Agregar `WorkerDashboardPage.tsx` y componentes extraídos

### 5.3 `03 - API spec.md` (si existe)
- Agregar endpoint `GET /weeks/available`
- Agregar endpoint `GET /workers/:id/dashboard`

---

## Resumen de archivos a modificar

### Backend
- `apps/backend/src/domain/services/week-calculator.ts` — locale es-ES + week number
- `apps/backend/src/domain/services/totals-calculator.ts` — constantes
- `apps/backend/src/application/weeks/weeks.service.ts` — eliminar duplicación, inyectar deps
- `apps/backend/src/application/records/records.service.ts` — inyectar deps
- `apps/backend/src/application/workers/workers.service.ts` — getDashboard, inyectar deps
- `apps/backend/src/infrastructure/persistence/prisma/*.prisma-repository.ts` — inyectar PrismaClient
- `apps/backend/src/infrastructure/http/routes.ts` — nuevos endpoints
- `apps/backend/src/infrastructure/http/controllers/weeks.controller.ts` — nuevo handler
- `apps/backend/src/infrastructure/http/controllers/workers.controller.ts` — nuevo handler
- `apps/backend/src/infrastructure/http/middleware/error.handler.ts` — registry pattern

### Frontend
- `apps/frontend/src/shared/utils/formatters.ts` — locale es-ES + nuevo formatter
- `apps/frontend/src/shared/types/index.ts` — WorkerDashboard type, consolidar con packages/shared
- `apps/frontend/src/shared/api/queries.ts` — useAvailableWeeks, useWorkerDashboard
- `apps/frontend/src/shared/components/ui/spinner.tsx` — NUEVO componente compartido
- `apps/frontend/src/features/dashboard/components/WeekCard.tsx` — sin cambios (label viene del backend)
- `apps/frontend/src/features/week-entry/components/WeekEntryPage.tsx` — selector de semana + extraer hook
- `apps/frontend/src/features/week-entry/components/WeekEntryFlow.ts` — NUEVO hook
- `apps/frontend/src/features/week-entry/components/WorkerSelector.tsx` — recibir workers como prop, usar shadcn Select
- `apps/frontend/src/features/workers/components/WorkersPage.tsx` — descomponer en sub-componentes
- `apps/frontend/src/features/workers/components/WorkerList.tsx` — NUEVO
- `apps/frontend/src/features/workers/components/WorkerCard.tsx` — NUEVO
- `apps/frontend/src/features/workers/components/WorkerFilters.tsx` — NUEVO
- `apps/frontend/src/features/workers/components/WorkerDashboardPage.tsx` — NUEVO
- `apps/frontend/src/app/router.tsx` (o App.tsx) — nuevas rutas

### Documentación
- `dev-notes/Projects/weekly-hours-calculator/01 - Business rules.md`
- `dev-notes/Projects/weekly-hours-calculator/04 - Frontend spec.md`
- `dev-notes/Projects/weekly-hours-calculator/03 - API spec.md` (si existe)

---

## Orden de ejecución recomendado

1. **Backend base**: week-calculator (español + week number) → types/constants
2. **Backend endpoints**: weeks/available + workers/dashboard
3. **Frontend base**: formatters (español) + spinner component + types consolidation
4. **Frontend features**: WeekEntryPage con selector → WorkerDashboardPage
5. **Refactor**: Descomponer WorkersPage → extraer hooks → inyectar deps backend
6. **Documentación**: Actualizar todos los specs
