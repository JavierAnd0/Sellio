import type { Metadata } from 'next';
import { SecurityForm } from '@/components/settings/security-form';

export const metadata: Metadata = { title: 'Contraseña | Configuración' };

export default function SecurityPage() {
  return <SecurityForm />;
}
