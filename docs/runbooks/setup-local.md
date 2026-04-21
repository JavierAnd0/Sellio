# Setup local de desarrollo

Guía paso a paso para levantar el proyecto en una máquina nueva.

## 1. Prerrequisitos del sistema

### macOS

```bash
# Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Herramientas
brew install node pnpm supabase/tap/supabase
brew install --cask docker    # necesario para Supabase local
```

### Linux (Ubuntu/Debian)

```bash
# Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20.11.0

# pnpm
npm install -g pnpm

# Docker
curl -fsSL https://get.docker.com | sh

# Supabase CLI
curl -fsSL https://supabase.com/install.sh | sh
```

### Windows

Usar WSL2 con Ubuntu y seguir instrucciones de Linux.

## 2. Cuentas necesarias

Crear en orden:

1. **GitHub** — para clonar el repo
2. **Supabase** (`supabase.com`) — crear proyecto `sellio-dev`
3. **Vercel** (`vercel.com`) — conectar con GitHub
4. **Resend** (`resend.com`) — para emails (gratis hasta 3k/mes)
5. **Sentry** (`sentry.io`) — para error tracking
6. **Wompi** (`comercios.wompi.co`) — cuenta de sandbox para desarrollo
7. **Cloudflare** (`cloudflare.com`) — para DNS del dominio

## 3. Clonar y configurar

```bash
git clone git@github.com:tu-usuario/sellio.git
cd sellio

# Usar la versión de Node del proyecto
nvm use

# Instalar dependencias
pnpm install
```

## 4. Variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local`:

### Supabase (obligatorio)

1. Ir a `supabase.com/dashboard/project/_/settings/api`
2. Copiar `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copiar `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copiar `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA commits esta key**

### QR Secret (obligatorio)

```bash
openssl rand -hex 32
```

Copiar output a `QR_SIGNING_SECRET`.

### Resend (obligatorio para M2.1+)

1. Crear API key en `resend.com/api-keys`
2. Copiar a `RESEND_API_KEY`
3. `RESEND_FROM_EMAIL` puede quedar como `Sellio <onboarding@resend.dev>` en dev
   (cuando tengas dominio, cambiar a `noreply@sellio.co`)

### Wompi (obligatorio para M2.4+)

Sandbox keys desde `comercios.wompi.co/developers`:
- `WOMPI_PUBLIC_KEY` empieza con `pub_test_`
- `WOMPI_PRIVATE_KEY` empieza con `prv_test_`
- `WOMPI_EVENTS_SECRET`: generar en la sección de Eventos

### Sentry (recomendado)

- `SENTRY_DSN`: desde `sentry.io/settings/projects/sellio/keys/`
- `SENTRY_AUTH_TOKEN`: para source maps en builds (opcional en dev)

## 5. Base de datos local

Opción A — **Supabase local con Docker** (recomendado):

```bash
supabase start
# Esto levanta Postgres, Auth, Realtime y Storage localmente.
# La primera vez tarda ~2 min bajando imágenes Docker.
```

Output incluye URLs locales — usar esas en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key mostrada>
SUPABASE_SERVICE_ROLE_KEY=<local service role key mostrada>
```

Aplicar migraciones:
```bash
pnpm db:migrate
pnpm db:seed      # opcional, carga datos de prueba
```

Opción B — **conectar a proyecto en la nube**:

Usar directamente las keys del paso 4. Aplicar migraciones con:
```bash
supabase link --project-ref <ref-del-proyecto>
supabase db push
```

## 6. Levantar apps

```bash
pnpm dev
```

Apps:
- Dashboard: http://localhost:3000
- Cards: http://localhost:3001

Si solo quieres una:
```bash
pnpm --filter @sellio/web dev
pnpm --filter @sellio/cards dev
```

## 7. Verificar que todo funciona

Checklist:

- [ ] `http://localhost:3000` carga la homepage
- [ ] `http://localhost:3001` carga la homepage de cards
- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm test` pasa (debe haber ~10 tests de `@sellio/domain`)

Si algo falla, ver sección Troubleshooting del `README.md`.

## 8. Setup de Git hooks

Husky se instala automáticamente con `pnpm install` vía el script `prepare`.
Verifica que funcione:

```bash
# Debería bloquear un commit con mensaje mal formateado
git commit --allow-empty -m "mal mensaje"
# → bloqueado por commitlint

git commit --allow-empty -m "chore: test setup"
# → permitido
```

## 9. Editor recomendado

**VSCode** con las extensiones del archivo `.vscode/extensions.json`:

Al abrir el repo por primera vez, VSCode debería ofrecerte instalar las
extensiones recomendadas. Decir "Install All".

Si usas otro editor, las configuraciones clave son:
- Formateo al guardar con Prettier
- ESLint autofix al guardar
- TypeScript del workspace (no de la instalación global)
