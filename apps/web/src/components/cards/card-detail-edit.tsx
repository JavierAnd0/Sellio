'use client';

import { type FormEvent, useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { Palette, Trash2 } from 'lucide-react';
import type { Card } from '@sellio/domain';
import { Alert, Button, FormField, Input } from '@sellio/ui';

import { deleteCardAction, updateCardAction } from '@/actions/cards/card.actions';
import { CardPreviewMini } from './card-preview-mini';

interface CardDetailEditProps {
  card: Card;
  primaryColor: string;
  canDelete?: boolean;
}

export function CardDetailEdit({ card, primaryColor, canDelete = false }: CardDetailEditProps) {
  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.description ?? '');
  const [rewardDescription, setRewardDescription] = useState(card.rewardDescription ?? '');
  const [pointsPerCheckin, setPointsPerCheckin] = useState(String(card.pointsPerCheckin));
  const [pointsForReward, setPointsForReward] = useState(String(card.pointsForReward));
  const [maxMembers, setMaxMembers] = useState(card.maxMembers?.toString() ?? '');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = useCallback(() => {
    if (!window.confirm('¿Eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;
    startDeleteTransition(async () => {
      await deleteCardAction(card.id);
    });
  }, [card.id, startDeleteTransition]);

  const savedDesign = card.design as Record<string, unknown> | null | undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateCardAction(card.id, formData);
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      <CardPreviewMini
        name={name || card.name}
        rewardDescription={rewardDescription || card.rewardDescription}
        pointsForReward={Number(pointsForReward) || card.pointsForReward}
        primaryColor={primaryColor}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="design" value={savedDesign ? JSON.stringify(savedDesign) : ''} />

        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Configuración
          </p>

          <div className="space-y-4">
            <FormField label="Nombre de la tarjeta" htmlFor="name" error={fieldErrors.name} required>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                error={!!fieldErrors.name}
              />
            </FormField>

            <FormField label="Descripción" htmlFor="description" error={fieldErrors.description}>
              <Input
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </FormField>

            <FormField
              label="Recompensa"
              htmlFor="rewardDescription"
              error={fieldErrors.rewardDescription}
              required
            >
              <Input
                id="rewardDescription"
                name="rewardDescription"
                value={rewardDescription}
                placeholder="1 café gratis"
                onChange={(e) => setRewardDescription(e.target.value)}
                error={!!fieldErrors.rewardDescription}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
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
                  value={pointsPerCheckin}
                  onChange={(e) => setPointsPerCheckin(e.target.value)}
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
                  value={pointsForReward}
                  onChange={(e) => setPointsForReward(e.target.value)}
                  error={!!fieldErrors.pointsForReward}
                />
              </FormField>
            </div>

            <FormField
              label="Máximo de miembros"
              htmlFor="maxMembers"
              error={fieldErrors.maxMembers}
              hint="Déjalo vacío para no poner límite."
            >
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min={1}
                value={maxMembers}
                placeholder="Sin límite"
                onChange={(e) => setMaxMembers(e.target.value)}
              />
            </FormField>
          </div>
        </div>

        {success && <Alert variant="success">Cambios guardados correctamente.</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canDelete && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                loading={isDeleting}
                onClick={handleDelete}
                className="text-error hover:border-error/40"
              >
                <Trash2 size={16} />
                Eliminar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/app/cards/${card.id}/builder`}>
              <Button variant="secondary" type="button" size="md">
                <Palette size={16} />
                Editar diseño
              </Button>
            </Link>
            <Button type="submit" loading={isPending} size="md">
              Guardar cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
