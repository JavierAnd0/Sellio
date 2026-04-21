# Sellio

Plataforma SaaS de loyalty cards digitales para comercios en Colombia.

**Estado actual:** M1 validado → arrancando M2 
**Plan completo:** [`PLAN.md`](./PLAN.md)
**Decisiones fundacionales:** [`docs/adr/0001-decisiones-fundacionales.md`](./docs/adr/0001-decisiones-fundacionales.md)

---

## Stack

- **Monorepo:** Turborepo + pnpm
- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn-style components
- **Backend:** Supabase (Postgres + Auth + Storage + RLS + Realtime)
- **Pagos:** Wompi (Colombia) / stripe
- **Email:** Resend + React Email
- **Hosting:** dockploy
- **Observabilidad:** Sentry + Vercel Analytics
- **CI/CD:** GitHub Actions

## Estructura

```
sellio/
├── apps/
│   ├── web/         # Dashboard del comercio (app.sellio.co)
│   └── cards/       # Tarjetas públicas de clientes (s.sellio.co)
├── packages/
│   ├── ui/          # Componentes compartidos
│   ├── db/          # Cliente Supabase + migraciones + types
│   ├── domain/      # Lógica de negocio pura (puntos, QR, rate-limit)
│   ├── emails/      # React Email templates
│   ├── payments/    # Abstracción Wompi/Stripe
│   └── config/      # tsconfig, eslint, tailwind compartidos
├── docs/
│   ├── adr/         # Architecture Decision Records
│   ├── runbooks/    # Procedimientos operativos
│   ├── retros/      # Retrospectivas post-milestone
│   └── incidents/   # Post-mortems de incidentes
├── scripts/         # Scripts de ops (seed, backup)
└── .github/         # CI/CD workflows
```

## Setup inicial (primera vez)

### Prerrequisitos

- **Node.js 20.11+** (recomendado: usar `nvm` con `nvm use` en el repo)
- **pnpm 9+** (`npm install -g pnpm`)
- **Supabase CLI** (`brew install supabase/tap/supabase` o equivalente)
- Cuenta en Supabase, Vercel, Resend, Wompi, Sentry, Cloudflare

### Paso a paso

1. **Clonar y entrar**
   ```bash
   git clone <url-del-repo>
   cd sellio
   nvm use                 # usa la versión del .nvmrc
   pnpm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con los valores reales
   ```

   Generar el secret del QR:
   ```bash
   openssl rand -hex 32    # copiar el output a QR_SIGNING_SECRET en .env.local
   ```

3. **Supabase local** (opcional pero recomendado)
   ```bash
   supabase start          # levanta Postgres local en Docker
   pnpm db:migrate         # aplica migraciones
   pnpm db:types           # genera types TypeScript desde el schema
   pnpm db:seed            # carga datos de prueba (opcional)
   ```

   Si prefieres conectar directo a un proyecto Supabase en la nube, pon las URLs
   y keys en `.env.local` y salta el paso anterior.

4. **Desarrollo**
   ```bash
   pnpm dev                # levanta web en :3000 y cards en :3001 en paralelo
   ```

   Apps corriendo:
   - Dashboard: http://localhost:3000
   - Cards: http://localhost:3001

## Comandos frecuentes

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta todas las apps en modo desarrollo |
| `pnpm build` | Build de producción para todas las apps |
| `pnpm lint` | ESLint en todo el monorepo |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Ejecuta todos los tests unitarios |
| `pnpm format` | Prettier format en todo el código |
| `pnpm db:migrate` | Aplica migraciones SQL |
| `pnpm db:reset` | Reset total de la BD local + seed |
| `pnpm db:types` | Regenera `packages/db/src/types.generated.ts` |

## Workflow de desarrollo

1. **Antes de empezar:** revisa el ticket en `PLAN.md` (formato `M2.X-YY`)
2. **Nueva branch:** `git checkout -b feat/M2.X-YY-descripcion-corta`
3. **Commits:** usa [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat: add card creation form`
   - `fix: handle expired QR correctly`
   - `chore: update supabase version`
4. **PR:** abre PR a `main`, el CI corre lint + typecheck + test
5. **Merge:** squash merge para mantener historial limpio

## Deployment

- Push a `main` → Vercel despliega a staging automáticamente
- Promoción manual staging → producción (aprobación en Vercel UI)
- Preview deploys se generan por cada PR

Ver [`docs/runbooks/deployment.md`](./docs/runbooks/deployment.md) para más detalle.

## Arquitectura

### Flujo de autenticación

Supabase Auth → JWT en cookies → middleware Next.js valida sesión en cada request
→ Row Level Security en Postgres valida permisos por fila.

### Flujo de puntos

Cliente escanea QR del comercio → `s.sellio.co/in/[orgSlug]` → identificación con OTP
→ rate limiting → inserta `point_transactions` → trigger actualiza cache en `memberships.points`
→ Supabase Realtime empuja a dashboard del comercio.

### Flujo de canje

Cliente muestra QR dinámico (HMAC-firmado, TTL 60s) en su tarjeta → cajero escanea
con dashboard → verifica firma + consume nonce → crea `redemption` +
`point_transaction` negativa.

Ver `docs/adr/0001-decisiones-fundacionales.md` para el razonamiento detrás de
cada decisión técnica.

## Seguridad

Reglas no-negociables:

- Nunca commits `.env.local` ni keys reales
- `SUPABASE_SERVICE_ROLE_KEY` solo en Route Handlers y Server Actions, nunca en cliente
- RLS activo en **todas** las tablas con datos de usuario
- Rate limiting en endpoints públicos (`/api/check-in`, webhooks)
- 2FA activo en: GitHub, Vercel, Supabase, Wompi, dominio

Ver [`docs/runbooks/security-checklist.md`](./docs/runbooks/security-checklist.md).

## Troubleshooting

**"Missing Supabase environment variables"**
→ Confirma que `.env.local` existe y tiene `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Tipos de Supabase desactualizados**
→ `pnpm db:types` tras aplicar migraciones nuevas.

**Turbo cache corrupto**
→ `rm -rf .turbo && pnpm build`.

**Error de hoisting de dependencias**
→ `rm -rf node_modules pnpm-lock.yaml && pnpm install`.

## Licencia

Propietario. No redistribuir.
