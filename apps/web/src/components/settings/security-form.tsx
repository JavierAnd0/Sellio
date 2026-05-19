'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { Alert, Button, Input } from '@sellio/ui';
import { changePasswordAction } from '@/actions/profile/change-password.action';

export function SecurityForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const target = e.currentTarget;

    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error || 'Error' });
        else setError(result.error || 'Error inesperado');
      } else {
        setSuccess(true);
        target.reset(); // Clear passwords
      }
    });
  };

  return (
    <div className="rounded-2xl bg-surface shadow-sm border border-border/10 p-8 max-w-[560px]">
      <div className="mb-8">
        <h2 className="font-display text-[28px] font-black tracking-tight text-fg mb-1">
          Contraseña
        </h2>
        <p className="text-[15px] text-muted">
          Cambia tu contraseña de acceso a la plataforma.
        </p>
      </div>

      {success && (
        <Alert variant="success" className="mb-6">
          Tu contraseña ha sido actualizada correctamente.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-[15px] font-bold text-fg">
            Contraseña actual
          </label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={!!fieldErrors.currentPassword}
            className="h-[46px] rounded-xl border-border/20 shadow-sm px-4"
          />
          {fieldErrors.currentPassword && (
            <p className="text-xs text-error">{fieldErrors.currentPassword}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="newPassword" className="text-[15px] font-bold text-fg">
            Nueva contraseña
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={!!fieldErrors.newPassword}
            className="h-[46px] rounded-xl border-border/20 shadow-sm px-4"
          />
          {fieldErrors.newPassword && (
            <p className="text-xs text-error">{fieldErrors.newPassword}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-[15px] font-bold text-fg">
            Confirmar nueva contraseña
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={!!fieldErrors.confirmPassword}
            className="h-[46px] rounded-xl border-border/20 shadow-sm px-4"
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-error">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            loading={isPending}
            className="bg-[#E8341A] hover:bg-[#D02B13] text-white font-bold px-6 py-3.5 h-auto rounded-xl shadow-sm transition-colors text-[15px]"
          >
            Actualizar contraseña
          </Button>
        </div>
      </form>
    </div>
  );
}
