import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import { aggregateReach, getWalletReach } from '@sellio/db/wallet-campaigns';
import { CampaignsClient } from './campaigns-client';

export const metadata: Metadata = { title: 'Campañas' };

export default async function CampaignsPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) redirect('/app/dashboard');

  if (org.plan !== 'elite' && org.plan !== 'enterprise') {
    redirect('/app/analytics');
  }

  const [campaignsRes, cardsRes, reach] = await Promise.all([
    db
      .from('campaigns')
      .select('id, title, message, status, sent_at, created_at, card_id, wallet_devices, wallet_google, wallet_delivery, cards(name)')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false }),
    db
      .from('cards')
      .select('id, name')
      .eq('org_id', org.id)
      .eq('active', true),
    // Alcance (clientes y dispositivos Apple Wallet) para confirmar antes de enviar.
    // Usa service role, acotado a la org del usuario ya autenticado.
    getWalletReach(org.id).catch(() => aggregateReach([], [], [])),
  ]);

  const campaigns = (campaignsRes.data ?? []).map((c) => ({
    ...c,
    cardName: (c.cards as { name: string } | null)?.name ?? null,
  }));

  return (
    <CampaignsClient
      campaigns={campaigns}
      cards={cardsRes.data ?? []}
      orgName={org.name}
      reach={reach}
    />
  );
}
