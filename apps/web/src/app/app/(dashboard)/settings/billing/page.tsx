import type { Metadata } from 'next';
import { BillingContent } from '@/components/settings/billing-content';

export const metadata: Metadata = { title: 'Facturación | Configuración' };

export default function BillingPage() {
  return <BillingContent />;
}
