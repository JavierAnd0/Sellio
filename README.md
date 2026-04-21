# Sellio

**Loyalty cards digitales para comercios en Colombia.**

Sellio permite a tiendas, restaurantes y negocios locales ofrecer tarjetas de puntos digitales a sus clientes — sin apps, sin plástico, sin fricción. Los clientes acumulan y canjean puntos escaneando un QR. Los comercios lo ven en tiempo real desde su dashboard.

---

## Producto

| App | Descripción |
|---|---|
| **Dashboard** (`app.sellio.co`) | Panel del comercio: gestión de puntos, clientes, recompensas y métricas |
| **Cards** (`s.sellio.co`) | Tarjeta digital pública del cliente — accesible desde cualquier dispositivo |

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Supabase — Postgres, Auth, Storage, RLS, Realtime
- **Pagos:** Wompi (Colombia)
- **Email:** Resend + React Email
- **Observabilidad:** Sentry
- **Monorepo:** Turborepo + pnpm
- **CI/CD:** GitHub Actions

## Estructura del repositorio

```
sellio/
├── apps/
│   ├── web/          # Dashboard del comercio
│   └── cards/        # Tarjeta digital del cliente
└── packages/
    ├── ui/           # Componentes compartidos
    ├── db/           # Cliente Supabase, migraciones y tipos
    ├── domain/       # Lógica de negocio (puntos, QR, rate-limiting)
    ├── emails/       # Templates de correo
    ├── payments/     # Abstracción de pagos
    └── config/       # Configuración compartida (TS, ESLint, Tailwind)
```

## Desarrollo local

**Prerrequisitos:** Node.js 20.11+, pnpm 9+, Supabase CLI

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example apps/web/.env.local

# Iniciar base de datos local
supabase start
pnpm db:migrate

# Levantar todas las apps
pnpm dev
```

Dashboard en `http://localhost:3000` · Cards en `http://localhost:3001`

Para más detalle ver [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Licencia

Propietario. Todos los derechos reservados.
