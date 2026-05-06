# Plan: Permitir modificar semanas guardadas

## Problema
El backend bloquea agregar/eliminar registros en semanas con status `saved`:
- `records.service.ts:34-36` → "Cannot add records to a saved week"
- `records.service.ts:62-64` → "Cannot delete records from a saved week"

La documentación (`01 - Business rules.md`) dice que las semanas guardadas son inmutables.

## Análisis del flujo actual

### ¿Cómo funciona la edición de semanas hoy?

1. El frontend en `WeekEntryPage.tsx` ya soporta modo edición (`isEditing`) cuando recibe un `id` por URL
2. Al guardar en modo edición, usa `updateWeek()` que:
   - Elimina todos los registros de la semana (`deleteByWeek`)
   - Crea nuevos registros (`createMany`)
   - Mantiene el status `saved` (sin transición)

### ¿Cuál es el problema real?

El usuario puede entrar a editar una semana guardada, pero al intentar **agregar o eliminar registros individualmente** desde la UI, el backend lo rechaza con:
- `"Cannot add records to a saved week"` — al llamar `POST /records`
- `"Cannot delete records from a saved week"` — al llamar `DELETE /records/:id`

Esto rompe la experiencia de edición progresiva. El usuario tiene que ir directo al preview sin hacer cambios individuales.

## Cambios realizados

### ✅ 1. Backend — `records.service.ts`

**Método `create`:** Eliminado el check `if (week.status === "saved")`. El método ahora solo valida:
- Duplicados
- Existencia de la semana
- Crea el registro sin importar el status

**Método `delete`:** Eliminado el check `if (record.week.status === "saved")`. El método ahora solo valida:
- Existencia del registro
- Elimina el registro sin importar el status de la semana

### ✅ 2. Documentación — `01 - Business rules.md`

**Sección 3.2 (Estados de una semana):**
- Anterior: `"saved": No se pueden modificar sus registros`
- Nuevo: `"saved": Puede editarse agregando o eliminando registros`

**Sección 3.3 (Reglas de guardado):**
- Anterior: "pasa a estado `saved` y sus registros se vuelven inmutables"
- Nuevo: "pasa a estado `saved` y puede seguir editándose (agregar/eliminar registros)"
- Agregado: nota sobre `updateWeek` para reemplazo masivo de registros

### ⚠️ No tocado

- `weeks.service.ts:147` ("Week is already saved") — este check es correcto. Previene el doble-guardado. Para actualizar semanas guardadas se usa `updateWeek()` (línea 212).
- `weeks.service.ts:149` (`deleteByWeek`) y `weeks.service.ts:151` (`createMany`) en el método `saveWeek` — estas operaciones hacen el reemplazo masivo como parte del flujo de guardado inicial.
