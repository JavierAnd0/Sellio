# ADR-0001 — Decisiones fundacionales de Sellio

**Estado:** Aceptado
**Fecha:** 2026-04-19
**Autor:** Fundador de Sellio

## Contexto

Este ADR captura las decisiones tomadas durante la planificación inicial del proyecto
Sellio (plataforma SaaS de loyalty cards para comercios colombianos). Todas fueron
evaluadas contra los siguientes condicionantes:

- **Recursos:** 1 persona part-time (~15–20 h/semana)
- **Capital inicial:** bajo (<$1.000 USD hasta primer dólar)
- **Mercado objetivo V1:** Colombia (restaurantes/cafeterías)
- **Tiempo hasta primer cliente pagando:** ~10 semanas
- **Riesgo principal identificado:** scope creep y features sin validación

## Decisiones

### D1 — Nombre del producto: Sellio

**Decisión:** el producto se llama Sellio (con doble L). Dominio `sellio.co`.

**Alternativas consideradas:** Selio (una L), varias opciones más cortas.

**Razones:** disponible en .co, pronunciable en español e inglés, 6 caracteres.

**Consecuencias:** todo el branding, código, copy, emails y documentación usan
la ortografía con doble L. Ver `packages/ui/src/components/logo.tsx` para el logo
canónico.

---

### D2 — Roadmap por milestones de negocio, no por fases de features

**Decisión:** reemplazamos el roadmap original de 8 fases (FASE 0–7) por 4 milestones
con criterios de salida medibles:

| Milestone | Criterio de salida |
|---|---|
| M1 — Validate | 15 entrevistas + 5 cartas de intención |
| M2 — First Dollar | 1 comercio pagando 2 meses consecutivos |
| M3 — First Ten | 10 comercios pagando, churn <15% |
| M4 — First Hundred | 100 comercios pagando, NPS >30 |

**Alternativas consideradas:** mantener el roadmap original de 8 fases con fechas.

**Razones:** un roadmap de tiempo es una promesa; un roadmap de milestones con
criterios es una hipótesis falsable. No se avanza al siguiente milestone sin cumplir
el criterio de salida. Esto protege contra el scope creep identificado como
riesgo principal.

**Consecuencias:** ningún cronograma tiene fechas fijas. Cada sprint semanal reporta
progreso hacia el milestone actual. El `PLAN.md` es la fuente de verdad.

---

### D3 — Colombia primero, no multi-mercado

**Decisión:** V1 es exclusivamente Colombia. Inglés, US y LATAM hispano (México,
Perú, Chile) son posteriores a M4.

**Alternativas consideradas:** lanzar Colombia + US simultáneamente.

**Razones:**
- Estar físicamente en Colombia multiplica la velocidad de entrevistas y onboarding
- Stripe no es viable para cobros domésticos colombianos (ver D6)
- Cumplimiento legal doble (Habeas Data + GDPR/CCPA) cuesta tiempo
- Un mercado = aprendizaje más rápido y accionable
- Colombia es mercado menos saturado (vs US donde compiten Smile.io, LoyaltyLion, Loopy Loyalty)

**Consecuencias:**
- Todo el copy en español desde día 1
- Precios en COP (no USD)
- i18n lista estructuralmente (keys, no strings hardcoded) pero sin traducción activa
- Soporte, legal, y marketing son colombianos
- La arquitectura permite agregar locales después sin refactor

---

### D4 — PWA + Wallet passes en M4, no app Flutter en M1-M3

**Decisión:** la app móvil Flutter del roadmap original se pospone indefinidamente.
Los clientes finales acceden a su tarjeta vía web (PWA instalable) y en M4 vía
Apple Wallet / Google Wallet passes.

**Alternativas consideradas:** Flutter desde Fase 5 como en el roadmap original.

**Razones:**
- Los clientes finales no son quienes pagan — no necesitan una app, necesitan ver
  su saldo de puntos
- Una PWA instalable cubre 90% del caso de uso con 10% del esfuerzo
- Apple Wallet / Google Wallet son más diferenciales (se ven nativos, notificaciones
  push nativas, geofencing) y no requieren publicar en stores
- Mantener una app Flutter con 1 desarrollador part-time es inviable (reviews,
  crash reports, builds, actualizaciones forzadas)

**Consecuencias:** `packages/` no incluye código Flutter. M4 incluirá
`passkit-generator` y `google-wallet-api`. Si la tracción post-M4 lo justifica,
Flutter entra como V2.

---

### D5 — Monorepo con Turborepo + pnpm, 2 apps + 6 packages

**Decisión:** monorepo con la siguiente estructura:

```
apps/
  web/    → dashboard del comercio (app.sellio.co)
  cards/  → tarjetas públicas del cliente final (s.sellio.co)
packages/
  ui/       → componentes compartidos (shadcn-style, Tailwind)
  db/       → cliente Supabase + types + migraciones
  domain/   → lógica de negocio pura (puntos, QR, rate limits)
  emails/   → React Email templates
  payments/ → abstracción de Wompi/Stripe
  config/   → tsconfig, eslint, tailwind compartidos
```

**Alternativas consideradas:**
- Repo único sin monorepo
- Monorepo con Nx
- Polyrepo (un repo por app/package)

**Razones:**
- 2 apps comparten branding, types, y lógica — DRY es barato con Turborepo
- Turborepo tiene caché remota vía Vercel sin configuración
- pnpm resuelve hoisting mejor que npm/yarn para monorepos
- Separar `web` (dashboard SSR pesado) de `cards` (pública ligera) permite
  optimizar bundle y deploy independientemente

**Consecuencias:** todo el código vive en un solo repo. Deploys independientes en
Vercel. `packages/*` se consumen vía pnpm workspaces sin build step (alias
TypeScript directo al `src/`).

---

### D6 — Wompi como PSP principal, Stripe post-M4

**Decisión:** los cobros a comercios colombianos se procesan con Wompi
(grupo Bancolombia).

**Alternativas consideradas:** Stripe, Mercado Pago, PayU.

**Razones:**
- **Stripe no procesa cobros domésticos en Colombia.** Solo acepta pagos
  internacionales recibidos por una entidad US/UK/etc. No sirve para cobrar
  suscripciones SaaS a clientes colombianos en COP
- Wompi soporta PSE, Nequi, Bancolombia, y tarjetas en COP
- Wompi tiene developer experience aceptable (docs, sandbox, webhooks firmados)
- Mercado Pago es alternativa viable pero la API es menos limpia

**Consecuencias:**
- `packages/payments` implementa interface `PaymentProvider` con `WompiProvider`
  como única implementación inicial
- `StripeProvider` se agrega en post-M4 cuando expandamos a US, sin refactor
- Wompi no tiene "subscriptions" nativas como Stripe — se emula con tokenización
  de tarjeta o links de cobro recurrente (decisión pendiente para M2.4)

---

### D7 — Supabase como backend: Auth + DB + Storage

**Decisión:** Supabase reemplaza al stack anterior de "Node.js + Express + Prisma +
PostgreSQL + Firebase Auth".

**Alternativas consideradas:**
- Backend propio con Node.js/Express + Postgres managed + Firebase Auth
- NextAuth + Postgres en Railway
- Clerk + Postgres en Neon

**Razones:**
- Auth + DB + Storage + Realtime en un solo vendor reduce complejidad operacional
  (crítico para solo part-time)
- Row Level Security (RLS) es la piedra angular: seguridad se verifica en BD, no
  en código, reduciendo superficie de bugs
- Elimina el backend Node.js/Express separado — Next.js Server Actions y Route
  Handlers con `@sellio/db/server` cubren el backend
- Free tier permite llegar a M3 sin pagar
- Cuando escale, Pro tier ($25/mes) es más barato que mantener Railway + Fly + Neon
  por separado

**Consecuencias:**
- Todas las tablas tienen RLS activo. Ver migraciones en `packages/db/migrations/`.
- Hay 3 clientes de Supabase: `client` (browser), `server` (SSR), `admin` (service-role)
- El `SUPABASE_SERVICE_ROLE_KEY` NUNCA se expone al cliente
- Cambiar de Supabase en el futuro es un refactor significativo, asumido como trade-off

---

### D8 — Append-only para todo lo que toque puntos/dinero

**Decisión:** las tablas `point_transactions`, `redemptions`, `invoices` y
`webhook_events` son append-only. Triggers de BD bloquean UPDATE y DELETE.

**Alternativas consideradas:** permitir UPDATE para "corregir errores" o
soft-delete con columna `deleted_at`.

**Razones:**
- Auditoría gratuita: cualquier punto de cualquier cliente se puede reconstruir
- Evita race conditions: insertar es atómico, actualizar no
- Facilita debugging: nunca pierdes información de qué pasó
- Regulatorio: cumple con Habeas Data y con buenas prácticas fiscales

**Consecuencias:**
- Corregir errores = insertar una `point_transaction` de tipo `adjust` con puntos
  negativos/positivos
- El cache `memberships.points` se mantiene vía trigger `after insert on point_transactions`
- Reportes complejos requieren agregar, no consultar estado actual

---

### D9 — QR dinámico firmado con HMAC-SHA256 para canjes

**Decisión:** el QR que el cliente final muestra al cajero para canjear puntos se
regenera cada 60 segundos con firma HMAC-SHA256 + nonce único.

**Alternativas consideradas:**
- QR estático con el membership ID
- Código numérico corto (4-6 dígitos)
- QR dinámico sin firma

**Razones:**
- QR estático permite capturar con foto y usarlo repetidamente (fraude)
- Código corto es vulnerable a brute-force
- HMAC + nonce + TTL corto previene replay attacks y forging
- `timingSafeEqual` para comparar firmas evita timing attacks

**Consecuencias:**
- Ver implementación en `packages/domain/src/qr/sign.ts` con tests
- Requiere tabla `qr_nonces` + `pg_cron` para limpieza
- El secret de firma (`QR_SIGNING_SECRET`) se genera con `openssl rand -hex 32`
  y vive como variable de entorno
- Para el QR del **comercio** (sticker en mostrador) no aplica esto — ese es estático
  y apunta a `s.sellio.co/in/:orgSlug` con rate limiting por IP y teléfono

---

### D10 — Upstash Redis pospuesto a M3+

**Decisión:** en M1-M2, rate limiting y cache se hacen en Postgres. Upstash Redis
se agrega solo si los datos de uso lo justifican.

**Alternativas consideradas:** incluir Upstash desde día 1 (como en stack original).

**Razones:**
- Un servicio menos que configurar, monitorear, y pagar
- Postgres maneja rate limiting bien hasta decenas de miles de requests/minuto
- Optimización prematura sin datos de uso es desperdicio
- Cuando lo agregues (M3+), la tabla `rate_limits` se deprecia con 1 migración

**Consecuencias:** ver funciones `increment_rate_limit` y tabla `rate_limits` en
migración 000004. Migrar a Upstash es reescribir `domain/src/rate-limit` sin tocar
llamadores.

---

### D11 — Ship semanal, feature flags para lo nuevo

**Decisión:** cada semana hay al menos un commit desplegado a producción. Cada
feature nueva entra detrás de un feature flag.

**Alternativas consideradas:** sprints quincenales, ramas long-lived.

**Razones:**
- Part-time solo pierde ritmo con ciclos largos
- Feature flags permiten apagar algo roto sin rollback (rollback es lento en Vercel)
- Tabla `feature_flags` en BD es suficiente hasta M3+ (PostHog/Unleash después)

**Consecuencias:** ver tabla `feature_flags` en migración 000005. Helper
`isFeatureEnabled(flag, orgId)` pendiente para `packages/domain`.

## Decisiones deliberadamente pospuestas

- **Proveedor de SMS para OTP:** Twilio vs MessageBird. Decide en M2.3.
- **Modelo de cobro recurrente en Wompi:** tokenización de tarjeta vs link de cobro
  mensual. Decide en M2.4 después de probar sandbox.
- **Multi-tenancy de subdominios personalizados** (`mi-cafeteria.sellio.co`): V2.
- **API pública para comercios:** V2.
- **Soporte para multi-sucursal:** V2.
