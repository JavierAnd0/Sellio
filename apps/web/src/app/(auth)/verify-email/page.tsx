import type { Metadata } from 'next';

import { VerifyEmailNotice } from '@/components/auth/verify-email-notice';

export const metadata: Metadata = { title: 'Verifica tu email' };

export default function VerifyEmailPage() {
  return <VerifyEmailNotice />;
}
