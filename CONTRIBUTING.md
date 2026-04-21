# Contribuir a Sellio

Esta guía aplica tanto para el dueño del proyecto como para cualquier colaborador
futuro. La disciplina acá documentada es lo que hace posible mover rápido sin
romper cosas.

## Reglas de oro

1. **Cada commit a `main` debe ser deployable.** Si algo no está terminado, queda
   detrás de un feature flag.
2. **Ship weekly.** Aunque sea una línea de documentación, cada semana hay
   al menos un merge a `main`.
3. **No construyas features que ningún cliente pagando pidió.** Excepción:
   refactors técnicos explícitamente decididos.
4. **Si dudas si construir algo, no lo construyas.** Registra la idea en
   `docs/ideas/` y vuelve a ella después de un milestone.

## Flujo de trabajo

1. Revisar el ticket en `PLAN.md` (formato `MX.Y-ZZ`)
2. Crear branch: `git checkout -b <tipo>/<ticket>-<desc-corta>`
   - `feat/M2.1-01-setup-monorepo`
   - `fix/M2.3-checkin-rate-limit`
   - `chore/update-deps`
3. Commits con [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` nueva funcionalidad
   - `fix:` corrección de bug
   - `refactor:` cambio interno sin afectar comportamiento
   - `docs:` documentación
   - `test:` agregar o corregir tests
   - `chore:` tooling, deps, config
   - `perf:` mejora de performance
   - `ci:` cambios de CI/CD
4. Abrir PR a `main` — CI debe pasar (lint + typecheck + test + format)
5. Squash merge para mantener historial limpio en `main`

## Convenciones de código

### TypeScript

- `strict: true` activo siempre. Si algo requiere `any`, documenta por qué en el mismo archivo.
- Preferir `type` sobre `interface` para objetos de dominio; `interface` para extensibles (plugins, providers)
- Imports ordenados: built-in → externos → `@sellio/*` → relativos. ESLint lo fuerza.
- Nada de `console.log` en código de producción. Usar logger estructurado.

### Naming

- Archivos: `kebab-case.ts` (no `camelCase.ts` ni `PascalCase.ts`)
- Componentes React: nombres en PascalCase, archivo en kebab-case (`button.tsx` exporta `Button`)
- Funciones: `camelCase`, verbos (`calculatePoints`, `verifyWebhook`)
- Tipos: `PascalCase`, sustantivos (`QrPayload`, `CheckoutSession`)
- Constantes: `SCREAMING_SNAKE_CASE` solo para valores realmente inmutables y globales
- Booleans: prefijos `is`, `has`, `can`, `should` (`isActive`, `canRedeem`)

### Estructura de archivos

```
src/
├── app/              # Rutas Next.js (App Router)
│   └── (groups)/     # Route groups para layouts
├── components/       # Componentes React específicos de la app
│   ├── forms/
│   └── dashboard/
├── lib/              # Utilities específicas de la app
│   ├── auth.ts
│   └── validation.ts
├── hooks/            # Custom hooks
└── middleware.ts
```

Si un componente/util crece más allá de un archivo, crear directorio:
```
components/card-editor/
├── index.tsx         # export principal
├── card-preview.tsx
├── card-form.tsx
└── card-editor.test.tsx
```

## Testing

### Qué testear

- **Siempre:** lógica de dominio (`packages/domain/`)
- **Siempre:** utilidades de seguridad (QR, rate limiting, HMAC)
- **Siempre:** transformaciones de datos (parsers, validators)
- **A veces:** componentes React con lógica interna
- **Casi nunca:** componentes presentacionales puros (no aportan ROI)
- **E2E (futuro, post-M2):** flujos críticos completos con Playwright

### Regla del "test que hubiera atrapado el bug"

Cuando un bug llega a producción, el test que lo hubiera atrapado es obligatorio
antes de cerrar el fix. No hacemos TDD dogmático pero sí TDT (Test Driven
Triage).

### Correr tests

```bash
pnpm test                       # todos los tests una vez
pnpm test:watch                 # modo watch
pnpm --filter @sellio/domain test   # solo un package
```

## Base de datos

### Migraciones

- Archivo por migración, timestamp al inicio:
  `packages/db/migrations/YYYYMMDD_HHMMSS_description.sql`
- Cada migración forward tiene su par `_down.sql` con el rollback
- NO editar migraciones ya aplicadas a cualquier ambiente — crear una nueva
- Las migraciones deben ser idempotentes cuando sea posible (`IF NOT EXISTS`)

### RLS

- Toda tabla nueva debe tener RLS habilitada **en la misma migración** que la crea
- Al menos una policy debe definirse — no dejar tablas con RLS on pero sin policies
  (bloquea todo acceso incluso legítimo)
- Para tablas solo accesibles vía service-role: habilitar RLS y no crear policies

### Consultas

- Preferir queries tipadas vía cliente Supabase sobre SQL raw
- Si necesitas SQL complejo, encapsularlo en una función de Postgres (`CREATE FUNCTION`)
  y llamarla via `.rpc()`
- Nunca concatenar input de usuario en SQL — usar parámetros

## Commits y PRs

### Buen commit

```
feat(auth): add OTP verification for new customers

Cuando un cliente desconocido intenta hacer check-in, ahora enviamos
OTP por SMS vía Twilio en lugar de crear la membership directamente.

Rate limit: 3 intentos por teléfono cada 15 min.

Closes #M2.3-05
```

### Mal commit

```
updates
```

### Buen PR

- Un concepto por PR. Si hay 2 cambios lógicamente distintos, 2 PRs.
- Máx 400 líneas cambiadas cuando sea posible. PRs grandes se revisan mal.
- Descripción explica **qué** y **por qué**, no repite el código.
- Screenshots/GIFs si toca UI.

## Cuándo crear un ADR

Crear ADR (`docs/adr/XXXX-titulo.md`) cuando:

- Eliges un proveedor externo (DB, auth, email, pagos, hosting)
- Defines una convención arquitectural (cómo hacer X en general)
- Tomas una decisión que sería costoso revertir en 6 meses
- Rechazas una tecnología que otros podrían esperar que uses

NO crear ADR para:

- Bugs individuales (eso va en post-mortem si fue grave)
- Cambios tácticos reversibles
- Tickets normales del sprint

## Ideas y features fuera de alcance

Cuando tienes una idea pero estás en medio de otro milestone:

1. **Crear un issue en GitHub con label `idea`**
2. **NO abrir branch ni código**
3. Al final del milestone actual, en la retro, evaluar si entra al siguiente

El 80% de las ideas que pospones resultan no valer la pena cuando las revisas
después. Ese filtro es parte del proceso.

## Cuándo pedir ayuda

Si después de 2 horas de bloqueo no encuentras la causa:

1. Escribe el problema en un doc (fuerza claridad)
2. Relee el código con ojos frescos
3. Pide review a un segundo par de ojos (si no estás solo)
4. Considera hacer el mínimo feo y volver después con la solución bonita

Lo peor es pasar un día completo atascado. Mejor enviar el PR con un `TODO`
claramente marcado y volver.
