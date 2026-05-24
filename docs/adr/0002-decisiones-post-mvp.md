# ADR-0002 — Decisiones técnicas del Milestone 2 (First Dollar)

**Estado:** Aceptado
**Fecha:** 2026-05-24
**Autor:** Fundador de Sellio

## Contexto

Durante el desarrollo del Milestone 2 (First Dollar), tuvimos que resolver decisiones de arquitectura claves en la integración de pagos, control de sesión/acceso, y resiliencia ante fallos. Este documento registra esas elecciones técnicas y sus implicaciones.

## Decisiones

### D2.1 — Suscripciones emuladas localmente en Postgres
**Decisión:** Dado que Wompi no gestiona de forma nativa contratos de suscripción recurrentes automáticos en su Webcheckout sandbox, implementamos las suscripciones localmente en la base de datos de Sellio con periodos fijos de acceso de 30 días, extendidos mediante webhooks de transacciones exitosas.

* **Alternativas consideradas:**
  * Forzar la integración con el API tokenizado de Wompi desde el día 1 (requiere procesos PCI-DSS más complejos y mayor fricción de desarrollo).
  * Usar links de cobro mensuales enviados por correo/WhatsApp de manera manual.
* **Razones:**
  * Minimiza el tiempo de desarrollo inicial en M2.
  * Mantiene una DX fluida en el Webcheckout simple.
  * El modelo de base de datos (`subscriptions` e `invoices`) ya queda preparado para soportar recurrencia real mediante tokenización de tarjetas (Wompi) o a través de Stripe en el futuro (post-M4).
* **Consecuencias:**
  * El sistema de base de datos asume accesos de 30 días.
  * Al finalizar los 30 días, si no se recibe un nuevo webhook de pago aprobado, el plan expira y el middleware bloquea el dashboard.

---

### D2.2 — Adopción de la convención `proxy.ts` de Next.js 16
**Decisión:** En Next.js 16, la ruta y nombre estándar del archivo de middleware a nivel de request cambió a `src/proxy.ts`. Implementamos toda la lógica de redirección por trial expirada y protección de rutas en `apps/web/src/proxy.ts` y eliminamos cualquier rastro de `middleware.ts`.

* **Razones:**
  * Intentar mantener `middleware.ts` junto con `proxy.ts` provoca colisiones de compilación y errores fatales de build en Next.js 16.
  * `proxy.ts` corre de forma nativa en Edge y asegura el refresco correcto de las cookies de sesión de Supabase Auth en cada request.
* **Consecuencias:**
  * Todo el ruteo de seguridad del dashboard se centraliza en `proxy.ts`.
  * La configuración del matcher excluye estáticos y recursos pesados para optimizar el performance.

---

### D2.3 — Idempotencia de webhooks en dos fases (State Machine)
**Decisión:** Para evitar perder reintentos válidos de Wompi cuando ocurren fallos de base de datos en el webhook, registramos los eventos en `webhook_events` con estado inicial pendiente (`processed_at: null`) y solo actualizamos el timestamp al finalizar con éxito las operaciones de negocio.

* **Razones:**
  * Si registramos el evento como completado (`processed_at = now()`) inmediatamente al entrar el request, cualquier fallo posterior de red o base de datos devuelve un código HTTP `500` a Wompi.
  * Al reintentar, el validador de duplicados vería el evento ya registrado y retornaría `200 OK` sin procesar el pago, dejando al cliente sin servicio.
  * El modelo de dos fases permite que los reintentos ejecuten la lógica de negocio si el intento previo falló, registrando además el log de error exacto en la columna `error` para facilitar la auditoría.
* **Consecuencias:**
  * Mayor resiliencia en la activación de planes.
  * Diagnóstico rápido desde la base de datos de Supabase.

---

### D2.4 — Facturación de suscripciones exclusivamente en Pesos Colombianos (COP)
**Decisión:** Los precios en el dashboard se muestran y cobran en COP ($35.000 COP/mes para el Plan Basic y $95.000 COP/mes para el Plan Elite), y los centavos Wompi se calculan multiplicando el valor por 100 (p. ej., `3500000` centavos).

* **Razones:**
  * Es la moneda del mercado objetivo primario (cafeterías y comercios colombianos).
  * Reduce la fricción de conversión de divisas para el comercio local.
* **Consecuencias:**
  * Todo el flujo de Wompi y almacenamiento de invoices almacena `currency = 'COP'`.
