'use client';

import { type FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { Alert, Button, FormField, Input } from '@sellio/ui';

import { addCustomerAction } from '@/actions/cards/customer.actions';

interface AddCustomerModalProps {
  cardId: string;
  closeHref: string;
}

export function AddCustomerModal({ cardId, closeHref }: AddCustomerModalProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addCustomerAction(cardId, formData);
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
      } else {
        router.push(closeHref);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <Link
        href={closeHref}
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        aria-label="Cerrar modal"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/20 bg-surface p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-fg">Agregar cliente</h2>
          <Link
            href={closeHref}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            aria-label="Cerrar"
          >
            <X size={18} />
          </Link>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Teléfono"
            htmlFor="phone"
            error={fieldErrors.phone}
            required
            hint="El número de teléfono identifica al cliente en tu negocio."
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+57 300 000 0000"
              autoFocus
              error={!!fieldErrors.phone}
            />
          </FormField>

          <FormField
            label="Nombre"
            htmlFor="name"
            error={fieldErrors.name}
            hint="Opcional."
          >
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Nombre del cliente"
              error={!!fieldErrors.name}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Link href={closeHref}>
              <Button type="button" variant="secondary" size="md">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" loading={isPending} size="md">
              Agregar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
