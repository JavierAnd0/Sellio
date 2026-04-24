'use client';

import { type FormEvent, useState, useTransition } from 'react';

import { Alert, Button, FormField, Input } from '@sellio/ui';
import type { Organization, Profile } from '@sellio/domain';

import { updateProfileAction } from '@/actions/profile/update-profile.action';

interface ProfileFormProps {
  initialProfile: Profile | null;
  initialOrg: Organization | null;
  fallbackName?: string;
}

export function ProfileForm({ initialProfile, initialOrg, fallbackName = '' }: ProfileFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [color, setColor] = useState(initialOrg?.primaryColor ?? '#E8341A');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfileAction(new FormData(e.currentTarget));
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-fg">
          Perfil
        </h2>
        <p className="mt-1 text-sm text-muted">
          Actualiza tu información personal y los datos de tu negocio.
        </p>
      </div>

      {success && (
        <Alert variant="success" className="mb-6">
          Cambios guardados correctamente.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección personal */}
        <section>
          <h3 className="mb-4 border-b border-border/20 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Información personal
          </h3>
          <div className="space-y-4">
            <FormField label="Nombre completo" htmlFor="fullName" error={fieldErrors.fullName}>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                defaultValue={initialProfile?.fullName || fallbackName}
                placeholder="Tu nombre"
                error={!!fieldErrors.fullName}
              />
            </FormField>
          </div>
        </section>

        {/* Sección negocio */}
        {initialOrg && (
          <section>
            <h3 className="mb-4 border-b border-border/20 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Tu negocio
            </h3>
            <div className="space-y-4">
              <FormField label="Nombre del negocio" htmlFor="orgName" error={fieldErrors.orgName}>
                <Input
                  id="orgName"
                  name="orgName"
                  type="text"
                  defaultValue={initialOrg.name}
                  placeholder="Café La Rosa"
                  error={!!fieldErrors.orgName}
                />
              </FormField>

              <FormField
                label="Color principal"
                htmlFor="primaryColor"
                error={fieldErrors.primaryColor}
                hint="Color de tu marca. Se usa en las tarjetas de tus clientes."
              >
                <div className="flex items-center gap-3">
                  <input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-border/20 bg-surface-2 p-1"
                  />
                  <Input
                    readOnly
                    value={color}
                    className="w-32 font-mono text-sm"
                  />
                </div>
              </FormField>
            </div>
          </section>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={isPending} size="md">
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
