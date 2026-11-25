-- ============================================================================
-- Sellio — Entrega de campañas a Apple Wallet / Google Wallet
-- ============================================================================
-- Al enviar una campaña, su mensaje se escribe en el pass (campo con
-- changeMessage) y se notifica a los dispositivos.
--   wallet_devices  → dispositivos Apple Wallet que recibieron el push
--   wallet_google   → passes de Google Wallet a los que se envió el mensaje
--   wallet_delivery → resultado de la entrega

ALTER TABLE public.campaigns
  ADD COLUMN wallet_devices  integer NOT NULL DEFAULT 0,
  ADD COLUMN wallet_google   integer NOT NULL DEFAULT 0,
  ADD COLUMN wallet_delivery text    NOT NULL DEFAULT 'pending'
    CHECK (wallet_delivery IN ('pending', 'ok', 'failed', 'skipped'));

-- El pass busca la última campaña enviada de su org/tarjeta.
CREATE INDEX idx_campaigns_org_sent
  ON public.campaigns (org_id, sent_at DESC)
  WHERE status = 'sent';
