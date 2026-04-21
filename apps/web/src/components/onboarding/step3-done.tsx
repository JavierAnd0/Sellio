'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { updateBusinessAction } from '@/actions/onboarding/onboarding.actions';

interface Step3DoneProps {
  businessName: string;
  category: string;
}

export function Step3Done({ businessName, category: _category }: Step3DoneProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const result = await updateBusinessAction(businessName);

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setStatus('error');
        return;
      }

      setStatus('done');

      // Brief pause so the user can see the success state before redirect
      await new Promise<void>((resolve) => setTimeout(resolve, 1800));

      if (!cancelled) {
        router.push('/app/dashboard');
      }
    }

    void finish();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-coral/20 border-t-coral" />
        <p className="text-sm text-muted">Guardando tu configuración…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-error">{error}</p>
        <button
          type="button"
          className="text-xs text-coral underline hover:opacity-80 transition-opacity"
          onClick={() => {
            setStatus('loading');
            setError(null);
            void updateBusinessAction(businessName).then((result) => {
              if (!result.ok) {
                setError(result.error);
                setStatus('error');
              } else {
                setStatus('done');
                setTimeout(() => router.push('/app/dashboard'), 1800);
              }
            });
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      {/* Checkmark */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral/10">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E8341A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="animate-[scale-in_0.3s_ease-out]"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div>
        <h3 className="font-display text-2xl font-extrabold tracking-tight text-fg">
          ¡Todo listo!
        </h3>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
          Tu negocio y tu primera tarjeta de lealtad están configurados. Te llevamos a
          tu dashboard.
        </p>
      </div>

      <span className="h-5 w-5 animate-spin rounded-full border-2 border-coral/30 border-t-coral" />
    </div>
  );
}
