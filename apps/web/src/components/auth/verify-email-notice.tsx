'use client';

import { useState, useTransition } from 'react';

import { Alert, Button } from '@sellio/ui';

import { resendVerificationAction } from '@/actions/auth/register.action';

interface VerifyEmailNoticeProps {
  email?: string;
}

export function VerifyEmailNotice({ email }: VerifyEmailNoticeProps) {
  const [resent, setResent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    if (!email) return;
    startTransition(async () => {
      const result = await resendVerificationAction(email);
      if (result.ok) setResent(true);
    });
  };

  return (
    <div className="animate-fade-slide-in">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-coral/10 text-coral">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-fg">
          Revisa tu correo.
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Te enviamos un enlace de confirmación
          {email ? (
            <>
              {' '}a <span className="font-medium text-fg">{email}</span>
            </>
          ) : null}
          . Haz clic en él para activar tu cuenta.
        </p>
      </div>

      {resent && (
        <Alert variant="success" className="mb-4">
          Correo reenviado. Revisa también tu carpeta de spam.
        </Alert>
      )}

      <div className="space-y-3">
        {email && !resent && (
          <Button
            variant="secondary"
            fullWidth
            loading={isPending}
            onClick={handleResend}
          >
            Reenviar correo
          </Button>
        )}
        <p className="text-center text-xs text-muted">
          ¿El correo llegó a spam? Márcalo como &quot;No es spam&quot; para futuros emails.
        </p>
      </div>
    </div>
  );
}
