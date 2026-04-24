'use client';

import { useState } from 'react';

import { PALETTES, type Palette } from './palettes';
import { CardPreviewLive } from './card-preview-live';
import { Step1Business } from './step1-business';
import { Step2Card } from './step2-card';
import { Step3Done } from './step3-done';

interface OnboardingWizardProps {
  orgName: string;
}

type Direction = 'forward' | 'back';

interface WizardState {
  step: 0 | 1 | 2;
  direction: Direction;
  businessName: string;
  category: string;
  cardName: string;
  palette: Palette;
}

const STEP_LABELS = ['Negocio', 'Tarjeta', 'Listo'];

export function OnboardingWizard({ orgName }: OnboardingWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 0,
    direction: 'forward',
    businessName: orgName,
    category: '',
    cardName: 'Mi Tarjeta de Lealtad',
    palette: PALETTES[0]!,
  });

  const goToStep = (next: 0 | 1 | 2, dir: Direction) => {
    setState((prev) => ({ ...prev, step: next, direction: dir }));
  };

  const handleStep1Next = (data: { businessName: string; category: string }) => {
    setState((prev) => ({
      ...prev,
      step: 1,
      direction: 'forward',
      businessName: data.businessName,
      category: data.category,
    }));
  };

  const handleStep2Next = (data: { cardName: string; palette: Palette; cardId: string }) => {
    setState((prev) => ({
      ...prev,
      step: 2,
      direction: 'forward',
      cardName: data.cardName,
      palette: data.palette,
    }));
  };

  const slideClass =
    state.direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  const isBuilderStep = state.step === 1;
  const isDoneStep = state.step === 2;

  if (isBuilderStep) {
    return (
      <div className="min-h-screen bg-[#0D0B09]">
        <Step2Card
          palette={state.palette}
          cardName={state.cardName}
          businessName={state.businessName}
          onNext={handleStep2Next}
          onBack={() => goToStep(0, 'back')}
          onPaletteChange={(p) => setState((prev) => ({ ...prev, palette: p }))}
          onCardNameChange={(n) => setState((prev) => ({ ...prev, cardName: n }))}
        />
      </div>
    );
  }

  if (isDoneStep) {
    return (
      <Step3Done
        businessName={state.businessName}
        category={state.category}
        cardName={state.cardName}
        palette={state.palette}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div
        className={[
          'flex w-full flex-col border-r border-border px-14 py-10 md:flex-[0_0_520px] md:overflow-y-auto',
        ].join(' ')}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral font-display text-sm font-extrabold text-white">
              S
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-fg">
              Sellio<span className="text-coral">.</span>
            </span>
          </div>
          <span className="text-xs text-muted">
            Paso {state.step + 1} de 3
          </span>
        </div>

        <div className="mb-8 flex gap-1.5">
          {([0, 1, 2] as const).map((i) => {
            let fillWidth: string;
            if (i < state.step) fillWidth = '100%';
            else if (i === state.step) fillWidth = '60%';
            else fillWidth = '0%';

            return (
              <div
                key={i}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface-2"
                style={{ opacity: i > state.step ? 0.2 : 1 }}
              >
                <div
                  className="h-full rounded-full bg-coral transition-all duration-300"
                  style={{ width: fillWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="flex flex-1 flex-col justify-center">
          <div className={slideClass} key={state.step}>
            <h2 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-fg">
              {state.step === 0 && 'Cuéntanos sobre tu negocio'}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-muted">
              {state.step === 0 && 'Personaliza tu perfil para que tus clientes te reconozcan.'}
            </p>

            {state.step === 0 && (
              <Step1Business
                businessName={state.businessName}
                category={state.category}
                onNext={handleStep1Next}
              />
            )}
          </div>
        </div>

        {/* Step labels */}
        <div className="mt-8 flex gap-4">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={[
                'text-xs transition-colors',
                i === state.step ? 'font-semibold text-coral' : 'text-muted',
              ].join(' ')}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-surface md:flex">
        {/* Dynamic glow that follows the selected palette color */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{
            backgroundImage: `radial-gradient(ellipse 65% 45% at 50% 55%, ${state.palette.primary}18 0%, transparent 70%)`,
          }}
        />
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <CardPreviewLive
            businessName={state.businessName}
            cardName={state.cardName}
            palette={state.palette}
          />
          <p className="text-xs text-muted/50">
            Vista previa en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}
