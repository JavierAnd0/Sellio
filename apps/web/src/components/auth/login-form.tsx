'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';

import { Alert, Button, FormField, Input, Separator } from '@sellio/ui';

import { loginAction } from '@/actions/auth/login.action';

export function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await loginAction(new FormData(e.currentTarget));
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
      }
    });
  };

  return (
    <div className="animate-fade-slide-in">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-fg">
          Bienvenido de nuevo.
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Ingresa a tu cuenta para gestionar tus tarjetas de lealtad.
        </p>
      </div>

      {resetSuccess && (
        <Alert variant="success" className="mb-4">
          Contraseña actualizada correctamente. Ingresa con tu nueva contraseña.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@negocio.com"
            error={!!fieldErrors.email}
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" error={fieldErrors.password}>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!fieldErrors.password}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-fg transition-colors"
              tabIndex={-1}
            >
              {showPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-coral hover:opacity-80 transition-opacity">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isPending} className="mt-2">
          Ingresar
        </Button>
      </form>

      <Separator label="o continúa con" className="my-5" />

      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-border/20 bg-surface-2 px-4 py-3 text-sm font-semibold text-muted opacity-60"
      >
        <GoogleIcon />
        Continuar con Google
        <span className="ml-auto rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted">
          Próximamente
        </span>
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-semibold text-coral hover:opacity-80 transition-opacity">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
