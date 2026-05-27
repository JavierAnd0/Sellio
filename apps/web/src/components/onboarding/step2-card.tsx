'use client';

import { type CSSProperties, useMemo, useState, useTransition } from 'react';

import { Alert, Button } from '@sellio/ui';

import { createFirstCardAction } from '@/actions/onboarding/onboarding.actions';
import type { Palette } from './palettes';

interface Step2CardProps {
  palette: Palette;
  cardName: string;
  businessName: string;
  onNext: (data: { cardName: string; palette: Palette; cardId: string }) => void;
  onBack: () => void;
  onPaletteChange?: (palette: Palette) => void;
  onCardNameChange?: (name: string) => void;
}

type Tier = 'free' | 'basic' | 'elite';
type TabId = 'templates' | 'background' | 'colors' | 'typography' | 'elements';
type TemplateId = 'classic' | 'bold' | 'split' | 'luxury' | 'stamp' | 'minimal';
type PointsStyleId = 'number' | 'bar' | 'stamps' | 'stars';

interface BuilderPalette {
  id: string;
  primary: string;
  bg: string;
  name: string;
}

interface FontOption {
  id: string;
  display: string;
  body: string;
  name: string;
  tier: Tier;
}

interface BuilderState {
  template: TemplateId;
  palette: string;
  font: string;
  businessName: string;
  cardName: string;
  pattern: string;
  pointsStyle: PointsStyleId;
  showBadge: boolean;
  badgeText: string;
  showMemberNum: boolean;
  qrStyle: 'simple' | 'colored' | 'logo';
}

const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, elite: 2 };
const canUse = (tier: Tier, required: Tier) => TIER_ORDER[tier] >= TIER_ORDER[required];

const BASE_PALETTES: BuilderPalette[] = [
  {
    id: 'coral',
    primary: '#E8341A',
    bg: 'linear-gradient(135deg,#1A0806 0%,#3A1006 55%,#E8341A 100%)',
    name: 'Coral',
  },
  {
    id: 'indigo',
    primary: '#5B3FE8',
    bg: 'linear-gradient(135deg,#09061A 0%,#1A0D4A 55%,#5B3FE8 100%)',
    name: 'Indigo',
  },
  {
    id: 'emerald',
    primary: '#1A8C5B',
    bg: 'linear-gradient(135deg,#021208 0%,#083220 55%,#1A8C5B 100%)',
    name: 'Esmeralda',
  },
  {
    id: 'amber',
    primary: '#C17D3C',
    bg: 'linear-gradient(135deg,#100B04 0%,#2E1E08 55%,#C17D3C 100%)',
    name: 'Ambar',
  },
  {
    id: 'violet',
    primary: '#9B3FE8',
    bg: 'linear-gradient(135deg,#0A0618 0%,#22084A 55%,#9B3FE8 100%)',
    name: 'Violeta',
  },
  {
    id: 'teal',
    primary: '#1A8C8C',
    bg: 'linear-gradient(135deg,#021010 0%,#083030 55%,#1A8C8C 100%)',
    name: 'Teal',
  },
];

const PATTERNS = [
  { id: 'none', name: 'Sin patron', css: '', size: '' },
  {
    id: 'dots',
    name: 'Puntos',
    css: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
    size: '20px 20px',
  },
  {
    id: 'lines',
    name: 'Lineas',
    css: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)',
    size: '',
  },
  {
    id: 'grid',
    name: 'Grid',
    css: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
    size: '24px 24px',
  },
];

const FONTS: FontOption[] = [
  { id: 'syne', display: 'Syne', body: 'Space Grotesk', name: 'Syne + Space Grotesk', tier: 'free' },
  { id: 'playfair', display: 'Playfair Display', body: 'DM Sans', name: 'Playfair + DM Sans', tier: 'basic' },
  { id: 'cabinet', display: 'Cabinet Grotesk', body: 'Space Grotesk', name: 'Cabinet + Grotesk', tier: 'basic' },
  { id: 'mono', display: 'Space Grotesk', body: 'Space Grotesk', name: 'Monoespaciado', tier: 'elite' },
];

const TEMPLATES: Array<{ id: TemplateId; name: string; tier: Tier }> = [
  { id: 'classic', name: 'Classic', tier: 'free' },
  { id: 'bold', name: 'Bold', tier: 'basic' },
  { id: 'split', name: 'Split', tier: 'basic' },
  { id: 'luxury', name: 'Luxury', tier: 'elite' },
  { id: 'stamp', name: 'Stamp', tier: 'basic' },
  { id: 'minimal', name: 'Minimal', tier: 'basic' },
];

const BADGE_OPTIONS = [
  'Gold Member',
  'Silver Member',
  'Bronze Member',
  'VIP',
  'Founding Member',
  'Loyal Customer',
];
const POINTS_STYLES: Array<{ id: PointsStyleId; label: string; tier: Tier }> = [
  { id: 'number', label: 'Numero', tier: 'free' },
  { id: 'bar', label: 'Barra', tier: 'basic' },
  { id: 'stamps', label: 'Sellos', tier: 'basic' },
  { id: 'stars', label: 'Estrellas', tier: 'elite' },
];

const DEFAULT_BUILDER: BuilderState = {
  template: 'classic',
  palette: 'coral',
  font: 'syne',
  businessName: 'Cafe Central',
  cardName: 'Member Card',
  pattern: 'none',
  pointsStyle: 'number',
  showBadge: false,
  badgeText: 'Gold Member',
  showMemberNum: false,
  qrStyle: 'simple',
};

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'templates', label: 'Plantillas' },
  { id: 'background', label: 'Fondo' },
  { id: 'colors', label: 'Colores' },
  { id: 'typography', label: 'Tipo' },
  { id: 'elements', label: 'Elementos' },
];

export function Step2Card({
  palette,
  cardName,
  businessName,
  onNext,
  onBack,
  onPaletteChange,
  onCardNameChange,
}: Step2CardProps) {
  const [tier, setTier] = useState<Tier>('free');
  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [description, setDescription] = useState('');
  const [pointsPerCheckin, setPointsPerCheckin] = useState(1);
  const [rewardDescription, setRewardDescription] = useState('Premio especial para clientes frecuentes');
  const [pointsForReward, setPointsForReward] = useState(10);
  const [maxMembers, setMaxMembers] = useState('');
  const [s, setS] = useState<BuilderState>({
    ...DEFAULT_BUILDER,
    cardName,
    businessName,
    palette:
      BASE_PALETTES.find((p) => p.primary.toLowerCase() === palette.primary.toLowerCase())?.id ?? 'coral',
  });

  const palettes = useMemo(() => BASE_PALETTES, []);
  const selectedPalette = (palettes.find((p) => p.id === s.palette) ?? palettes[0])!;
  const selectedFont = (FONTS.find((f) => f.id === s.font) ?? FONTS[0])!;
  const selectedPattern = (PATTERNS.find((p) => p.id === s.pattern) ?? PATTERNS[0])!;

  const setBuilderState = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const handleUpgrade = (required: Tier) => {
    const confirmed = window.confirm(
      `Esta funcion requiere el plan ${required === 'basic' ? 'Basic ($9.99/mes)' : 'Elite ($29.99/mes)'}.\n\nQuieres ver los planes?`,
    );
    if (!confirmed) return;
  };

  const handleSubmit = () => {
    if (!s.cardName.trim()) {
      setError('El nombre de la tarjeta es obligatorio.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createFirstCardAction({
        cardName: s.cardName.trim(),
        primaryColor: selectedPalette.primary,
        gradientBg: selectedPalette.bg,
        businessName,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 1200);

      const nextPalette: Palette = {
        name: selectedPalette.name,
        primary: selectedPalette.primary,
        bg: selectedPalette.bg,
      };

      onPaletteChange?.(nextPalette);
      onCardNameChange?.(s.cardName.trim());
      onNext({ cardName: s.cardName.trim(), palette: nextPalette, cardId: result.cardId });
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-2xl border border-white/10 bg-[#0D0B09] text-[#F5F0EB] shadow-2xl">
      <style jsx>{`
        .font-display-custom {
          font-family: '${selectedFont.display}', var(--font-display), sans-serif;
        }
        .font-body-custom {
          font-family: '${selectedFont.body}', var(--font-sans), sans-serif;
        }
      `}</style>

      <div className="flex h-12 items-center gap-4 border-b border-white/10 bg-[#111009] px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-[#E8341A] font-display text-xs font-extrabold text-white">
            S
          </div>
          <span className="font-display text-sm font-extrabold">Selio.</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <span className="text-[11px] text-white/50">Card Builder</span>
        <div className="h-6 w-px bg-white/10" />
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]">
          {tier}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-md px-2 py-1 text-[11px] text-white/55 hover:bg-white/10 hover:text-white" type="button">
            Dashboard
          </button>
          <button className="rounded-md px-2 py-1 text-[11px] text-white/55 hover:bg-white/10 hover:text-white" type="button">
            Descargar
          </button>
          <Button type="button" loading={isPending} size="sm" onClick={handleSubmit}>
            {saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-h-[720px] min-w-[1024px] grid-cols-[260px_minmax(520px,1fr)_240px]">
        <div className="flex min-w-[260px] flex-col border-r border-white/10 bg-[#111009]">
          <div className="grid grid-cols-3 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b px-1 py-2 text-[9px] font-semibold uppercase tracking-[0.09em] ${
                  activeTab === tab.id ? 'border-[#E8341A] text-[#E8341A]' : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'templates' && (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Layout</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl) => {
                    const locked = !canUse(tier, tpl.tier);
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => (locked ? handleUpgrade(tpl.tier) : setBuilderState('template', tpl.id))}
                        className={`relative aspect-[1.55] overflow-hidden rounded-md border-2 ${
                          s.template === tpl.id ? 'border-[#E8341A]' : 'border-transparent'
                        } ${locked ? 'opacity-40' : ''}`}
                      >
                        <MiniTemplatePreview template={tpl.id} palette={selectedPalette} />
                        {locked ? (
                          <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm">🔒</div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <>
                <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Gradientes base</p>
                <div className="grid grid-cols-3 gap-2">
                  {palettes.map((paletteOption) => (
                    <button
                      key={paletteOption.id}
                      type="button"
                      className={`aspect-square rounded-md border-2 ${s.palette === paletteOption.id ? 'border-white' : 'border-transparent'}`}
                      style={{ background: paletteOption.bg }}
                      onClick={() => setBuilderState('palette', paletteOption.id)}
                    />
                  ))}
                </div>

                <p className="mb-2 mt-5 text-[10px] uppercase tracking-[0.12em] text-white/45">Patron overlay</p>
                <div className="space-y-1">
                  {PATTERNS.map((pattern) => {
                    const locked = pattern.id !== 'none' && !canUse(tier, 'elite');
                    return (
                      <button
                        key={pattern.id}
                        type="button"
                        onClick={() => (locked ? handleUpgrade('elite') : setBuilderState('pattern', pattern.id))}
                        className={`flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left ${
                          s.pattern === pattern.id ? 'border-white/20 bg-white/10' : 'border-transparent'
                        } ${locked ? 'opacity-40' : ''}`}
                      >
                        <span
                          className="size-5 rounded-sm border border-white/15 bg-black/40"
                          style={{
                            backgroundImage: pattern.css || undefined,
                            backgroundSize: pattern.size || undefined,
                          }}
                        />
                        <span className="text-xs">{pattern.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'colors' && (
              <>
                <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Color primario</p>
                <div className="grid grid-cols-3 gap-2">
                  {palettes.map((paletteOption) => (
                    <button
                      key={paletteOption.id}
                      type="button"
                      className={`h-8 rounded-md border-2 ${s.palette === paletteOption.id ? 'border-white' : 'border-transparent'}`}
                      style={{ background: paletteOption.primary }}
                      onClick={() => setBuilderState('palette', paletteOption.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'typography' && (
              <>
                <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Tipografia</p>
                <div className="space-y-2">
                  {FONTS.map((font) => {
                    const locked = !canUse(tier, font.tier);
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => (locked ? handleUpgrade(font.tier) : setBuilderState('font', font.id))}
                        className={`w-full rounded-md border p-2 text-left ${
                          s.font === font.id ? 'border-[#E8341A] bg-white/10' : 'border-white/10'
                        } ${locked ? 'opacity-45' : ''}`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.1em] text-white/50">{font.name}</p>
                        <p className="mt-1 text-lg font-bold" style={{ fontFamily: `'${font.display}', sans-serif` }}>
                          Aa Bb 123
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'elements' && (
              <>
                <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Display de puntos</p>
                <div className="space-y-1">
                  {POINTS_STYLES.map((style) => {
                    const locked = !canUse(tier, style.tier);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => (locked ? handleUpgrade(style.tier) : setBuilderState('pointsStyle', style.id))}
                        className={`flex w-full items-center justify-between rounded-md border px-2 py-2 text-xs ${
                          s.pointsStyle === style.id ? 'border-white/20 bg-white/10' : 'border-transparent'
                        } ${locked ? 'opacity-45' : ''}`}
                      >
                        {style.label}
                        {locked ? '🔒' : s.pointsStyle === style.id ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                  <label className="flex items-center justify-between text-xs">
                    <span>Badge de nivel</span>
                    <input
                      type="checkbox"
                      checked={s.showBadge}
                      onChange={() => setBuilderState('showBadge', !s.showBadge)}
                      disabled={!canUse(tier, 'basic')}
                    />
                  </label>
                  {s.showBadge && canUse(tier, 'basic') ? (
                    <select
                      className="w-full rounded-md border border-white/15 bg-black/25 p-2 text-xs"
                      value={s.badgeText}
                      onChange={(e) => setBuilderState('badgeText', e.target.value)}
                    >
                      {BADGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  <label className="flex items-center justify-between text-xs">
                    <span>Numero de miembro</span>
                    <input
                      type="checkbox"
                      checked={s.showMemberNum}
                      onChange={() => setBuilderState('showMemberNum', !s.showMemberNum)}
                      disabled={!canUse(tier, 'basic')}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative flex min-w-[520px] items-center justify-center overflow-hidden bg-[#0D0B09]">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage: 'radial-gradient(rgba(46,42,38,1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10">
            <CardRenderer
              s={s}
              palette={selectedPalette}
              font={selectedFont}
              pattern={selectedPattern}
              pointsForReward={pointsForReward}
              rewardDescription={rewardDescription}
            />
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.08em] text-white/45">85.6 x 54mm - Estandar ISO</p>
          </div>
        </div>

        <div className="min-w-[240px] overflow-y-auto border-l border-white/10 bg-[#111009]">
          <div className="border-b border-white/10 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Contenido</p>
            <ControlInput
              label="Nombre del negocio"
              value={s.businessName}
              onChange={(v) => setBuilderState('businessName', v)}
              maxLength={30}
              disabled
            />
            <ControlInput
              label="Nombre de la tarjeta"
              value={s.cardName}
              onChange={(v) => {
                setBuilderState('cardName', v);
                onCardNameChange?.(v);
              }}
              maxLength={60}
            />
            <ControlInput label="Descripcion" value={description} onChange={setDescription} />
            <ControlInput label="Descripcion recompensa" value={rewardDescription} onChange={setRewardDescription} />
            <ControlInput
              label="Puntos por visita"
              value={String(pointsPerCheckin)}
              onChange={(v) => setPointsPerCheckin(Math.max(1, Number(v) || 1))}
              type="number"
            />
            <ControlInput
              label="Puntos para recompensa"
              value={String(pointsForReward)}
              onChange={(v) => setPointsForReward(Math.max(1, Number(v) || 1))}
              type="number"
            />
            <ControlInput
              label="Maximo de miembros"
              value={maxMembers}
              onChange={setMaxMembers}
              type="number"
              placeholder="Sin limite"
            />
          </div>

          <div className="border-b border-white/10 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Exportar</p>
            {[
              ['PNG', 'Imagen de alta resolucion', 'free'],
              ['PDF', 'Para impresion (85x54mm)', 'free'],
              ['SVG', 'Vectorial editable', 'basic'],
              ['Lote 50u', 'Para imprenta profesional', 'elite'],
            ].map(([format, desc, req]) => {
              const locked = !canUse(tier, req as Tier);
              return (
                <button
                  key={format}
                  type="button"
                  onClick={() => (locked ? handleUpgrade(req as Tier) : undefined)}
                  className={`flex w-full items-center justify-between border-b border-white/10 py-2 text-left ${locked ? 'opacity-50' : ''}`}
                >
                  <div>
                    <p className="text-xs font-semibold">{format}</p>
                    <p className="text-[10px] text-white/45">{desc}</p>
                  </div>
                  <span className="text-xs">{locked ? '🔒' : '↓'}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-white/45">Tier de prueba</p>
            <div className="grid grid-cols-3 gap-2">
              {(['free', 'basic', 'elite'] as Tier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${
                    tier === t ? 'border-[#E8341A] bg-[#E8341A] text-white' : 'border-white/15 text-white/70'
                  }`}
                  onClick={() => setTier(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 w-full rounded-md border border-white/15 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
            >
              Volver al paso anterior
            </button>
          </div>
        </div>
        </div>
      </div>

      {error ? (
        <div className="border-t border-white/10 px-4 py-3">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}
    </div>
  );
}

function ControlInput({
  label,
  value,
  onChange,
  error,
  maxLength,
  type = 'text',
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="mb-3 block">
      <p className="mb-1 text-[11px] text-white/55">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        type={type}
        min={type === 'number' ? 1 : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border border-white/15 bg-[#201D18] px-3 py-2 text-xs outline-none focus:border-[#E8341A] disabled:cursor-not-allowed disabled:opacity-60"
      />
      {error ? <p className="mt-1 text-[10px] text-red-300">{error}</p> : null}
    </label>
  );
}

function MiniTemplatePreview({ template, palette }: { template: TemplateId; palette: BuilderPalette }) {
  const common: CSSProperties = { width: '100%', height: '100%' };
  if (template === 'split') {
    return (
      <div style={common} className="flex">
        <div className="w-[45%]" style={{ background: palette.primary }} />
        <div className="flex-1 bg-black/80" />
      </div>
    );
  }
  if (template === 'minimal') return <div style={common} className="bg-[#F5F0EB]" />;
  if (template === 'bold') return <div style={{ ...common, background: palette.primary }} />;
  if (template === 'luxury')
    return <div style={{ ...common, background: 'linear-gradient(135deg,#0A0806,#1A1208)' }} />;
  if (template === 'stamp') return <div style={{ ...common, background: palette.bg }} />;
  return <div style={{ ...common, background: palette.bg }} />;
}

function CardRenderer({
  s,
  palette,
  font,
  pattern,
  pointsForReward,
  rewardDescription,
}: {
  s: BuilderState;
  palette: BuilderPalette;
  font: FontOption;
  pattern: { id: string; css: string; size?: string };
  pointsForReward: number;
  rewardDescription: string;
}) {
  if (s.template === 'split') {
    return (
      <div className="flex h-[230px] w-[380px] overflow-hidden rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        <div className="flex w-[44%] flex-col justify-between p-5" style={{ background: palette.primary }}>
          <div className="flex size-8 items-center justify-center rounded-md bg-white/20 font-bold">S</div>
          <div>
            <p
              className="text-4xl font-extrabold leading-none"
              style={{ fontFamily: `'${font.display}', sans-serif` }}
            >
              847
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/70">puntos</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between bg-[#0D0B09] p-5">
          <div>
            <p className="text-sm font-extrabold" style={{ fontFamily: `'${font.display}', sans-serif` }}>
              {s.businessName}
            </p>
            <p className="text-[8px] uppercase tracking-[0.16em] text-white/40">{s.cardName}</p>
          </div>
          <div>
            <p className="text-xs">{rewardDescription || 'Recompensa disponible'}</p>
            {s.showMemberNum ? <p className="mt-1 text-[10px] text-white/35">#00847291</p> : null}
          </div>
        </div>
      </div>
    );
  }

  if (s.template === 'minimal') {
    return (
      <div className="h-[230px] w-[380px] rounded-[20px] bg-[#F5F0EB] p-6 text-[#0A0A0A] shadow-[0_32px_80px_rgba(0,0,0,0.42)]">
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[15px] font-extrabold"
              style={{ fontFamily: `'${font.display}', sans-serif` }}
            >
              {s.businessName}
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] text-black/45">{s.cardName}</p>
          </div>
          <div
            className="flex size-8 items-center justify-center rounded-md text-white"
            style={{ background: palette.primary }}
          >
            S
          </div>
        </div>
        <p className="mt-7 text-5xl font-extrabold leading-none" style={{ fontFamily: `'${font.display}', sans-serif` }}>
          847
        </p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-black/45">
          meta: {pointsForReward || 10}
        </p>
        <p className="mt-8 text-xs text-black/65">{rewardDescription || 'Descripcion de recompensa'}</p>
      </div>
    );
  }

  return (
    <div
      className="relative h-[230px] w-[380px] overflow-hidden rounded-[20px] p-[22px_24px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
      style={{ background: palette.bg }}
    >
      {pattern.id !== 'none' ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{ backgroundImage: pattern.css, backgroundSize: pattern.size || undefined }}
        />
      ) : null}

      <div
        className="pointer-events-none absolute -right-10 -top-10 size-[180px] rounded-full border"
        style={{ borderColor: `${palette.primary}20` }}
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-[260px] rounded-full border"
        style={{ borderColor: `${palette.primary}10` }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[15px] font-extrabold"
              style={{ color: palette.primary, fontFamily: `'${font.display}', sans-serif` }}
            >
              {s.businessName}
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">{s.cardName}</p>
          </div>
          <div className="text-right">
            <div
              className="flex size-[34px] items-center justify-center rounded-[9px] text-sm font-black text-white"
              style={{ background: palette.primary }}
            >
              S
            </div>
            {s.showBadge ? (
              <p
                className="mt-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]"
                style={{
                  background: `${palette.primary}25`,
                  borderColor: `${palette.primary}40`,
                  color: palette.primary,
                }}
              >
                {s.badgeText}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          {s.pointsStyle === 'number' ? (
            <>
              <p
                className="text-[44px] font-extrabold leading-none"
                style={{ fontFamily: `'${font.display}', sans-serif` }}
              >
                847
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">puntos acumulados</p>
            </>
          ) : null}
          {s.pointsStyle === 'bar' ? (
            <>
              <p
                className="text-[32px] font-extrabold leading-none"
                style={{ fontFamily: `'${font.display}', sans-serif` }}
              >
                847 pts
              </p>
              <div className="mt-2 h-1 rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full" style={{ background: palette.primary }} />
              </div>
            </>
          ) : null}
          {s.pointsStyle === 'stamps' ? (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="grid size-6 place-items-center rounded-full border text-xs"
                  style={{
                    background: i < 7 ? palette.primary : 'rgba(255,255,255,0.08)',
                    borderColor: i < 7 ? palette.primary : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {i < 7 ? '✓' : ''}
                </span>
              ))}
            </div>
          ) : null}
          {s.pointsStyle === 'stars' ? (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="text-2xl"
                  style={{ color: i < 4 ? palette.primary : 'rgba(255,255,255,0.15)' }}
                >
                  ★
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between">
          <div>
            {s.showMemberNum ? <p className="text-[8px] tracking-[0.1em] text-white/30"># 00847291</p> : null}
            <p className="text-[8px] uppercase tracking-[0.1em] text-white/30">Miembro</p>
            <p className="mt-0.5 text-xs">Ana Garcia</p>
          </div>
          <div className="grid size-10 grid-cols-5 gap-[2px] opacity-70">
            {Array.from({ length: 25 }).map((_, idx) => (
              <span key={idx} className="rounded-[1px] bg-white/70" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
