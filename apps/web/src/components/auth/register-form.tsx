'use client';

import Link from 'next/link';
import { type FormEvent, useState, useTransition } from 'react';

import { Alert, Button, FormField, Input } from '@sellio/ui';

import { registerAction } from '@/actions/auth/register.action';

function passwordStrength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const STRENGTH_COLORS = ['', '#FF4444', '#E8B96A', '#4FC3F7', '#52D699'];

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const strength = passwordStrength(password);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await registerAction(new FormData(e.currentTarget));
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
          Crea tu cuenta.
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Empieza gratis. Sin tarjeta de crédito.
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Nombre completo" htmlFor="fullName" error={fieldErrors.fullName} required>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="María García"
            error={!!fieldErrors.fullName}
          />
        </FormField>

        <FormField label="Nombre de tu negocio" htmlFor="businessName" error={fieldErrors.businessName} required>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            placeholder="Café La Rosa"
            error={!!fieldErrors.businessName}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={fieldErrors.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@negocio.com"
            error={!!fieldErrors.email}
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" error={fieldErrors.password} required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {/* Barra de fortaleza */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'rgb(var(--surface-2))' }}
                  />
                ))}
              </div>
              {strength > 0 && (
                <p className="mt-1 text-xs" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </p>
              )}
            </div>
          )}
        </FormField>

        <Button type="submit" fullWidth loading={isPending} className="mt-2">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-coral hover:opacity-80 transition-opacity">
          Ingresar
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted">
        Al crear tu cuenta aceptas nuestros{' '}
        <a href="#" className="underline hover:text-fg transition-colors">
          Términos de servicio
        </a>{' '}
        y{' '}
        <a href="#" className="underline hover:text-fg transition-colors">
          Política de privacidad
        </a>
        .
      </p>
    </div>
  );
}
