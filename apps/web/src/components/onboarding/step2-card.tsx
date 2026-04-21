'use client';

import { useState, useTransition } from 'react';

import { Button, FormField, Input } from '@sellio/ui';

import { createFirstCardAction } from '@/actions/onboarding/onboarding.actions';
import { PALETTES, type Palette } from './palettes';

interface Step2CardProps {
  palette: Palette;
  cardName: string;
  businessName: string;
  onNext: (data: { cardName: string; palette: Palette; cardId: string }) => void;
  onBack: () => void;
  onPaletteChange?: (palette: Palette) => void;
  onCardNameChange?: (name: string) => void;
}

export function Step2Card({ palette, cardName, businessName, onNext, onBack, onPaletteChange, onCardNameChange }: Step2CardProps) {
  const [name, setName] = useState(cardName);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(palette);
  const [nameError, setNameError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('El nombre de la tarjeta es obligatorio');
      return;
    }

    setServerError(null);

    startTransition(async () => {
      const result = await createFirstCardAction({
        cardName: name.trim(),
        primaryColor: selectedPalette.primary,
        gradientBg: selectedPalette.bg,
        businessName,
      });

      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      onNext({ cardName: name.trim(), palette: selectedPalette, cardId: result.cardId });
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormField
        label="Nombre de la tarjeta"
        htmlFor="cardName"
        error={nameError}
        hint={`${name.length}/30 caracteres`}
        required
      >
        <Input
          id="cardName"
          name="cardName"
          type="text"
          placeholder="Mi Tarjeta de Lealtad"
          value={name}
          maxLength={30}
          onChange={(e) => {
            setName(e.target.value);
            onCardNameChange?.(e.target.value);
            if (nameError) setNameError(undefined);
          }}
          error={!!nameError}
          autoFocus
        />
      </FormField>

      {/* Palette selector */}
      <div>
        <p className="mb-3 text-sm font-medium text-fg">Paleta de color</p>
        <div className="grid grid-cols-3 gap-2.5">
          {PALETTES.map((p) => {
            const isSelected = p.name === selectedPalette.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setSelectedPalette(p);
                  onPaletteChange?.(p);
                }}
                className={[
                  'relative flex h-14 flex-col items-center justify-end overflow-hidden rounded-xl pb-1.5 text-[10px] font-semibold text-white transition-all',
                  isSelected
                    ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-bg scale-[1.03]'
                    : 'opacity-80 hover:opacity-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ background: p.bg }}
                aria-label={p.name}
                aria-pressed={isSelected}
              >
                <span className="relative z-10 drop-shadow">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {serverError && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{serverError}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isPending}
          className="flex-1"
        >
          Atrás
        </Button>
        <Button type="submit" loading={isPending} className="flex-[2]">
          Continuar
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
