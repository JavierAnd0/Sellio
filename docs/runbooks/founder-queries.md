# Consultas SQL para el Dashboard del Fundador (M2.5-05)

Como fundador, puedes ejecutar estas consultas directamente en el **SQL Editor de tu consola de Supabase** para monitorear el estado del negocio en tiempo real.

---

## 1. Check-ins de Hoy
Esta consulta muestra cuántos escaneos y acumulaciones de puntos han realizado los clientes en el día de hoy (en la zona horaria del servidor).

```sql
SELECT count(*) AS checkins_hoy
FROM public.point_transactions
WHERE type = 'earn'
  AND source = 'checkin'
  AND created_at >= CURRENT_DATE;
```

---

## 2. Clientes Registrados Totales y Activos
Obtén el número total de clientes finales en la plataforma y cuántos se han registrado en los últimos 7 días.

```sql
SELECT 
  count(*) AS total_clientes,
  count(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days') AS registrados_ultima_semana
FROM public.customers;
```

---

## 3. Comercios Activos por Plan
Muestra la cantidad de organizaciones registradas agrupadas por su plan actual.

```sql
SELECT 
  plan,
  count(*) AS cantidad_comercios
FROM public.organizations
GROUP BY plan
ORDER BY cantidad_comercios DESC;
```

---

## 4. Ingreso Recurrente Mensual (MRR) en COP
Calcula el MRR sumando las facturas cobradas con éxito en los últimos 30 días. La consulta divide por 100 para convertir los centavos de Wompi a pesos colombianos enteros.

```sql
SELECT 
  coalesce(sum(amount_cents) / 100.0, 0) AS mrr_cop_ultimos_30_dias
FROM public.invoices
WHERE status = 'paid'
  AND currency = 'COP'
  AND paid_at >= now() - INTERVAL '30 days';
```

---

## 5. Historial de Facturación Reciente
Lista los últimos 10 pagos recibidos indicando el nombre de la organización, el monto cobrado y la fecha del pago.

```sql
SELECT 
  o.name AS negocio,
  i.amount_cents / 100.0 AS monto_cop,
  i.paid_at,
  i.provider_invoice_id AS ref_wompi
FROM public.invoices i
JOIN public.organizations o ON i.org_id = o.id
WHERE i.status = 'paid'
ORDER BY i.paid_at DESC
LIMIT 10;
```
