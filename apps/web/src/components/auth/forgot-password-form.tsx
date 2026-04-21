'use client';

import Link from 'next/link';
import { type FormEvent, useState, useTransition } from 'react';

import { Alert, Button, FormField, Input } from '@sellio/ui';

import { forgotPasswordAction } from '@/actions/auth/forgot-password.action';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await forgotPasswordAction(new FormData(e.currentTarget));
      if (!result.ok) setError(result.error);
      else setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="animate-fade-slide-in text-center">
        <div className="mb-5 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10 text-success">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-fg">
          ¡Listo!
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Si ese email está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-coral hover:opacity-80 transition-opacity"
        >
          ← Volver al login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-fg">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Ingresa tu email y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@negocio.com"
          />
        </FormField>

        <Button type="submit" fullWidth loading={isPending}>
          Enviar enlace
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-coral hover:opacity-80 transition-opacity">
          ← Volver al login
        </Link>
      </p>
    </div>
  );
}
