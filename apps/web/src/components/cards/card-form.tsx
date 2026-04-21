'use client';

import { type FormEvent, useState, useTransition } from 'react';

import { Alert, Button, FormField, Input } from '@sellio/ui';
import type { Card } from '@sellio/domain';

import { createCardAction, updateCardAction } from '@/actions/cards/card.actions';
import { CardPreviewMini } from './card-preview-mini';

interface CardFormProps {
  card?: Card;
  primaryColor?: string;
}

export function CardForm({ card, primaryColor = '#E8341A' }: CardFormProps) {
  const isEdit = !!card;

  const [name, setName] = useState(card?.name ?? '');
  const [rewardDescription, setRewardDescription] = useState(card?.rewardDescription ?? '');
  const [pointsForReward, setPointsForReward] = useState(card?.pointsForReward ?? 10);
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

    startTransition(async () => {
      if (isEdit) {
        const result = await updateCardAction(card.id, formData);
        if (!result.ok) {
          if (result.field) setFieldErrors({ [result.field]: result.error });
          else setError(result.error);
        } else {
          setSuccess(true);
        }
      } else {
        // createCardAction redirects on success, throws on error
        try {
          await createCardAction(formData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al crear la tarjeta.');
        }
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Nombre de la tarjeta"
            htmlFor="name"
            error={fieldErrors.name}
            required
          >
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ej. Tarjeta Café VIP"
              defaultValue={card?.name ?? ''}
              onChange={(e) => setName(e.target.value)}
              error={!!fieldErrors.name}
              maxLength={60}
            />
          </FormField>

          <FormField
            label="Descripción"
            htmlFor="description"
            error={fieldErrors.description}
            hint="Opcional. Describe brevemente para qué sirve esta tarjeta."
          >
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Ej. Acumula puntos en cada compra"
              defaultValue={card?.description ?? ''}
              error={!!fieldErrors.description}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Puntos por visita"
              htmlFor="pointsPerCheckin"
              error={fieldErrors.pointsPerCheckin}
              required
            >
              <Input
                id="pointsPerCheckin"
                name="pointsPerCheckin"
                type="number"
                min={1}
                defaultValue={card?.pointsPerCheckin ?? 1}
                error={!!fieldErrors.pointsPerCheckin}
              />
            </FormField>

            <FormField
              label="Puntos para recompensa"
              htmlFor="pointsForReward"
              error={fieldErrors.pointsForReward}
              required
            >
              <Input
                id="pointsForReward"
                name="pointsForReward"
                type="number"
                min={1}
                defaultValue={card?.pointsForReward ?? 10}
                onChange={(e) => setPointsForReward(Number(e.target.value))}
                error={!!fieldErrors.pointsForReward}
              />
            </FormField>
          </div>

          <FormField
            label="Descripción de la recompensa"
            htmlFor="rewardDescription"
            error={fieldErrors.rewardDescription}
            required
          >
            <Input
              id="rewardDescription"
              name="rewardDescription"
              type="text"
              placeholder="Ej. Café gratis"
              defaultValue={card?.rewardDescription ?? ''}
              onChange={(e) => setRewardDescription(e.target.value)}
              error={!!fieldErrors.rewardDescription}
            />
          </FormField>

          <FormField
            label="Máximo de miembros"
            htmlFor="maxMembers"
            error={fieldErrors.maxMembers}
            hint="Opcional. Deja vacío para sin límite."
          >
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min={1}
              defaultValue={card?.maxMembers ?? ''}
              placeholder="Sin límite"
              error={!!fieldErrors.maxMembers}
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => (window.location.href = '/app/cards')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isPending} size="md">
              {isEdit ? 'Guardar cambios' : 'Crear tarjeta'}
            </Button>
          </div>
        </form>
      </div>

      {/* Live preview */}
      <div className="lg:pt-0">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Vista previa
        </p>
        <CardPreviewMini
          name={name}
          rewardDescription={rewardDescription}
          pointsForReward={pointsForReward}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}
