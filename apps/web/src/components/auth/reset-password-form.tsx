'use client';

import { type FormEvent, useState, useTransition } from 'react';

import { Alert, Button, FormField, Input } from '@sellio/ui';

import { resetPasswordAction } from '@/actions/auth/reset-password.action';

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await resetPasswordAction(new FormData(e.currentTarget));
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
          Nueva contraseña.
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Ingresa tu nueva contraseña. Mínimo 8 caracteres.
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Nueva contraseña" htmlFor="password" error={fieldErrors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={!!fieldErrors.password}
          />
        </FormField>

        <FormField label="Confirmar contraseña" htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            error={!!fieldErrors.confirmPassword}
          />
        </FormField>

        <Button type="submit" fullWidth loading={isPending}>
          Actualizar contraseña
        </Button>
      </form>
    </div>
  );
}
