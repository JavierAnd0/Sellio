-- ============================================================================
-- Sellio — Wallet Registrations (Apple Wallet Web Service Protocol)
-- ============================================================================

CREATE TABLE public.wallet_registrations (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_slug       text        NOT NULL,
  platform              text        NOT NULL CHECK (platform IN ('apple', 'google')),
  device_library_id     text,
  pass_type_identifier  text,
  push_token            text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wallet_registrations_apple_unique
    UNIQUE (device_library_id, pass_type_identifier, membership_slug)
);

CREATE INDEX idx_wallet_reg_slug ON public.wallet_registrations (membership_slug);
CREATE INDEX idx_wallet_reg_device ON public.wallet_registrations (device_library_id, pass_type_identifier);

ALTER TABLE public.wallet_registrations ENABLE ROW LEVEL SECURITY;
-- Solo accesible via service_role (createAdminClient) — no políticas RLS para usuarios
