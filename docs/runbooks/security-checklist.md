# Security checklist — pre-producción

Ejecutar este checklist completo antes del primer cliente real (milestone M2.5)
y revisar al menos cada 3 meses después.

## Variables de entorno

- [ ] Ninguna key está en el código fuente ni en commits
- [ ] `.env.local` está en `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo se importa desde `@sellio/db/admin`
- [ ] Variables en Vercel están marcadas como `Sensitive` donde aplique
- [ ] Rotación documentada: secrets se rotan cada 6 meses o tras compromiso

## Supabase / Row Level Security

- [ ] RLS activo en todas las tablas que tocan datos de usuario:
  - `profiles`, `organizations`, `organization_members`
  - `cards`, `customers`, `memberships`
  - `point_transactions`, `redemptions`
  - `subscriptions`, `invoices`, `feature_flags`
- [ ] Tablas sin RLS son **solo** `qr_nonces`, `rate_limits`, `webhook_events`
  (nunca accesibles desde el cliente)
- [ ] Test manual: con una cuenta de prueba, verificar que no puede ver datos
  de otra organización
- [ ] Script automático `scripts/verify-rls.ts` corre en CI y falla si una
  tabla nueva no tiene RLS habilitado *(pendiente implementar)*

## Autenticación

- [ ] Contraseña mínimo 8 caracteres
- [ ] OTP SMS tiene rate limit (máx 3 intentos en 15 min por teléfono)
- [ ] Tokens de reset de contraseña expiran en 1 hora
- [ ] Sesiones expiran en 30 días con refresh token rotation
- [ ] Logout limpia todas las sesiones activas

## Rate limiting

- [ ] `POST /api/check-in`: máx 30/min por IP, 1/30min por teléfono por org
- [ ] `POST /api/auth/otp`: máx 3/15min por teléfono
- [ ] `POST /api/webhooks/wompi`: sin rate limit (verificación de firma suficiente)
- [ ] Alertas configuradas si algún endpoint se rate-limita >100 veces/hora

## QR y anti-fraude

- [ ] `QR_SIGNING_SECRET` tiene al menos 256 bits de entropía
- [ ] QR dinámicos expiran en ≤60 segundos
- [ ] Nonces se registran en `qr_nonces` y no se pueden reusar
- [ ] `pg_cron` limpia nonces expirados cada hora
- [ ] Comparación de firma usa `timingSafeEqual` (no `===`)
- [ ] Logs incluyen IP, user-agent, location de cada check-in

## HTTP / Headers

- [ ] HTTPS forzado en todos los dominios
- [ ] HSTS habilitado con `max-age >= 31536000`
- [ ] CSP configurado en `next.config.js`:
  - `default-src 'self'`
  - `script-src` explícito (sin `'unsafe-inline'` donde sea posible)
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` restringe camera/mic/geo a `()`

## Webhooks

- [ ] Wompi: verificación de firma HMAC en cada request
- [ ] Webhooks usan tabla `webhook_events` con constraint `UNIQUE(provider, event_id)`
  para idempotencia
- [ ] Procesamiento de webhooks es idempotente (reprocesar no causa duplicados)

## Datos sensibles

- [ ] No guardamos números de tarjeta de crédito (Wompi los tokeniza)
- [ ] No logueamos teléfonos completos (solo últimos 4 dígitos en logs)
- [ ] No logueamos emails completos en contextos públicos
- [ ] Storage de Supabase: buckets con policies restrictivas

## Cuentas y accesos

- [ ] 2FA activo en:
  - [ ] GitHub
  - [ ] Vercel
  - [ ] Supabase
  - [ ] Wompi (panel de comercio)
  - [ ] Resend
  - [ ] Sentry
  - [ ] Cloudflare
  - [ ] Registro del dominio
- [ ] Password manager para todas las cuentas operativas
- [ ] Sin accesos compartidos — cada persona tiene su usuario

## Dependencias

- [ ] Dependabot habilitado en el repo
- [ ] `pnpm audit` en CI (opcional: fail si high severity)
- [ ] Lockfile (`pnpm-lock.yaml`) commiteado
- [ ] `pnpm install --frozen-lockfile` en CI

## Backups y recuperación

- [ ] Backups de Supabase: confirmar que están activos (diarios)
- [ ] Backup adicional manual a R2 semanalmente (script `scripts/backup.sh`)
- [ ] Test de restore: al menos 1 vez en los 3 meses previos al lanzamiento
- [ ] Runbook de recuperación documentado en `docs/runbooks/disaster-recovery.md`
  *(pendiente crear antes de M3)*

## Legal / compliance

- [ ] Política de privacidad publicada en `sellio.co/privacy`
- [ ] Términos de servicio publicados en `sellio.co/terms`
- [ ] Consentimiento explícito antes de recolectar teléfono de cliente final
- [ ] Opción de eliminación de cuenta y de datos (Habeas Data)
- [ ] Proceso de respuesta a solicitudes de eliminación documentado
- [ ] Si manejas datos de >10.000 personas: base registrada ante SIC Colombia

## Monitoreo

- [ ] Sentry activo en ambas apps
- [ ] Alertas de Sentry configuradas para errores críticos
- [ ] Uptime monitoring (UptimeRobot u otro) pingea `/api/health` cada 5 min
- [ ] Canal de alertas (email, Telegram, Slack) donde llegan notificaciones críticas
- [ ] Dashboards de métricas de negocio (MRR, churn, check-ins) revisados semanalmente

## Plan de respuesta a incidentes

- [ ] Runbook de incidentes creado (`docs/runbooks/incident-response.md`)
  *(pendiente crear antes de M2.5)*
- [ ] Status page (`status.sellio.co`) configurada
- [ ] Plantilla de comunicación a usuarios en caso de breach
- [ ] Contactos de emergencia: Supabase support, Wompi support, Vercel support
