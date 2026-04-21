# Onboarding de un nuevo comercio

Proceso para dar de alta a un comercio en Sellio. Hasta M3 es asistido (tú
presente). Post-M3 debería ser self-service en <30 min.

## M2.5 — Onboarding asistido

### Antes de la sesión

1. Confirmar por WhatsApp fecha y hora (30–45 min)
2. Enviar link de reunión (Meet/Zoom) o coordinar visita física
3. Pedir al comercio tener listos:
   - Logo (PNG o SVG, fondo transparente preferible)
   - Descripción corta del programa ("cada 10 cafés, uno gratis")
   - Color primario de la marca
   - Teléfono/email del dueño para la cuenta
4. Para el primer cliente real: preparar un descuento ("primer mes gratis" o
   "3 meses al 50%") para bajar fricción

### Durante la sesión

1. **Crear cuenta** (5 min)
   - Comercio abre `app.sellio.co/register`
   - Rellena: email, nombre del negocio, contraseña
   - Confirma email

2. **Configurar el perfil** (5 min)
   - Subir logo
   - Configurar color primario
   - Verificar timezone: `America/Bogota`

3. **Crear primera tarjeta** (10 min)
   - `/app/cards/new`
   - Nombre: ej. "Tarjeta Café Central"
   - Puntos por check-in: 1 (default)
   - Puntos para premio: depende del negocio — guiarlo (10 = cada 10 cafés; 5 = más generoso)
   - Descripción del premio: "Un café gratis" / "Un pan gratis"
   - Confirmar que la preview se ve bien

4. **Imprimir QR del mostrador** (5 min)
   - `/app/cards/[id]/qr-poster` → descargar PDF
   - Imprimir en tamaño postal o A5
   - Ubicar en un lugar visible del mostrador

5. **Primer cliente de prueba** (5 min)
   - Que el comercio saque su propio celular
   - Escanee el QR de mostrador
   - Ingrese su propio teléfono + nombre
   - Reciba OTP y confirme
   - Verifique que ve su tarjeta con "0 puntos" y progreso a 0%

6. **Simular un canje** (5 min)
   - Manualmente desde `/app/cards/[id]/customers`, agregar puntos hasta threshold
   - Que el cliente vea sus puntos actualizados
   - Desde `/app/redeem`, completar el canje
   - Verificar que se reseteó

7. **Configurar pago** (5 min)
   - `/app/billing` → elegir plan Basic
   - Checkout con Wompi
   - Confirmar que `subscription.status = 'active'` en BD

### Después de la sesión

1. Grabar cualquier feedback o bug observado
2. Agregar entrada en `docs/retros/onboarding-<slug>.md` con:
   - Qué funcionó
   - Qué no (friction points)
   - Features pedidas durante la sesión
3. Seguimiento a los 3 días: "¿cómo va todo? ¿los clientes están escaneando?"
4. Seguimiento a los 30 días: feedback + NPS

## Requisitos mínimos para que un comercio sea apto

- Tener QR en físico en el mostrador (no imaginar que todos los clientes conocen
  la tarjeta)
- Al menos 1 persona del staff entrenada para guiar a clientes nuevos
- Ya tener al menos 50 clientes recurrentes (si es nuevo negocio, Sellio no les
  ayuda mucho)
- Acceso a WhatsApp Business o similar para promocionar la tarjeta

## Playbook de activación (primeros 7 días)

Día 1: Setup completo, primer cliente real (dueño o empleado)
Día 2: Dueño promueve entre sus 10 clientes VIP ("tenemos tarjeta digital nueva")
Día 3: Primer canje real
Día 7: Check-in del founder: ¿cuántos clientes? ¿feedback?

Meta: 20+ clientes registrados en los primeros 7 días para considerar
el onboarding exitoso.
