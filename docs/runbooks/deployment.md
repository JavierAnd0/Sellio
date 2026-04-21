# Deployment

## Ambientes

| Ambiente | Web | Cards | Supabase |
|---|---|---|---|
| Development | `localhost:3000` | `localhost:3001` | Docker local o `sellio-dev` |
| Staging | `staging.sellio.co` | `s-staging.sellio.co` | `sellio-staging` |
| Production | `app.sellio.co` | `s.sellio.co` | `sellio-prod` |

**Regla crítica:** nunca copies datos de producción a staging ni a dev. Si
necesitas datos parecidos, usa `pnpm db:seed` (genera datos sintéticos).

## Setup inicial en Vercel

### Por cada app (web, cards):

1. En Vercel, **Add New Project** → importar repo de GitHub
2. Configuración:
   - **Framework preset:** Next.js
   - **Root directory:** `apps/web` (o `apps/cards`)
   - **Build command:** `cd ../.. && pnpm turbo build --filter=@sellio/web...`
   - **Install command:** `cd ../.. && pnpm install --frozen-lockfile`
   - **Output directory:** `.next` (default)
3. **Environment variables:** copiar todas las de `.env.example`, con valores de producción
4. **Domains:** configurar el dominio que corresponda
5. Primer deploy: push a `main` o deploy manual

### Turbo Remote Cache

Para acelerar builds compartiendo cache entre devs y Vercel:

```bash
pnpm turbo login
pnpm turbo link
```

## Flujo de deploy

### Preview deploys (por PR)

Automático. Cada PR genera un preview en Vercel con URL `sellio-web-pr-NN.vercel.app`.
El link aparece en un comentario del PR.

### Staging (post-merge a main)

Automático. Merge a `main` → Vercel deploya a staging.

### Producción

Dos opciones:

**Opción A (M2, rápido):** auto-promote de staging a producción con un delay de
24 horas.

**Opción B (M3+, con cliente real):** promote manual via Vercel UI.

## Variables de entorno en Vercel

Por ambiente (Development/Preview/Production):

| Variable | Dev | Preview | Prod |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | local | staging | prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | local | staging | prod |
| `SUPABASE_SERVICE_ROLE_KEY` | local | staging | prod |
| `WOMPI_PUBLIC_KEY` | sandbox | sandbox | production |
| `WOMPI_PRIVATE_KEY` | sandbox | sandbox | production |
| `WOMPI_EVENTS_SECRET` | sandbox | sandbox | production |
| `RESEND_API_KEY` | test | test | production |
| `QR_SIGNING_SECRET` | generado | generado | generado (distinto de staging) |
| `SENTRY_DSN` | opcional | staging | prod |

**Importante:** `QR_SIGNING_SECRET` de producción NUNCA debe coincidir con staging.
Un secret filtrado de staging no debe comprometer producción.

## Migraciones de BD

Las migraciones se aplican **antes** del deploy de código:

```bash
# 1. Aplicar migración a staging
supabase link --project-ref <staging-ref>
supabase db push

# 2. Verificar en staging: la migración + el código nuevo funcionan juntos

# 3. Aplicar a producción
supabase link --project-ref <prod-ref>
supabase db push

# 4. Mergear el PR con el código nuevo → Vercel deploya
```

**Regla:** migraciones deben ser backward-compatible al menos durante el deploy.
Si agregas una columna NOT NULL sin default, puedes romper el deploy anterior
hasta que todos los servers estén actualizados.

Estrategia recomendada para cambios disruptivos (ej: renombrar columna):
1. Deploy 1: agregar columna nueva, código lee/escribe ambas
2. Deploy 2: backfill de datos
3. Deploy 3: código solo usa columna nueva
4. Deploy 4: eliminar columna vieja

## Rollback

### Rollback de código
En Vercel UI → Deployments → click en un deploy anterior exitoso → **Promote to production**.

### Rollback de BD
Las migraciones tienen archivo `_down.sql`. Ejecutar:
```bash
# peligroso — coordinar con rollback de código
psql $DATABASE_URL -f packages/db/migrations/<nombre>_down.sql
```

**Antes de ejecutar un down:** asegurar que no hay datos que se pierdan
irreversiblemente. Si sí los hay, crear una migración **forward** que corrija,
en vez de rollback.

## Post-deploy checklist

Tras cada deploy a producción:

- [ ] Smoke test: login + crear card + check-in funcionan
- [ ] Sentry no muestra errores nuevos en las primeras 5 minutos
- [ ] Uptime monitor sigue en verde
- [ ] Métricas de latencia en Vercel Analytics no degradadas

Si algo falla → rollback inmediato → post-mortem en `docs/incidents/`.

## Custom domains

### DNS (Cloudflare)

| Tipo | Nombre | Destino |
|---|---|---|
| CNAME | `app` | `cname.vercel-dns.com` |
| CNAME | `s` | `cname.vercel-dns.com` |
| CNAME | `staging` | `cname.vercel-dns.com` |
| A | `@` | (IP del landing o redirect) |
| MX | `@` | (emails vía Resend/Google Workspace) |

### SSL
Vercel provee SSL automático via Let's Encrypt. No requiere configuración.

### Configurar en Vercel
Por cada app → **Settings → Domains** → agregar dominio → seguir instrucciones
de verificación DNS.
