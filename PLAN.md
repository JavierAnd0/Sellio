# Sellio — Plan de Desarrollo

**Versión:** 1.0
**Fecha:** Abril 2026
**Owner:** Tú
**Audiencia:** Tú (y eventualmente tu equipo)

---

## Cómo usar este documento

Este plan está organizado de lo estratégico a lo táctico. Léelo en este orden la primera vez:

1. **Parte I — Estrategia**: define en qué estás apostando y por qué
2. **Parte II — Arquitectura**: decisiones técnicas que no debes re-litigar cada semana
3. **Parte III — Plan de ejecución**: qué haces cada milestone, en qué orden
4. **Parte IV — Operación**: cómo despliegas, monitoreas, y respondes a incidentes
5. **Parte V — Anexos**: referencias rápidas (schema de BD, endpoints, convenciones)

Después úsalo como manual de consulta. Si un ticket no encaja en lo que dice acá, o lo pasas al backlog de V2, o actualizas el plan explícitamente. No escribas código que contradiga el plan sin actualizarlo primero.

---

# PARTE I — ESTRATEGIA

## 1. Visión del producto

**Sellio** (tentativo) es una plataforma SaaS que permite a comercios colombianos crear, personalizar y gestionar programas de fidelización digitales sin escribir código. Los comercios emiten "tarjetas" digitales a sus clientes; los clientes acumulan puntos escaneando QR en cada visita; los comercios canjean puntos por beneficios definidos por ellos.

**Propuesta de valor única para el mercado colombiano:**
- Setup en menos de 10 minutos sin conocimientos técnicos
- Cobro en pesos colombianos (COP) vía Wompi/Mercado Pago, no USD
- Sin app para el cliente final — solo link o QR que guardan en su teléfono
- Precios accesibles para negocios pequeños colombianos

**Lo que Sellio NO es (scope guardado):**
- No es una app nativa (eso es V2)
- No es multi-sucursal complejo en V1 (eso es V2)
- No es marketplace de programas de lealtad (los usuarios finales no descubren negocios aquí)
- No es CRM completo (analytics básicos sí, funnels complejos no)

## 2. Mercado objetivo (M1–M4)

**Vertical primario:** restaurantes y cafeterías en Colombia
**Geografía inicial:** Bogotá, Medellín, Cali (donde están las entrevistas de validación más fáciles)
**Tamaño del cliente ideal:** negocios con 50–500 clientes recurrentes por mes
**Persona del decisor:** dueño o administrador del local, 28–45 años, usa Instagram Business pero no tiene programa de lealtad digital

## 3. Los 4 milestones (reemplaza el roadmap de 8 fases)

| Milestone | Objetivo | Criterio de salida | Semanas part-time |
|---|---|---|---|
| M1 — Validate | Confirmar disposición a pagar | 15 entrevistas + 5 cartas de intención firmadas | 3–4 |
| M2 — First Dollar | Cobrar al primer cliente real | 1 comercio pagando $35.000/mes por 2 meses seguidos | 8–10 |
| M3 — First Ten | Llegar a 10 comercios activos | 10 comercios pagando, churn mensual < 15% | 6–8 |
| M4 — First Hundred | Escalar a 100 clientes | 100 comercios pagando, NPS > 30, MRR > $3.500.000 COP | 10–12 |

**Regla de oro:** no avanzas de milestone sin cumplir el criterio de salida. Si M2 tarda 14 semanas en lugar de 10, no avanzas a M3 — iteras hasta cumplir. Esto es lo que evita el scope creep que tu propio documento marca como riesgo #1.

**Tiempo total hasta M4:** ~30 semanas part-time ≈ 7–8 meses calendario con 15–20 h/semana.

## 4. Principios operativos

Estos principios te van a proteger de decisiones malas cuando estés cansado:

1. **Ship weekly, aunque sea pequeño.** Cada semana debe haber un commit a producción (aunque sea una corrección de copy). Los sprints quincenales para part-time son demasiado largos — pierdes el ritmo.
2. **Feature flag todo lo nuevo.** Cada feature nueva entra detrás de un flag. Si rompe algo en producción, apagas el flag, no rollback. Esto es crítico para alguien que trabaja solo sin QA.
3. **Base de datos inmutable hasta M2.** Cada migración es un riesgo. En M1 usas schema fijo, en M2 aprendes a hacer migraciones bien. No acumules deuda.
4. **Si lo dudas, no lo construyas.** Feature que no tiene un cliente pagando pidiéndola se posterga a V2.
5. **No optimices antes de tiempo.** Sin datos de uso real, no sabes qué es lento. Query de 2 segundos en desarrollo con 10 registros puede ser excelente con 10.000.
6. **Escribe tests donde duele el bug.** No TDD dogmático. Pero cuando un bug llegue a producción, el test que lo hubiera atrapado es obligatorio antes de cerrar el ticket.
7. **Documenta decisiones, no código.** Cada decisión arquitectural importante → ADR (Architecture Decision Record) en `/docs/adr/`. El código explica el "qué", los ADR explican el "por qué".

---

# PARTE II — ARQUITECTURA Y DECISIONES TÉCNICAS

## 5. Stack final (confirmado)

| Capa | Tecnología | Justificación |
|---|---|---|
| Monorepo | Turborepo | Caché de builds, tareas paralelas, bajo overhead para solo dev |
| Frontend web | Next.js 14 (App Router) + Tailwind + Zustand | Ya decidido, consistente con mockups |
| UI components | shadcn/ui (copy-paste, no package) | Control total, mockups actuales encajan |
| Auth + DB + Storage + Realtime | Supabase | Un solo vendor, RLS nativo, elimina backend separado |
| Pagos (COP) | Wompi (principal) | PSP colombiano, soporta PSE/Nequi/tarjetas COP |
| Pagos (USD, futuro) | Stripe (abstracción ya en código) | Para cuando expandas a US |
| QR | qrcode.js (generación) + HMAC-SHA256 (firma) | Anti-fraude, expiración |
| PDF de tarjetas | jsPDF | Para que comercio imprima "carnet físico" si quiere |
| Email | Resend | DX excelente, React Email templates |
| Hosting | Vercel | Next.js nativo, preview deploys por PR |
| Cache | NINGUNO en M1-M2 | Postponer Upstash hasta M3+ con datos de uso |
| Mobile | Flutter (V2, post-M4) | No construir en M1-M4 |
| Wallet passes | passkit-generator (Apple) + google-wallet-api | M3/M4 como diferenciador |
| Observabilidad | Sentry (errores) + Vercel Analytics + Supabase Logs | Gratis/low-cost, suficiente hasta M4 |
| Feature flags | PostHog (free tier) o simple tabla en BD | Empieza con tabla, migra si crece |
| CI/CD | GitHub Actions | Nativo con Vercel |

## 6. Estructura del monorepo

```
sellio/
├── apps/
│   ├── web/                    # Next.js 14 — dashboard del comercio
│   ├── cards/                  # Next.js 14 — app pública donde cliente ve su tarjeta (PWA)
│   └── admin/                  # Next.js 14 — panel interno para ti (V2, no M1-M2)
├── packages/
│   ├── ui/                     # shadcn/ui + componentes propios reutilizables
│   ├── db/                     # Cliente Supabase + types + migraciones
│   ├── config/                 # eslint, tsconfig, tailwind bases compartidas
│   ├── domain/                 # Lógica de negocio pura (calcular puntos, validar QR, etc.)
│   ├── emails/                 # React Email templates
│   └── payments/               # Abstracción Wompi/Stripe
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── api/                    # OpenAPI spec
│   └── runbooks/               # Procedimientos para incidentes comunes
├── scripts/                    # Scripts de ops (backups, seeds, migraciones)
├── .github/workflows/          # CI/CD
├── turbo.json
├── package.json
└── PLAN.md                     # Este archivo
```

**Decisión clave:** separar `apps/web` (dashboard del comercio) de `apps/cards` (página pública de la tarjeta del cliente). Son productos diferentes con users diferentes, bundles diferentes, y puedes desplegarlos a dominios diferentes (`app.sellio.co` vs `s.sellio.co/:cardSlug`). Compartan `packages/*`.

**Package manager:** pnpm. Turborepo funciona mejor con pnpm que con npm, y el monorepo te va a dar mejor DX.

## 7. Modelo de datos

El schema está diseñado pensando en las reglas de negocio que ya tienes (tiers, puntos, QR con seguridad). Los detalles completos están en el **Anexo A — Schema de base de datos**.

Las entidades principales:

- `organizations` — el negocio (cafetería, restaurante). Uno a uno con el usuario inicial en M1, multi-user en M3+.
- `users` — manejado por Supabase Auth (`auth.users`), con `profiles` como extensión.
- `cards` — las plantillas de tarjeta que un comercio crea. Una org puede tener varias (ej: "Tarjeta VIP" y "Tarjeta Regular").
- `customers` — los clientes finales. Se identifican por teléfono (más práctico que email en Colombia).
- `memberships` — la relación cliente ↔ tarjeta. Cada membership tiene un `slug` único que es lo que se comparte públicamente.
- `point_transactions` — append-only. Nunca borrar, solo revertir con otra transacción.
- `redemptions` — cuando un cliente canjea puntos por un beneficio.
- `qr_tokens` — QR firmados con TTL cortísimo (30–60 seg) para validaciones en mostrador.
- `subscriptions` — plan del comercio y su estado con Wompi.

**Principio de diseño:** todo lo que involucre dinero (puntos, redenciones, pagos) es **append-only**. No actualizas registros, creas nuevos. Esto te da auditabilidad gratis y evita race conditions.

## 8. Seguridad del QR — esto sí se define bien desde día 1

El QR es la superficie más atacable del sistema. Un cliente malicioso podría intentar sumarse puntos repetidamente escaneando el mismo QR. Las medidas:

### Flujo "cliente escanea QR del negocio para sumar puntos"

Este es el flujo más común. El negocio tiene un QR en mostrador, el cliente lo escanea.

El QR del negocio apunta a una URL del tipo:
```
https://s.sellio.co/check-in/{orgSlug}?loc={locationId}
```

El QR **no cambia** — es un sticker físico. La seguridad está en el servidor:
- Cliente al escanear llega a la página, se identifica (teléfono + OTP si es nueva membership, o sesión existente)
- El servidor valida: rate limit por teléfono (max 1 check-in por org cada 30 min), rate limit por IP, detección de ubicación sospechosa
- Si pasa, crea `point_transactions(type='earn', ...)`

### Flujo "negocio escanea QR del cliente para validar"

Usado para canjes. El cliente muestra su tarjeta (que tiene QR), el cajero escanea.

Aquí el QR **sí tiene que ser dinámico y firmado**. El QR en la tarjeta del cliente no es estático — se regenera cada 30 segundos con:

```
Payload: { membershipId, timestamp, nonce }
Firma: HMAC-SHA256(payload, secret_del_comercio)
QR content: base64url(payload) + "." + base64url(firma)
```

El cajero escanea con `apps/web` en tablet o celular. El servidor valida firma, expiración (±60 seg), y que el nonce no se haya usado (tabla `qr_nonces` con TTL). Esto impide replay attacks.

### Rate limiting

- Por IP: 30 requests/minuto en endpoints de check-in
- Por teléfono: 1 check-in por organización cada 30 minutos
- Por organización: 100 check-ins/minuto (si superan, probable bot)

En M1-M2 esto se implementa con una tabla `rate_limits` en Postgres (funciones + índices). En M3+, si el rate limit es un bottleneck, se migra a Upstash Redis con `@upstash/ratelimit`.

### Anti-fraude básico

- Log de todas las transacciones de puntos con IP, user-agent, location
- Alertas (email al comercio) si detectamos: >5 check-ins del mismo cliente en 1 hora, crecimiento anómalo de puntos (>3σ del promedio)
- Botón "marcar como sospechoso" en el dashboard del comercio que revierte la transacción

## 9. Autenticación con Supabase

Supabase Auth va a manejar:
- Email + password (método principal para comercios)
- Google OAuth (conveniencia, ya está en el mockup)
- OTP SMS para clientes finales (no tienen password, se identifican por teléfono)

**Row Level Security (RLS)** es la piedra angular. En lugar de verificar permisos en código, se verifican en la base de datos. Reglas básicas:

- Un `user` solo ve `organizations` donde aparece en `organization_members`
- Una `organization` solo ve sus propias `cards`, `customers`, `transactions`
- Un `customer` solo ve su propio `membership` vía el `slug` público (sin sesión)

Si no implementas RLS bien desde el principio, un bug en el frontend puede exponer datos de otro comercio. RLS lo convierte en imposible por diseño.

## 10. Abstracción de pagos

Ubicación: `packages/payments/src/`

```
packages/payments/
├── src/
│   ├── provider.interface.ts      # Contrato genérico
│   ├── providers/
│   │   ├── wompi.ts                # Implementación Wompi
│   │   └── stripe.ts               # Implementación Stripe (futuro)
│   ├── webhooks/
│   │   ├── wompi.handler.ts
│   │   └── stripe.handler.ts
│   └── index.ts                    # Factory: getProvider(country: 'CO' | 'US')
```

El interface define: `createCheckoutSession()`, `createSubscription()`, `cancelSubscription()`, `verifyWebhookSignature()`, `refund()`.

**Implicación práctica para M1-M2:** solo implementas Wompi. Pero lo implementas detrás del interface para que agregar Stripe en M3-M4 no requiera refactor.

## 11. Observabilidad

Lo mínimo desde día 1:

- **Sentry** para errores frontend y backend (Next.js tiene integración oficial)
- **Vercel Analytics** (gratis, incluido) para métricas básicas de performance
- **Supabase Logs** para queries lentos y errores de BD
- **Structured logs** en endpoints críticos (check-in, redención, webhook de pago) con `pino`
- **Uptime**: UptimeRobot gratis pingeando `/api/health` cada 5 min

Lo que agregas en M3-M4:
- PostHog para analytics de producto (funnels, retention)
- Dashboards custom con Supabase Views para métricas de negocio (MRR, churn, etc.)

## 12. Feature flags

En M1: tabla `feature_flags` en Postgres con `enabled_for_orgs: uuid[]` y `enabled_globally: boolean`. Función `isEnabled(flag, orgId)` en `packages/domain`.

En M3+: si tienes >20 flags, migras a PostHog o Unleash.

Flags iniciales sugeridos:
- `new_onboarding_v2`
- `wallet_passes`
- `bulk_import_customers`
- `custom_branding`

---

# PARTE III — PLAN DE EJECUCIÓN

## 13. Milestone 1 — Validate (3–4 semanas)

**Objetivo:** confirmar que al menos 5 dueños de cafetería/restaurante en Colombia están dispuestos a pagar $35.000/mes por una solución de loyalty cards. Sin esto, no construyes nada.

**Qué se construye:**
- Landing page pública (`sellio.co`) con formulario de waitlist
- Nombre del producto **validado** (ver punto 14)
- Deck de 5 slides para mostrar en entrevistas

**Qué NO se construye:**
- Backend
- Autenticación
- Dashboard
- Lo que sea

### Sprints de M1 (semanas de 15–20 h)

**Semana 1 — Foundation**
- Día 1: comprar dominio (ver sección 14), configurar DNS en Cloudflare
- Día 2: crear repo GitHub privado, setup Turborepo + Next.js en `apps/web-landing`
- Día 3: configurar Vercel, primer deploy a `sellio.co`
- Día 4: implementar landing basada en mockup `Sellio_Landing.html`
- Día 5: formulario waitlist que guarda en Supabase (tabla simple `waitlist(email, business, vertical, city, created_at)`)
- Día 6-7: plantilla de entrevista estructurada, lista de 30 cafeterías a contactar

**Semana 2 — Interviews**
- Meta: 8 entrevistas de 30 min cada una
- Script de entrevista (Anexo D)
- Registrar hallazgos en Notion o Google Docs (NO construir CRM todavía)
- Al final de semana: primer análisis de patrones

**Semana 3 — Interviews 2 + Iteration**
- 7 entrevistas más (total 15)
- Ajustar landing con lenguaje que usaron los entrevistados
- Pedir "carta de intención" a los top 5 más interesados: "si el producto existe en 2 meses, ¿me pasas tu tarjeta para cobrarte $35.000?"
- Si obtienes 5 cartas firmadas → avanzas a M2
- Si obtienes <5 → iteras en el pitch o cambias vertical

**Semana 4 — Buffer + Setup técnico M2**
- Terminar cualquier entrevista pendiente
- Setup del proyecto completo (ver sección 16)
- Primer ADR: decisiones tomadas hasta aquí

### Criterio de salida de M1

- [ ] 15 entrevistas completadas con restaurantes/cafeterías colombianas
- [ ] 5 cartas de intención de compra (email o WhatsApp con confirmación explícita)
- [ ] Nombre del producto definido y dominio comprado
- [ ] Landing en producción con >20 signups a waitlist
- [ ] Decisión documentada: ¿seguimos con el vertical inicial o pivotamos?

## 14. Decisión sobre el nombre "Sellio"

Marcaste Sellio como tentativo. Antes de M2, **el nombre se cierra**. Criterios para validar:

1. **Dominio .co disponible** (mandatorio — estás en Colombia)
2. **Pronunciable sin ambigüedad en español** — "Sellio" cumple (se-lee-o)
3. **No marca registrada** en Superintendencia de Industria y Comercio (SIC) de Colombia en clases 35, 42 (servicios de software). Consulta en `https://sipi.sic.gov.co`
4. **No marca registrada** en USPTO (para cuando expandas a US). Consulta en `https://tmsearch.uspto.gov`
5. **Handle disponible** en Instagram, Twitter/X, LinkedIn
6. **Pasa el test de 10 entrevistas**: ¿las personas lo recuerdan al día siguiente? ¿lo asocian con el producto?

Si Sellio falla uno de esos checks, **cambia de nombre en M1, no después**. Renombrar post-M2 cuesta cientos de horas (código, dominio, branding, cuentas, comunicación a usuarios).

Alternativas a considerar si Sellio falla: nombres cortos de 2 sílabas, pronunciables en inglés y español, disponibles en .co y .com.

## 15. Milestone 2 — First Dollar (8–10 semanas)

**Objetivo:** tener **1 comercio real** pagando $35.000/mes por Sellio, usándolo al menos 2 meses seguidos.

**Qué se construye (en orden de ejecución):**

### Sprint M2.1 — Auth + Shell (semana 1–2)

**Entregables:**
- Monorepo pnpm + Turborepo funcionando con 2 apps (`web`, `cards`)
- Supabase project configurado (auth, schema inicial, RLS básico)
- Login + Register + Verify Email + Forgot Password (el mockup ya existe)
- Layout principal del dashboard (sidebar + header vacíos)
- Ruta `/app/settings/profile` funcional
- CI/CD en GitHub Actions → Vercel preview por PR

**Tickets (cada uno ~1 día part-time):**
- `M2.1-01` Setup monorepo + Turborepo + pnpm workspaces
- `M2.1-02` Configurar Supabase (proyecto, schema inicial, RLS base)
- `M2.1-03` Configurar Next.js apps con Tailwind + shadcn/ui
- `M2.1-04` Implementar pantalla Login (ya diseñada)
- `M2.1-05` Implementar pantalla Register (ya diseñada)
- `M2.1-06` Implementar Verify Email + Forgot + Reset (ya diseñadas)
- `M2.1-07` Implementar middleware de auth en Next.js (protege `/app/*`)
- `M2.1-08` Crear `organizations` al registrarse (trigger en Supabase)
- `M2.1-09` Layout del dashboard (sidebar + topbar)
- `M2.1-10` Pantalla `/app/settings/profile` (editar nombre, email, logo)
- `M2.1-11` GitHub Actions: lint + typecheck + test en cada PR
- `M2.1-12` Configurar Sentry en `apps/web`

### Sprint M2.2 — Cards + Customers (semana 3–4)

**Entregables:**
- Crear tarjeta: nombre, descripción, puntos necesarios para canje, beneficio
- Editar tarjeta
- Personalización visual básica: color primario, logo
- Crear cliente manualmente (nombre, teléfono)
- Listar clientes de una tarjeta
- Vista pública de la tarjeta del cliente (`apps/cards`) — solo diseño, sin puntos aún

**Tickets:**
- `M2.2-01` Schema: tablas `cards`, `customers`, `memberships`
- `M2.2-02` RLS para `cards` y `customers`
- `M2.2-03` Página `/app/cards` (listar tarjetas del comercio)
- `M2.2-04` Página `/app/cards/new` (formulario de creación)
- `M2.2-05` Página `/app/cards/[id]` (detalle + edición)
- `M2.2-06` Página `/app/cards/[id]/customers` (gestión de clientes)
- `M2.2-07` Modal "agregar cliente" (teléfono + nombre)
- `M2.2-08` Setup `apps/cards` (dominio `s.sellio.co` o subpath)
- `M2.2-09` Página `apps/cards/[membershipSlug]` (vista pública, solo diseño)
- `M2.2-10` Componente de preview de tarjeta compartido en `packages/ui`

### Sprint M2.3 — Points + QR (semana 5–6)

**Entregables:**
- Check-in del cliente: cliente entra a link único, suma puntos
- Dashboard ve puntos actualizados en tiempo real (Supabase Realtime)
- QR estático del comercio para mostrador (PDF descargable)
- Validar QR del cliente para canjes (MVP manual: cajero busca al cliente por teléfono)

**Tickets:**
- `M2.3-01` Schema: `point_transactions`, `redemptions`, `qr_tokens`
- `M2.3-02` Función de dominio `calculatePoints()` en `packages/domain`
- `M2.3-03` Endpoint `POST /api/check-in` con rate limiting
- `M2.3-04` Página `apps/cards/check-in/[orgSlug]` (cliente se identifica + suma punto)
- `M2.3-05` OTP por SMS para nuevos clientes (vía Supabase Auth + Twilio o similar)
- `M2.3-06` Actualizar `apps/cards/[slug]` con puntos reales + Realtime
- `M2.3-07` Generador de PDF con QR del comercio (`/app/cards/[id]/qr-poster`)
- `M2.3-08` Página `/app/cards/[id]/redeem` (cajero marca canje manualmente)
- `M2.3-09` Tests unitarios para `calculatePoints()` y validación de QR
- `M2.3-10` Logs estructurados en endpoints críticos

### Sprint M2.4 — Payments (semana 7–8)

**Entregables:**
- Integración completa con Wompi
- Página de precios en el dashboard (`/app/billing`)
- Flujo de suscripción: elegir plan, pagar, activar
- Webhook de Wompi actualizando `subscriptions`
- Bloqueo de features si suscripción inactiva

**Tickets:**
- `M2.4-01` Schema: `subscriptions`, `invoices`, `payment_events`
- `M2.4-02` `packages/payments` con interface + provider Wompi
- `M2.4-03` Página `/app/billing` (plan actual, cambiar, cancelar)
- `M2.4-04` Página `/checkout/[planId]` (redirige a Wompi)
- `M2.4-05` Endpoint `POST /api/webhooks/wompi` con verificación de firma
- `M2.4-06` Middleware: si `subscription.status != 'active'`, redirigir a billing
- `M2.4-07` Email de confirmación de pago (React Email)
- `M2.4-08` Manejo de pagos fallidos (reintento automático + email)
- `M2.4-09` Testing manual end-to-end en entorno sandbox de Wompi

### Sprint M2.5 — Ship + Onboard (semana 9–10)

**Entregables:**
- Deploy a producción con dominio final
- Onboarding guiado para primer comercio (modo asistido, tú presente)
- Primer cobro real
- Playbook de onboarding documentado

**Tickets:**
- `M2.5-01` Checklist de producción (seguridad, backups, monitoreo)
- `M2.5-02` Crear primer comercio manualmente (sesión en vivo con cliente #1)
- `M2.5-03` Grabar su feedback, ajustar bugs críticos
- `M2.5-04` Documento "Cómo onboardear un nuevo comercio" en `/docs/runbooks/`
- `M2.5-05` Dashboard interno simple para ti (consulta SQL en Supabase): clientes activos, MRR, check-ins de hoy
- `M2.5-06` Primer ADR sobre decisiones post-MVP
- `M2.5-07` Retrospectiva escrita de M2 en `/docs/retros/M2.md`

### Criterio de salida de M2

- [ ] 1 comercio real usando Sellio activamente (>20 check-ins/semana)
- [ ] 1 cobro mensual exitoso vía Wompi
- [ ] 0 bugs críticos en producción por 2 semanas consecutivas
- [ ] Onboarding documentado que un no-técnico pueda seguir
- [ ] Uptime >99% medido en las últimas 2 semanas

## 16. Milestone 3 — First Ten (6–8 semanas)

**Objetivo:** 10 comercios pagando, churn mensual <15%.

**Enfoque:** cerrar el loop de feedback de los primeros 10 clientes. Lo que descubrirás aquí es más importante que cualquier feature que yo pueda pre-planificar hoy. Por eso M3 tiene menos especificidad que M2.

**Temas probables (priorizar según feedback real):**

- **Onboarding sin intervención humana** — el comercio debería poder configurarse solo sin tu ayuda en 30 min
- **Importación masiva de clientes existentes** (CSV → customers)
- **Tiers del producto** — hasta ahora todos tienen el plan Basic. Implementar Free (limitado) y Elite ($29.99/mes, features premium)
- **Analytics básicos** — gráfica de check-ins/día, clientes activos, puntos canjeados
- **Notificaciones por email** a clientes finales (cuando se acercan a un canje)
- **Multi-usuario por organización** — dueño + empleados con roles
- **Primera iteración de branding customizable** (logo, colores primarios)

**Lo que NO se hace aún:**
- Wallet passes (M4)
- Flutter (V2)
- White label (M4 o V2)
- API pública (V2)

### Criterio de salida de M3

- [ ] 10 comercios pagando
- [ ] Churn mensual <15% (de los clientes de M2-M3, perdimos <2 en el mes)
- [ ] 1 comercio en plan Elite
- [ ] NPS medido con al menos 5 respuestas, NPS>20
- [ ] Tiempo de onboarding de un comercio nuevo <1 hora (sin tu intervención más allá del email de bienvenida)

## 17. Milestone 4 — First Hundred (10–12 semanas)

**Objetivo:** 100 comercios pagando, NPS >30, MRR >$3.500.000 COP.

**Temas probables:**

- **Apple Wallet + Google Wallet** — este es probablemente EL feature más diferencial para tu mercado. El comercio le envía al cliente un link, y el cliente agrega la tarjeta a su billetera nativa. Se ve como una tarjeta de Starbucks o similar.
- **Analytics avanzados** (cohortes, retention, funnels)
- **Campañas** — envío de promociones puntuales a clientes de una tarjeta
- **Referidos** — cliente refiere a otro, ambos ganan puntos
- **API pública** (con rate limiting) para comercios avanzados
- **Optimización de costos** — Postgres connection pooling, Vercel Image Optimization, etc.
- **Soporte self-service** — knowledge base, chatbot simple
- **Automatización de onboarding** — emails secuenciales, checklist de activación

### Infraestructura adicional en M4

Aquí sí empiezas a agregar:
- **Upstash Redis** si rate limiting en Postgres empieza a pesar
- **Trigger.dev** para jobs asíncronos (calcular analytics, enviar campañas)
- **PostHog** para analytics de producto
- **Stripe** (si decides expandir a US) — la abstracción ya está lista

### Criterio de salida de M4

- [ ] 100 comercios pagando
- [ ] MRR >$3.500.000 COP
- [ ] NPS >30
- [ ] Wallet passes en producción con >50% adopción entre clientes finales
- [ ] Churn <10% mensual
- [ ] Sistema opera solo 1 semana sin tu intervención

---

# PARTE IV — OPERACIÓN

## 18. Ambientes

Tres ambientes:

| Ambiente | Dominio | Supabase | Propósito |
|---|---|---|---|
| Development | `localhost:3000` | Proyecto `sellio-dev` | Tu máquina |
| Staging | `staging.sellio.co` | Proyecto `sellio-staging` | Testing pre-prod, demos |
| Production | `sellio.co` / `app.sellio.co` / `s.sellio.co` | Proyecto `sellio-prod` | Real |

**Regla:** nunca usas datos de producción en staging ni en dev. Si necesitas datos parecidos, usa el script `scripts/seed.ts` que genera datos sintéticos.

## 19. Git flow

Flujo simple para part-time solo:

- `main` — siempre deployable, protegida, solo merge por PR
- Branches por feature: `feat/M2.3-checkin-flow`, `fix/qr-expired-edge-case`
- Convención de commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- PR template (`.github/pull_request_template.md`) con checklist mínimo: linked issue, screenshots si es UI, migration notes, breaking changes
- Merge: squash and merge (historial limpio en `main`)

**Cuando seas solo:** no hagas PRs a ti mismo teatralmente, pero **sí haz commits atómicos** (un concepto = un commit). Esto te salva cuando en 3 meses necesites hacer `git bisect` para encontrar cuándo se rompió algo.

## 20. CI/CD

`.github/workflows/ci.yml` corre en cada PR:

1. `pnpm install --frozen-lockfile`
2. `pnpm turbo lint typecheck test --filter=[origin/main]`
3. Preview deploy automático a Vercel (URL en el comentario del PR)
4. Smoke tests contra el preview (Playwright, 3–5 flows críticos)

En merge a `main`:
1. Deploy automático a staging
2. Tests e2e contra staging
3. Aprobación manual para promover a producción (en M2 puedes hacerlo automático, en M3+ con más clientes mejor manual)

## 21. Base de datos — migraciones y backups

### Migraciones

- Carpeta `packages/db/migrations/`
- Cada migración es un archivo SQL con timestamp: `20260501120000_create_cards_table.sql`
- Supabase CLI (`supabase db push`) aplica migraciones
- **Regla:** cada migración debe tener un archivo down correspondiente (`_down.sql`) para rollback en caso de emergencia

### Backups

- Supabase hace backups diarios automáticos (retención 7 días en plan gratuito, 14+ en plan Pro)
- **Backup adicional manual:** script `scripts/backup.sh` que corre `pg_dump` y sube a Cloudflare R2 semanalmente
- Test de restore cada mes: restaurar backup a un proyecto Supabase efímero y verificar integridad

## 22. Incidentes — el runbook

Cuando algo falle en producción (cuando, no si), el proceso es:

1. **Confirmar el impacto** — ¿cuántos comercios afectados? ¿es parcial o total?
2. **Comunicar** — mensaje corto en status page (usa `status.sellio.co` con Statuspage.io o similar en M3+)
3. **Mitigar** — feature flag off, rollback a último deploy bueno, o restore de BD si corresponde
4. **Investigar** — leer Sentry + logs + métricas
5. **Corregir** — parche con tests
6. **Post-mortem escrito** en `/docs/incidents/YYYY-MM-DD-titulo.md`

Cada post-mortem tiene: resumen, timeline, impacto, causa raíz, acciones preventivas. Sin buscar culpables — buscar procesos/sistemas que fallaron.

## 23. Seguridad — checklist pre-producción

Antes de tu primer cliente real en M2.5:

- [ ] Todas las variables de entorno en Vercel como `secret`, no en código
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo en routes del servidor, nunca en cliente
- [ ] RLS activo en **todas** las tablas con datos de usuario
- [ ] Rate limiting en endpoints públicos (check-in, webhooks, auth)
- [ ] HTTPS forzado (Vercel lo hace por default)
- [ ] Content Security Policy headers (`next.config.js`)
- [ ] Dependabot activado en GitHub
- [ ] Secretos escaneados (GitHub secret scanning, activado por default en repos públicos — tu repo debe ser privado hasta post-M4)
- [ ] 2FA activado en: GitHub, Vercel, Supabase, Wompi, dominio, email
- [ ] Política de privacidad y términos de servicio publicados (abogado en Colombia: ~$400.000-800.000 COP por un modelo adaptable)
- [ ] Registro de la base de datos ante la SIC (Habeas Data) — si manejas datos de >10.000 personas

---

# PARTE V — ANEXOS

## Anexo A — Schema de base de datos (resumen)

Esquema completo en SQL está en `/docs/api/schema.sql`. Resumen de tablas principales:

**`profiles`** (extiende `auth.users`)
- `id UUID PK` (= `auth.users.id`)
- `full_name TEXT`
- `phone TEXT`
- `created_at TIMESTAMPTZ`

**`organizations`**
- `id UUID PK`
- `slug TEXT UNIQUE` (usado en URLs públicas)
- `name TEXT`
- `logo_url TEXT`
- `primary_color TEXT`
- `country TEXT` (default 'CO')
- `timezone TEXT`
- `plan TEXT` (`free` | `basic` | `elite`)
- `created_at`

**`organization_members`**
- `org_id UUID FK`
- `user_id UUID FK`
- `role TEXT` (`owner` | `admin` | `cashier`)
- `PRIMARY KEY(org_id, user_id)`

**`cards`** (plantilla de programa de lealtad)
- `id UUID PK`
- `org_id UUID FK`
- `name TEXT`
- `description TEXT`
- `points_per_checkin INT` (default 1)
- `points_for_reward INT` (ej: 10 puntos = café gratis)
- `reward_description TEXT`
- `max_members INT NULL` (según tier)
- `design JSONB` (colores, imágenes, layout)
- `active BOOLEAN`
- `created_at`

**`customers`**
- `id UUID PK`
- `org_id UUID FK`
- `phone TEXT` (único por org)
- `name TEXT`
- `email TEXT NULL`
- `created_at`
- `UNIQUE(org_id, phone)`

**`memberships`**
- `id UUID PK`
- `card_id UUID FK`
- `customer_id UUID FK`
- `slug TEXT UNIQUE` (URL pública: `s.sellio.co/c/:slug`)
- `points INT` (cached total, recalculable)
- `joined_at`
- `UNIQUE(card_id, customer_id)`

**`point_transactions`** (append-only)
- `id UUID PK`
- `membership_id UUID FK`
- `type TEXT` (`earn` | `redeem` | `adjust` | `expire`)
- `points INT` (positivo o negativo)
- `source TEXT` (`checkin` | `manual` | `referral` | `admin`)
- `idempotency_key TEXT UNIQUE` (para prevenir dobles)
- `metadata JSONB` (IP, user-agent, location)
- `created_at`
- `created_by UUID` (user que originó)

**`redemptions`**
- `id UUID PK`
- `membership_id UUID FK`
- `points_used INT`
- `reward_snapshot JSONB` (snapshot del reward al momento de canje)
- `redeemed_at`
- `redeemed_by UUID` (user cajero)

**`qr_nonces`** (prevenir replay attacks)
- `nonce TEXT PK`
- `used_at TIMESTAMPTZ`
- `expires_at TIMESTAMPTZ`
- Index en `expires_at` para limpieza con `pg_cron`

**`subscriptions`**
- `id UUID PK`
- `org_id UUID FK UNIQUE`
- `plan TEXT`
- `status TEXT` (`active` | `past_due` | `canceled`)
- `provider TEXT` (`wompi` | `stripe`)
- `provider_subscription_id TEXT`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end BOOLEAN`

**`webhook_events`** (para idempotencia de webhooks)
- `id UUID PK`
- `provider TEXT`
- `event_id TEXT UNIQUE` (del provider)
- `payload JSONB`
- `processed_at TIMESTAMPTZ NULL`
- `created_at`

## Anexo B — Endpoints principales (contrato)

Convención: `/api/v1/...`. Todos requieren `Authorization: Bearer <supabase_jwt>` excepto los marcados como `public`.

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/v1/cards` | Crear tarjeta | org member |
| GET | `/api/v1/cards` | Listar tarjetas del org | org member |
| GET | `/api/v1/cards/:id` | Detalle de tarjeta | org member |
| PATCH | `/api/v1/cards/:id` | Editar tarjeta | org admin |
| POST | `/api/v1/cards/:id/customers` | Agregar cliente | org member |
| POST | `/api/v1/check-in` | Cliente suma punto (con OTP) | public |
| POST | `/api/v1/redemptions` | Cajero marca canje | org member |
| GET | `/api/v1/memberships/:slug` | Vista pública de tarjeta | public |
| POST | `/api/v1/webhooks/wompi` | Webhook de pagos | verified signature |
| POST | `/api/v1/billing/checkout` | Iniciar suscripción | org owner |
| GET | `/api/v1/billing/subscription` | Estado de suscripción | org owner |

## Anexo C — Pantallas a diseñar (gap con los mockups actuales)

Ya tienes: Landing, Login, Register, Verify Email, Forgot Password, Reset Password, Preview Card.

Falta diseñar antes de M2:

- Dashboard home (`/app`) — resumen: check-ins hoy, clientes activos, acciones rápidas
- Lista de tarjetas (`/app/cards`)
- Crear tarjeta (`/app/cards/new`) — wizard de 3 pasos
- Detalle/edición de tarjeta (`/app/cards/[id]`)
- Lista de clientes de una tarjeta (`/app/cards/[id]/customers`)
- Vista pública de membership (`s.sellio.co/c/[slug]`) — para el cliente final
- Check-in flow (`s.sellio.co/in/[orgSlug]`)
- Billing (`/app/billing`)
- Settings de perfil y org (`/app/settings/*`)

Recomendación: usa v0.dev o un diseñador en Fiverr/Upwork para las 9 pantallas de golpe antes de M2.1. Invertir $200–500 USD aquí te ahorra decenas de horas de idas y vueltas.

## Anexo D — Script de entrevista de validación (M1)

30 minutos, grabar con consentimiento. Estructura:

**Calentamiento (5 min)**
- ¿Cómo se llama tu negocio? ¿Cuántos años lleva?
- ¿Cuántos clientes atiendes por día en promedio?

**Problema actual (10 min)**
- ¿Qué haces hoy para que los clientes vuelvan?
- ¿Tienes algún sistema de lealtad/puntos/descuentos? ¿Cómo funciona?
- Si tienes algo tipo "9na está gratis" en papel, ¿qué tal funciona? ¿qué problemas tiene?
- ¿Alguna vez probaste una app o software de lealtad? ¿Por qué no lo usas ya?

**Demo + propuesta (10 min)**
- Muestro landing + preview de tarjeta
- "Imagina que en 5 minutos puedes crear tu tarjeta, tus clientes la agregan a su teléfono sin descargar nada, y ves en tiempo real quién visita"
- ¿Qué te parece? ¿Qué es lo más útil? ¿Qué falta?
- **Pregunta clave:** "¿Pagarías $35.000/mes por esto?" Silencio, dejar responder.
- Si duda: "¿qué precio te parecería justo?"

**Cierre (5 min)**
- ¿Me dejas contactarte cuando tengamos beta?
- Si el producto existe en 2 meses exactamente como te mostré, ¿lo usarías? ¿me pasas tu tarjeta?

**Después de la entrevista, llenar:**
- Arquetipo (1 línea)
- Dolor principal
- Disposición a pagar (sí / no / dudoso) con cita textual
- Carta de intención (sí / no / pedirla por WhatsApp después)
- Features pedidas
- Precio mencionado
- Feedback visual/de producto

## Anexo E — Stack de decisiones pendientes

Decisiones que no se han tomado y que bloquean avances específicos:

| Decisión | Bloquea | Deadline | Dueño |
|---|---|---|---|
| Nombre definitivo del producto | M2.1 | Semana 3 (M1) | Tú |
| Proveedor de pagos (Wompi vs Mercado Pago) | M2.4 | Semana 6 (M2) | Tú |
| Proveedor de SMS para OTP | M2.3 | Semana 5 (M2) | Tú |
| Plan de Supabase (free vs pro $25/mes) | M2.5 | Semana 9 (M2) | Tú (probablemente free hasta M3) |
| Registro legal del negocio | M2.5 | Antes del primer cobro | Tú + contador |
| Política de privacidad + TyC | M2.5 | Antes del primer cobro | Tú + abogado |

## Anexo F — Presupuesto estimado M1-M4

Esto es lo mínimo que vas a gastar. Todo en USD para facilidad (convertir a COP según tasa actual, que está alrededor de 4.200 COP/USD a abril 2026 — verificar).

### Mensual recurrente (durante M1-M4)

| Item | Costo mensual | Notas |
|---|---|---|
| Dominio .co | ~$2 | ~$25/año prorrateado |
| Vercel Hobby | $0 | Gratis hasta cierto tráfico |
| Supabase Free | $0 | Suficiente hasta M3 |
| Sentry Free | $0 | 5k errores/mes |
| Resend | $0 | 3k emails/mes gratis |
| Cloudflare | $0 | DNS gratis |
| GitHub | $0 | Repo privado gratis |
| **Total M1-M2** | **~$2/mes** | |

### Mensual desde M3

| Item | Costo mensual | Notas |
|---|---|---|
| Anterior | ~$2 | |
| Vercel Pro (opcional) | $20 | Si superas límites Hobby |
| Supabase Pro | $25 | Backups, más storage, DB bigger |
| Sentry Team | $26 | Si superas 5k errores |
| Resend | $20 | Si superas 3k emails |
| SMS (Twilio Colombia) | ~$0.04/SMS | 500 OTPs/mes ≈ $20 |
| **Total M3+** | **~$113/mes** | |

### Costos únicos esperados

| Item | Costo | Notas |
|---|---|---|
| Constitución legal (si aplica) | $200–500 USD | Consulta con contador colombiano |
| Política de privacidad + TyC | $100–200 USD | Abogado colombiano |
| Diseño de 9 pantallas adicionales | $200–500 USD | Fiverr/Upwork o v0.dev gratis |
| Logo profesional | $50–150 USD | Si no lo haces tú |
| Cuenta Google Workspace | $6/mes | email@sellio.co |

**Total inversión mínima estimada hasta primer dólar (M2):** ~$500 USD + tu tiempo.

---

# FIN DEL PLAN

**Siguiente paso sugerido:** lee este documento completo una vez. Vuelve a la sección 13 (M1) y empieza por el día 1 de la semana 1. No hagas nada de M2 hasta que M1 esté cerrado.

**Convención de actualización:** cuando una decisión pendiente del Anexo E se tome, actualiza este documento y créale un ADR en `/docs/adr/`. Cuando un milestone se cierre, escribe la retro en `/docs/retros/`.
