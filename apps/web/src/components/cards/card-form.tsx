'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';

import { Alert, Button } from '@sellio/ui';
import type { Card } from '@sellio/domain';

import { createCardAction, updateCardAction } from '@/actions/cards/card.actions';
import {
  type Tier, type TabId, type TemplateId, type PointsStyleId,
  type CustomGradient, type BuilderState,
  canUse, BASE_PALETTES, CUSTOM_GRADIENTS, PATTERNS, FONTS, TEMPLATES,
  BADGE_OPTIONS, POINTS_STYLES, DEFAULT_BUILDER, QR, ClassicCard, CARD_RENDERERS,
} from './card-renderer';

// ── Types ──────────────────────────────────────────────────────

interface CardFormProps {
  card?: Card;
  primaryColor?: string;
  autoSave?: boolean;
  exitHref?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Sub-components ────────────────────────────────────────────

function LockPill({ tier, onUpgrade }: { tier: string; onUpgrade: () => void }) {
  return (
    <button
      type="button"
      onClick={onUpgrade}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: 100, padding: '3px 8px', fontSize: 10, color: '#FFB347', fontWeight: 600, cursor: 'pointer' }}
    >
      🔒 {tier === 'basic' ? 'Basic' : 'Elite'}
    </button>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      style={{ width: 36, height: 20, borderRadius: 10, background: on && !disabled ? '#E8341A' : '#2E2A26', position: 'relative', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: disabled ? 0.4 : 1, flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 2, left: on && !disabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}

function UpgradeBanner({ tier, label, onUpgrade }: { tier: string; label: string; onUpgrade: () => void }) {
  const isElite = tier === 'elite';
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(255,179,71,0.08),rgba(255,179,71,0.04))', border: '1px solid rgba(255,179,71,0.18)', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#FFB347', marginBottom: 4, fontFamily: 'Syne,sans-serif' }}>🔒 Requiere {isElite ? 'Elite' : 'Basic'}</div>
      <div style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.5, marginBottom: 10 }}>{label}</div>
      <button
        type="button"
        onClick={onUpgrade}
        style={{ background: isElite ? '#A78BFA' : '#FFB347', color: isElite ? '#fff' : '#0A0A0A', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif', width: '100%' }}
      >
        Ver plan {isElite ? 'Elite' : 'Basic'} →
      </button>
    </div>
  );
}

function CtrlInput({ label, value, onChange, type = 'text', placeholder, maxLength, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: 'text' | 'number'; placeholder?: string; maxLength?: number; error?: string;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#6B6560', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        min={type === 'number' ? 1 : undefined}
        style={{ width: '100%', background: '#201D18', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: '#F5F0EB', outline: 'none' }}
      />
      {error && <span style={{ fontSize: 10, color: '#F87171', display: 'block', marginTop: 3 }}>{error}</span>}
    </label>
  );
}

// ── CardForm ──────────────────────────────────────────────────

export function CardForm({ card, primaryColor = '#E8341A', autoSave = false, exitHref }: CardFormProps) {
  const isEdit = !!card;

  // Restore builder state from saved design if editing
  const savedDesign = card?.design as Record<string, unknown> | null | undefined;
  const initialBuilder: BuilderState = {
    ...DEFAULT_BUILDER,
    cardName: (savedDesign?.cardName as string) ?? card?.name ?? DEFAULT_BUILDER.cardName,
    template: (savedDesign?.template as TemplateId) ?? DEFAULT_BUILDER.template,
    palette: (savedDesign?.palette as string) ?? DEFAULT_BUILDER.palette,
    customGradient: (savedDesign?.customGradient as CustomGradient | null) ?? null,
    font: (savedDesign?.font as string) ?? DEFAULT_BUILDER.font,
    pattern: (savedDesign?.pattern as string) ?? DEFAULT_BUILDER.pattern,
    pointsStyle: (savedDesign?.pointsStyle as PointsStyleId) ?? DEFAULT_BUILDER.pointsStyle,
    showBadge: (savedDesign?.showBadge as boolean) ?? false,
    badgeText: (savedDesign?.badgeText as string) ?? DEFAULT_BUILDER.badgeText,
    showMemberNum: (savedDesign?.showMemberNum as boolean) ?? false,
    qrStyle: (savedDesign?.qrStyle as BuilderState['qrStyle']) ?? 'simple',
  };

  const [tier, setTier] = useState<Tier>('free');
  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [saved, setSaved] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isFirstRender = useRef(true);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(260);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      let newWidth = startWidth + deltaX;

      if (newWidth < 150) {
        setLeftCollapsed(true);
      } else {
        setLeftCollapsed(false);
        if (newWidth > 600) newWidth = 600;
        if (newWidth < 200) newWidth = 200;
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const [s, setS] = useState<BuilderState>(initialBuilder);
  const [description, setDescription] = useState(card?.description ?? '');
  const [pointsPerCheckin, setPointsPerCheckin] = useState(card?.pointsPerCheckin ?? 1);
  const [rewardDescription, setRewardDescription] = useState(card?.rewardDescription ?? '');
  const [pointsForReward, setPointsForReward] = useState(card?.pointsForReward ?? 10);
  const [maxMembers, setMaxMembers] = useState(card?.maxMembers?.toString() ?? '');

  const set = <K extends keyof BuilderState>(k: K, v: BuilderState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  // Override coral palette with org's primary color
  const palettes = useMemo(
    () =>
      BASE_PALETTES.map((p) =>
        p.id === 'coral'
          ? { ...p, primary: primaryColor, bg: `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${primaryColor} 100%)` }
          : p,
      ),
    [primaryColor],
  );

  const pal = useMemo((): { primary: string; bg: string } => {
    if (s.customGradient) return s.customGradient;
    return palettes.find((p) => p.id === s.palette) ?? palettes[0]!;
  }, [s.customGradient, s.palette, palettes]);

  const font = (FONTS.find((f) => f.id === s.font) ?? FONTS[0])!;
  const pattern = (PATTERNS.find((p) => p.id === s.pattern) ?? PATTERNS[0])!;
  const CardComp = CARD_RENDERERS[s.template] ?? ClassicCard;

  const upgrade = (required: string) => {
    window.confirm(
      `Esta función requiere el plan ${required === 'basic' ? 'Basic ($9.99/mes)' : 'Elite ($29.99/mes)'}. ¿Ver planes?`,
    );
  };

  const designPayload = {
    template: s.template, palette: s.palette, customGradient: s.customGradient,
    font: s.font, pattern: s.pattern, pointsStyle: s.pointsStyle,
    showBadge: s.showBadge, badgeText: s.badgeText,
    showMemberNum: s.showMemberNum, qrStyle: s.qrStyle,
    cardName: s.cardName, businessName: s.businessName,
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (isEdit && card) {
        const result = await updateCardAction(card.id, formData);
        if (!result.ok) {
          if (result.field) setFieldErrors({ [result.field]: result.error });
          else setError(result.error);
          return;
        }
        setSuccess(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        return;
      }
      try {
        await createCardAction(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la tarjeta.');
      }
    });
  };

  // Auto-save: debounce 1.5s after any builder/config state change
  useEffect(() => {
    if (!autoSave || !isEdit || !card) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const payload = {
      template: s.template, palette: s.palette, customGradient: s.customGradient,
      font: s.font, pattern: s.pattern, pointsStyle: s.pointsStyle,
      showBadge: s.showBadge, badgeText: s.badgeText,
      showMemberNum: s.showMemberNum, qrStyle: s.qrStyle,
      cardName: s.cardName, businessName: s.businessName,
    };
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const fd = new FormData();
      fd.set('name', s.cardName);
      fd.set('description', description);
      fd.set('pointsPerCheckin', String(pointsPerCheckin));
      fd.set('pointsForReward', String(pointsForReward));
      fd.set('rewardDescription', rewardDescription);
      if (maxMembers) fd.set('maxMembers', maxMembers);
      fd.set('design', JSON.stringify(payload));
      const result = await updateCardAction(card.id, fd);
      if (result.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, description, pointsPerCheckin, rewardDescription, pointsForReward, maxMembers]);

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'templates', label: 'Plantillas' },
    { id: 'background', label: 'Fondo' },
    { id: 'colors', label: 'Colores' },
    { id: 'typography', label: 'Tipo' },
    { id: 'elements', label: 'Elementos' },
  ];

  const cardSlug = card ? `sellio.app/c/${card.id.slice(0, 8)}` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#0D0B09', color: '#F5F0EB', borderRadius: exitHref ? 0 : 16, border: exitHref ? 'none' : '1px solid rgba(245,240,235,0.07)', overflow: 'hidden', boxShadow: exitHref ? 'none' : '0 20px 60px rgba(0,0,0,0.5)', fontFamily: 'Space Grotesk,sans-serif', height: exitHref ? '100vh' : undefined }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2E2A26; border-radius: 2px; }
      `}</style>

      {/* Hidden form inputs */}
      <form id="card-builder-form" onSubmit={handleSubmit}>
        <input name="name"             value={s.cardName}                    readOnly aria-hidden className="hidden" />
        <input name="description"      value={description}                   readOnly aria-hidden className="hidden" />
        <input name="pointsPerCheckin" value={pointsPerCheckin}              readOnly aria-hidden className="hidden" />
        <input name="pointsForReward"  value={pointsForReward}               readOnly aria-hidden className="hidden" />
        <input name="rewardDescription" value={rewardDescription}            readOnly aria-hidden className="hidden" />
        <input name="maxMembers"       value={maxMembers}                    readOnly aria-hidden className="hidden" />
        <input name="design"           value={JSON.stringify(designPayload)} readOnly aria-hidden className="hidden" />
      </form>

      {/* Top bar */}
      <div style={{ height: 48, background: '#111009', borderBottom: '1px solid rgba(245,240,235,0.07)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        {exitHref && (
          <>
            <Link href={exitHref} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6560', textDecoration: 'none', transition: 'color 0.15s', flexShrink: 0 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#F5F0EB'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#6B6560'; }}
            >
              ← Salir
            </Link>
            <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#E8341A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 12, color: '#fff' }}>S</div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15 }}>Sellio<span style={{ color: '#E8341A' }}>.</span></span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
        <span style={{ fontSize: 12, color: '#6B6560' }}>Card Builder</span>
        <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase',
          background: tier === 'free' ? 'rgba(107,101,96,0.2)' : tier === 'basic' ? 'rgba(193,125,60,0.15)' : 'rgba(167,139,250,0.15)',
          color: tier === 'free' ? '#6B6560' : tier === 'basic' ? '#C17D3C' : '#A78BFA',
        }}>
          {tier}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {autoSave ? (
            <span style={{
              fontSize: 11,
              transition: 'color 0.3s',
              color: saveStatus === 'saving' ? '#6B6560' : saveStatus === 'saved' ? '#4ADE80' : saveStatus === 'error' ? '#F87171' : 'transparent',
            }}>
              {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'error' ? 'Error al guardar' : '·'}
            </span>
          ) : (
            <Button type="submit" form="card-builder-form" loading={isPending} size="sm">
              {saved ? '✓ Guardado' : isEdit ? 'Guardar cambios' : 'Crear tarjeta'}
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr 240px', minHeight: exitHref ? 'calc(100vh - 48px)' : 680, flex: exitHref ? 1 : undefined, overflow: 'hidden', cursor: isDragging ? 'col-resize' : 'default' }}>

        {/* ── Left panel ── */}
        <div style={{ width: leftCollapsed ? 0 : leftWidth, minWidth: 0, background: '#111009', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.16,1,0.3,1)', flexShrink: 0 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(245,240,235,0.07)', minWidth: 260 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, padding: '10px 2px', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textAlign: 'center', cursor: 'pointer', color: activeTab === tab.id ? '#E8341A' : '#6B6560', borderTop: 'none', borderRight: 'none', borderLeft: 'none', borderBottom: `2px solid ${activeTab === tab.id ? '#E8341A' : 'transparent'}`, background: 'none', textTransform: 'uppercase', transition: 'all 0.15s' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

            {/* Templates */}
            {activeTab === 'templates' && (() => {
              const innerWidth = Math.max(leftWidth - 32 - 12, 120);
              const scale = innerWidth / 380;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#F5F0EB', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Layout</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {TEMPLATES.map((tpl) => {
                      const locked = !canUse(tier, tpl.tier);
                      const MiniCard = CARD_RENDERERS[tpl.id];
                      const isActive = s.template === tpl.id;
                      return (
                        <div key={tpl.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#E8341A' : 'transparent', border: `1px solid ${isActive ? '#E8341A' : '#3A3630'}`, transition: 'all 0.3s' }} />
                              <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? '#F5F0EB' : '#6B6560', letterSpacing: '0.03em', transition: 'all 0.3s' }}>
                                {tpl.name}
                              </span>
                            </div>
                            {locked && <span style={{ fontSize: 9, fontWeight: 600, color: '#FFB347', background: 'rgba(255,179,71,0.1)', padding: '2px 6px', borderRadius: 4 }}>{tpl.tier}</span>}
                          </div>
                          <div
                            onClick={() => locked ? upgrade(tpl.tier) : set('template', tpl.id)}
                            style={{
                              borderRadius: 16,
                              padding: 6,
                              background: isActive ? 'linear-gradient(180deg, #1A1814 0%, #0A0A0A 100%)' : '#0A0A0A',
                              border: `1px solid ${isActive ? 'rgba(232,52,26,0.4)' : 'rgba(245,240,235,0.04)'}`,
                              cursor: locked ? 'not-allowed' : 'pointer',
                              opacity: locked ? 0.6 : 1,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: isActive ? '0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                              transform: isActive ? 'scale(1)' : 'scale(0.98)',
                            }}
                          >
                            <div style={{ position: 'relative', width: innerWidth, height: 230 * scale, borderRadius: 10, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                                <MiniCard s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} />
                              </div>
                              {locked && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
                                  <div style={{ background: 'rgba(10,10,10,0.8)', padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#F5F0EB', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>🔒</span> Desbloquear
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Background */}
            {activeTab === 'background' && (
              <>
                <Section label="Gradientes base">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
                    {palettes.map((p) => (
                      <div key={p.id}
                        onClick={() => { set('palette', p.id); set('customGradient', null); }}
                        style={{ aspectRatio: '1', borderRadius: 5, cursor: 'pointer', background: p.bg, border: `2px solid ${s.palette === p.id && !s.customGradient ? '#fff' : 'transparent'}`, transform: s.palette === p.id && !s.customGradient ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </Section>

                <Section label="Gradientes custom" action={!canUse(tier, 'basic') ? <LockPill tier="basic" onUpgrade={() => upgrade('basic')} /> : undefined}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
                    {CUSTOM_GRADIENTS.map((p) => (
                      <div key={p.id}
                        onClick={() => canUse(tier, 'basic') ? (set('customGradient', p)) : upgrade('basic')}
                        style={{ aspectRatio: '1', borderRadius: 5, cursor: canUse(tier, 'basic') ? 'pointer' : 'not-allowed', background: p.bg, border: `2px solid ${s.customGradient?.id === p.id ? '#fff' : 'transparent'}`, opacity: !canUse(tier, 'basic') ? 0.35 : 1, transform: s.customGradient?.id === p.id ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}
                        title={p.name}
                      />
                    ))}
                  </div>
                  {!canUse(tier, 'basic') && <UpgradeBanner tier="basic" label="Accede a gradientes exclusivos con el plan Basic." onUpgrade={() => upgrade('basic')} />}
                </Section>

                <Section label="Patrón overlay" action={!canUse(tier, 'elite') ? <LockPill tier="elite" onUpgrade={() => upgrade('elite')} /> : undefined}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {PATTERNS.map((p) => {
                      const locked = p.id !== 'none' && !canUse(tier, 'elite');
                      return (
                        <div key={p.id}
                          onClick={() => locked ? upgrade('elite') : set('pattern', p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, cursor: locked ? 'not-allowed' : 'pointer', background: s.pattern === p.id ? '#201D18' : 'transparent', border: `1px solid ${s.pattern === p.id ? 'rgba(245,240,235,0.12)' : 'transparent'}`, opacity: locked ? 0.4 : 1 }}
                        >
                          <div style={{ width: 24, height: 24, borderRadius: 5, background: '#0A0A0A', backgroundImage: p.css || undefined, backgroundSize: p.size || undefined, flexShrink: 0, border: '1px solid rgba(245,240,235,0.12)' }} />
                          <span style={{ fontSize: 12 }}>{p.name}</span>
                          {s.pattern === p.id && <span style={{ marginLeft: 'auto', color: '#E8341A', fontSize: 12 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </>
            )}

            {/* Colors */}
            {activeTab === 'colors' && (
              <>
                <Section label="Color primario">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5 }}>
                    {palettes.map((p) => (
                      <div key={p.id}
                        onClick={() => { set('palette', p.id); set('customGradient', null); }}
                        style={{ aspectRatio: '1', borderRadius: 5, cursor: 'pointer', background: p.primary, border: `2px solid ${s.palette === p.id && !s.customGradient ? '#fff' : 'transparent'}`, transform: s.palette === p.id && !s.customGradient ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </Section>

                <Section label="Color personalizado" action={!canUse(tier, 'basic') ? <LockPill tier="basic" onUpgrade={() => upgrade('basic')} /> : undefined}>
                  {canUse(tier, 'basic') ? (
                    <input type="color" style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid rgba(245,240,235,0.12)', background: 'none', cursor: 'pointer', padding: 2 }} />
                  ) : (
                    <UpgradeBanner tier="basic" label="Elige cualquier color para tu tarjeta con el selector libre." onUpgrade={() => upgrade('basic')} />
                  )}
                </Section>

                <Section label="Estilo del QR" action={!canUse(tier, 'basic') ? <LockPill tier="basic" onUpgrade={() => upgrade('basic')} /> : undefined}>
                  {(['simple', 'colored', 'logo'] as const).map((qs) => {
                    const locked = qs !== 'simple' && !canUse(tier, 'basic');
                    return (
                      <div key={qs}
                        onClick={() => locked ? upgrade('basic') : set('qrStyle', qs)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, cursor: locked ? 'not-allowed' : 'pointer', marginBottom: 4, background: s.qrStyle === qs ? '#201D18' : 'transparent', border: `1px solid ${s.qrStyle === qs ? 'rgba(245,240,235,0.12)' : 'transparent'}`, opacity: locked ? 0.4 : 1 }}
                      >
                        <QR size={28} color={qs === 'colored' ? pal.primary : qs === 'logo' ? '#A78BFA' : 'rgba(255,255,255,0.6)'} />
                        <span style={{ fontSize: 12 }}>{qs === 'simple' ? 'Simple (blanco)' : qs === 'colored' ? 'A color' : 'Con logo'}</span>
                        {s.qrStyle === qs && <span style={{ marginLeft: 'auto', color: '#E8341A', fontSize: 12 }}>✓</span>}
                      </div>
                    );
                  })}
                </Section>
              </>
            )}

            {/* Typography */}
            {activeTab === 'typography' && (
              <Section label="Tipografía">
                {FONTS.map((f) => {
                  const locked = !canUse(tier, f.tier);
                  return (
                    <div key={f.id}
                      onClick={() => locked ? upgrade(f.tier) : set('font', f.id)}
                      style={{ padding: 12, borderRadius: 8, marginBottom: 6, cursor: locked ? 'not-allowed' : 'pointer', border: `1.5px solid ${s.font === f.id ? '#E8341A' : 'rgba(245,240,235,0.07)'}`, background: s.font === f.id ? '#201D18' : 'transparent', opacity: locked ? 0.45 : 1, transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: '#6B6560', fontWeight: 600, letterSpacing: '0.06em' }}>{f.name}</span>
                        {locked && <LockPill tier={f.tier} onUpgrade={() => {}} />}
                      </div>
                      <div style={{ fontFamily: `'${f.display}', sans-serif`, fontWeight: 800, fontSize: 20, color: '#F5F0EB' }}>Aa Bb 123</div>
                      <div style={{ fontFamily: `'${f.body}', sans-serif`, fontSize: 11, color: '#6B6560', marginTop: 2 }}>Texto descriptivo del negocio</div>
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Elements */}
            {activeTab === 'elements' && (
              <>
                <Section label="Display de puntos">
                  {POINTS_STYLES.map((ps) => {
                    const locked = !canUse(tier, ps.tier);
                    return (
                      <div key={ps.id}
                        onClick={() => locked ? upgrade(ps.tier) : set('pointsStyle', ps.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 7, marginBottom: 5, cursor: locked ? 'not-allowed' : 'pointer', background: s.pointsStyle === ps.id ? '#201D18' : 'transparent', border: `1px solid ${s.pointsStyle === ps.id ? 'rgba(245,240,235,0.12)' : 'transparent'}`, opacity: locked ? 0.45 : 1 }}
                      >
                        <span style={{ fontSize: 12 }}>{ps.label}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {locked && <LockPill tier={ps.tier} onUpgrade={() => {}} />}
                          {s.pointsStyle === ps.id && <span style={{ color: '#E8341A', fontSize: 12 }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </Section>

                <Section label="Elementos adicionales">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12 }}>Badge de nivel</span>
                    <Toggle on={s.showBadge && canUse(tier, 'basic')} onChange={() => set('showBadge', !s.showBadge)} disabled={!canUse(tier, 'basic')} />
                  </div>
                  {s.showBadge && canUse(tier, 'basic') && (
                    <select
                      value={s.badgeText}
                      onChange={(e) => set('badgeText', e.target.value)}
                      style={{ width: '100%', background: '#201D18', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 7, padding: '8px 10px', fontSize: 12, color: '#F5F0EB', marginBottom: 10, fontFamily: 'Space Grotesk,sans-serif' }}
                    >
                      {BADGE_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12 }}>Número de miembro</span>
                    <Toggle on={s.showMemberNum && canUse(tier, 'basic')} onChange={() => set('showMemberNum', !s.showMemberNum)} disabled={!canUse(tier, 'basic')} />
                  </div>
                  {!canUse(tier, 'basic') && <UpgradeBanner tier="basic" label="Activa badges, número de miembro y más con el plan Basic." onUpgrade={() => upgrade('basic')} />}
                </Section>

                <Section label="Efectos especiales" action={!canUse(tier, 'elite') ? <LockPill tier="elite" onUpgrade={() => upgrade('elite')} /> : undefined}>
                  {!canUse(tier, 'elite') ? (
                    <UpgradeBanner tier="elite" label="Efectos foil, sombras custom y animaciones de tarjeta." onUpgrade={() => upgrade('elite')} />
                  ) : (
                    <div style={{ fontSize: 12, color: '#6B6560' }}>Próximamente: foil, emboss, glow</div>
                  )}
                </Section>

                {/* Dev-only tier switcher */}
                <Section label="Simular tier">
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['free', 'basic', 'elite'] as Tier[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(t)}
                        style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${tier === t ? '#E8341A' : 'rgba(245,240,235,0.12)'}`, background: tier === t ? '#E8341A' : 'transparent', fontSize: 10, cursor: 'pointer', color: '#F5F0EB', fontFamily: 'Space Grotesk,sans-serif', fontWeight: 600, textTransform: 'capitalize' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>

        {/* ── Dragger ── */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setLeftCollapsed(!leftCollapsed)}
          style={{
            width: 8,
            cursor: 'col-resize',
            background: isDragging ? 'rgba(232,52,26,0.3)' : 'transparent',
            borderRight: '1px solid rgba(245,240,235,0.07)',
            transition: 'background 0.2s',
            zIndex: 10,
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!isDragging) e.currentTarget.style.background = 'rgba(232,52,26,0.15)';
          }}
          onMouseLeave={(e) => {
            if (!isDragging) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 2, height: 24, background: 'rgba(245,240,235,0.2)', borderRadius: 2 }} />
        </div>

        {/* ── Canvas ── */}
        <div style={{ background: '#0D0B09', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', pointerEvents: isDragging ? 'none' : 'auto' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#2E2A26 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4, pointerEvents: 'none' }} />
          {/* Panel toggle button */}
          <button
            type="button"
            onClick={() => setLeftCollapsed((v) => !v)}
            title={leftCollapsed ? 'Mostrar panel' : 'Ocultar panel'}
            style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, width: 24, height: 24, borderRadius: 6, background: '#1A1713', border: '1px solid rgba(245,240,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B6560', fontSize: 12, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F5F0EB'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,240,235,0.25)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#6B6560'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,240,235,0.1)'; }}
          >
            {leftCollapsed ? '›' : '‹'}
          </button>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <CardComp s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} />
            <div style={{ fontSize: 10, color: '#6B6560', letterSpacing: '0.08em' }}>85.6 × 54mm · Estándar ISO</div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ background: '#111009', borderLeft: '1px solid rgba(245,240,235,0.07)', overflowY: 'auto' }}>

          {/* Contenido visual */}
          <RightSection title="Contenido">
            <CtrlInput label="Nombre del negocio" value={s.businessName} onChange={(v) => set('businessName', v)} maxLength={30} />
            <CtrlInput label="Nombre de la tarjeta" value={s.cardName} onChange={(v) => set('cardName', v)} maxLength={25} error={fieldErrors.name} />
          </RightSection>

          {/* Configuración de negocio */}
          <RightSection title="Configuración">
            <CtrlInput label="Descripción" value={description} onChange={setDescription} error={fieldErrors.description} />
            <CtrlInput label="Recompensa" value={rewardDescription} onChange={setRewardDescription} placeholder="1 café gratis" error={fieldErrors.rewardDescription} />
            <CtrlInput label="Puntos por visita" value={String(pointsPerCheckin)} onChange={(v) => setPointsPerCheckin(Math.max(1, Number(v) || 1))} type="number" error={fieldErrors.pointsPerCheckin} />
            <CtrlInput label="Puntos para recompensa" value={String(pointsForReward)} onChange={(v) => setPointsForReward(Math.max(1, Number(v) || 1))} type="number" error={fieldErrors.pointsForReward} />
            <CtrlInput label="Máximo de miembros" value={maxMembers} onChange={setMaxMembers} type="number" placeholder="Sin límite" error={fieldErrors.maxMembers} />
          </RightSection>

          {/* Exportar */}
          <RightSection title="Exportar">
            {([['PNG', 'Imagen de alta resolución', 'free'], ['PDF', 'Para impresión (85×54mm)', 'free'], ['SVG', 'Vectorial editable', 'basic'], ['Lote 50u', 'Para imprenta profesional', 'elite']] as const).map(([fmt, desc, req]) => {
              const locked = !canUse(tier, req);
              return (
                <div key={fmt}
                  onClick={() => locked ? upgrade(req) : undefined}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(245,240,235,0.07)', cursor: locked ? 'pointer' : 'default', opacity: locked ? 0.5 : 1 }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{fmt}</div>
                    <div style={{ fontSize: 10, color: '#6B6560' }}>{desc}</div>
                  </div>
                  {locked ? <span style={{ fontSize: 10, color: '#FFB347' }}>🔒</span> : <button type="button" style={{ fontSize: 10, color: '#E8341A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>↓</button>}
                </div>
              );
            })}
          </RightSection>

          {/* Compartir */}
          {cardSlug && (
            <RightSection title="Compartir">
              <div style={{ background: '#201D18', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: '#6B6560', marginBottom: 6 }}>Link público de la tarjeta</div>
                <div style={{ fontSize: 11, color: '#E8341A', wordBreak: 'break-all', marginBottom: 8 }}>{cardSlug}</div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`https://${cardSlug}`)}
                  style={{ width: '100%', background: '#E8341A', color: '#fff', border: 'none', borderRadius: 6, padding: 7, fontSize: 11, cursor: 'pointer', fontWeight: 700, fontFamily: 'Syne,sans-serif' }}
                >
                  Copiar link
                </button>
              </div>
            </RightSection>
          )}

          {/* Impresión */}
          <RightSection title="Impresión física">
            <div style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.6, marginBottom: 10 }}>Descarga el PDF listo para imprimir en casa o imprenta. Incluido en todos los planes.</div>
            <button
              type="button"
              style={{ width: '100%', background: '#201D18', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 7, padding: 9, fontSize: 12, color: '#F5F0EB', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontWeight: 600 }}
            >
              🖨 Descargar para imprimir
            </button>
          </RightSection>
        </div>
      </div>

      {(success || error) && (
        <div style={{ borderTop: '1px solid rgba(245,240,235,0.07)', padding: '12px 16px' }}>
          {success && <Alert variant="success">Cambios guardados correctamente.</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}
    </div>
  );
}

// ── Layout helpers ─────────────────────────────────────────────

function Section({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6B6560', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function RightSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(245,240,235,0.07)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#6B6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
