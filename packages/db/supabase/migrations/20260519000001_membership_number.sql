-- ============================================================================
-- Sellio — member_number: número secuencial de miembro por tarjeta
-- ============================================================================

-- Añadir columna (nullable primero para poder hacer el backfill)
ALTER TABLE public.memberships
  ADD COLUMN member_number integer;

-- Backfill: asignar números secuenciales por card_id ordenados por fecha de ingreso
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY joined_at, id) AS rn
  FROM public.memberships
)
UPDATE public.memberships m
SET member_number = r.rn
FROM ranked r
WHERE m.id = r.id;

-- Hacer NOT NULL y añadir restricción de unicidad por tarjeta
ALTER TABLE public.memberships
  ALTER COLUMN member_number SET NOT NULL,
  ADD CONSTRAINT memberships_card_member_number_unique UNIQUE (card_id, member_number);

-- Función que asigna el siguiente número disponible al insertar
CREATE OR REPLACE FUNCTION public.assign_membership_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    SELECT COALESCE(MAX(member_number), 0) + 1
    INTO NEW.member_number
    FROM public.memberships
    WHERE card_id = NEW.card_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER memberships_number_trigger
  BEFORE INSERT ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.assign_membership_number();
