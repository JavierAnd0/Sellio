'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { type LucideIcon, Lock, ChevronLeft, Download as DownloadIcon, Printer as PrinterIcon, Building2, Tag, Star, User, QrCode, Badge, Coffee, UtensilsCrossed, Leaf, Dumbbell, BookOpen, Scissors, ShoppingBag, Beer, Ticket } from 'lucide-react';

import { Alert, Button } from '@sellio/ui';
import type { Card } from '@sellio/domain';

import { createCardAction, updateCardAction } from '@/actions/cards/card.actions';
import type { CreateCardResult } from '@/actions/cards/card.actions';
import {
  type Tier, type TabId, type TemplateId, type PointsStyleId, type CardType,
  type CustomGradient, type BuilderState, type StampIconId, type FontOption,
  canUse, BASE_PALETTES, PATTERNS, FONTS, TEMPLATES,
  BADGE_OPTIONS, POINTS_STYLES, STAMP_CATEGORIES, STAMP_ICONS_EXTENDED, DEFAULT_BUILDER, QR, ClassicCard, CARD_RENDERERS,
} from './card-renderer';

// ── Types ──────────────────────────────────────────────────────

interface CardFormProps {
  card?: Card;
  primaryColor?: string;
  autoSave?: boolean;
  exitHref?: string;
  orgTier?: Tier;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Sub-components ────────────────────────────────────────────

function LockPill({ onUpgrade }: { tier: string; onUpgrade: () => void }) {
  return (
    <button
      type="button"
      onClick={onUpgrade}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 100, padding: '3px 8px', fontSize: 10, color: '#A78BFA', fontWeight: 600, cursor: 'pointer' }}
    >
      <Lock size={9} /> Elite
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

function UpgradeBanner({ label, onUpgrade }: { tier: string; label: string; onUpgrade: () => void }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.08),rgba(167,139,250,0.04))', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', marginBottom: 4, fontFamily: 'Syne,sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Requiere Elite</div>
      <div style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.5, marginBottom: 10 }}>{label}</div>
      <button
        type="button"
        onClick={onUpgrade}
        style={{ background: '#A78BFA', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif', width: '100%' }}
      >
        Ver plan Elite →
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

export function CardForm({ card, primaryColor = '#E8341A', autoSave = false, exitHref, orgTier = 'elite' }: CardFormProps) {
  const isEdit = !!card;
  const router = useRouter();

  // Restore builder state from saved design if editing — wrapped in useRef to run only once
  const initialBuilderRef = useRef<BuilderState | null>(null);
  if (!initialBuilderRef.current) {
    const savedDesign = card?.design as Record<string, unknown> | null | undefined;
    initialBuilderRef.current = {
      ...DEFAULT_BUILDER,
      cardName: (savedDesign?.cardName as string) ?? card?.name ?? DEFAULT_BUILDER.cardName,
      template: (savedDesign?.template as TemplateId) ?? DEFAULT_BUILDER.template,
      palette: (savedDesign?.palette as string) ?? DEFAULT_BUILDER.palette,
      customGradient: (savedDesign?.customGradient as CustomGradient | null) ?? null,
      customPrimary: (savedDesign?.customPrimary as string) ?? undefined,
      font: (savedDesign?.font as string) ?? DEFAULT_BUILDER.font,
      customFontUrl: (savedDesign?.customFontUrl as string) ?? undefined,
      customFontFamily: (savedDesign?.customFontFamily as string) ?? undefined,
      pattern: (savedDesign?.pattern as string) ?? DEFAULT_BUILDER.pattern,
      pointsStyle: (savedDesign?.pointsStyle as PointsStyleId) ?? DEFAULT_BUILDER.pointsStyle,
      showBadge: (savedDesign?.showBadge as boolean) ?? false,
      badgeText: (savedDesign?.badgeText as string) ?? DEFAULT_BUILDER.badgeText,
      showMemberNum: (savedDesign?.showMemberNum as boolean) ?? false,
      qrStyle: (savedDesign?.qrStyle as BuilderState['qrStyle']) ?? 'simple',
      stampIcon: (savedDesign?.stampIcon as StampIconId) ?? DEFAULT_BUILDER.stampIcon,
      customStampUrl: (savedDesign?.customStampUrl as string) ?? undefined,
      customLayout: (savedDesign?.customLayout as BuilderState['customLayout']) ?? 'stack',
      customElemBiz:      (savedDesign?.customElemBiz      as boolean) ?? true,
      customElemCardName: (savedDesign?.customElemCardName as boolean) ?? true,
      customElemPoints:   (savedDesign?.customElemPoints   as boolean) ?? true,
      customElemMember:   (savedDesign?.customElemMember   as boolean) ?? true,
      customElemQr:       (savedDesign?.customElemQr       as boolean) ?? true,
      customElemLogo:     (savedDesign?.customElemLogo     as boolean) ?? true,
      cardType:           (savedDesign?.cardType as CardType) ?? DEFAULT_BUILDER.cardType,
    };
  }

  // 'free' is only the expired-trial state — for builder feature access it behaves as 'basic'
  const [tier, setTier] = useState<Tier>(orgTier === 'free' ? 'basic' : orgTier);
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
  const [iconSearch, setIconSearch] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardAnimating, setCardAnimating] = useState(false);
  const [pendingCardType, setPendingCardType] = useState<CardType | null>(null);
  // For new cards, the type must be explicitly confirmed before the rest of the form unlocks
  const [typeConfirmed, setTypeConfirmed] = useState(isEdit);
  const [walletFlipped, setWalletFlipped] = useState(false);
  const walletTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDesignSig = useRef('');
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt on hover
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - rect.top) / rect.height - 0.5) * -14,
      y: ((e.clientX - rect.left) / rect.width - 0.5) * 14,
    });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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
  }, [leftWidth]);

  const [s, setS] = useState<BuilderState>(() => initialBuilderRef.current!);
  const [description, setDescription] = useState(() => card?.description ?? '');
  const [pointsPerCheckin, setPointsPerCheckin] = useState(() => card?.pointsPerCheckin ?? 1);
  const [rewardDescription, setRewardDescription] = useState(() => card?.rewardDescription ?? '');
  const [pointsForReward, setPointsForReward] = useState(() => card?.pointsForReward ?? 10);
  const [maxMembers, setMaxMembers] = useState(() => card?.maxMembers?.toString() ?? '');

  const set = useCallback(<K extends keyof BuilderState>(k: K, v: BuilderState[K]) =>
    setS((prev) => ({ ...prev, [k]: v })), []);

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
    if (s.customPrimary) {
      return { primary: s.customPrimary, bg: `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${s.customPrimary} 100%)` };
    }
    return palettes.find((p) => p.id === s.palette) ?? palettes[0]!;
  }, [s.customGradient, s.customPrimary, s.palette, palettes]);

  const font = useMemo((): FontOption => {
    if (s.customFontFamily) {
      return { id: 'custom', display: s.customFontFamily, body: s.customFontFamily, name: 'Fuente personalizada', tier: 'elite' };
    }
    return FONTS.find((f) => f.id === s.font) ?? FONTS[0]!;
  }, [s.font, s.customFontFamily]);
  const pattern = useMemo(() => (PATTERNS.find((p) => p.id === s.pattern) ?? PATTERNS[0])!, [s.pattern]);

  const upgrade = useCallback((_required: string) => {
    window.confirm('Esta función requiere el plan Elite ($29.99/mes). ¿Ver planes?');
  }, []);

  // Single source of truth for design payload — used by both hidden form input and auto-save
  const designPayload = useMemo(() => ({
    template: s.template, palette: s.palette, customGradient: s.customGradient, customPrimary: s.customPrimary,
    font: s.font, customFontUrl: s.customFontUrl, customFontFamily: s.customFontFamily,
    pattern: s.pattern, pointsStyle: s.pointsStyle,
    showBadge: s.showBadge, badgeText: s.badgeText,
    showMemberNum: s.showMemberNum, qrStyle: s.qrStyle,
    stampIcon: s.stampIcon, customStampUrl: s.customStampUrl,
    cardName: s.cardName, businessName: s.businessName,
    customLayout: s.customLayout,
    customElemBiz: s.customElemBiz, customElemCardName: s.customElemCardName,
    customElemPoints: s.customElemPoints, customElemMember: s.customElemMember,
    customElemQr: s.customElemQr, customElemLogo: s.customElemLogo,
    cardType: s.cardType,
  }), [s]);

  const designPayloadJSON = useMemo(() => JSON.stringify(designPayload), [designPayload]);

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
      const result: CreateCardResult = await createCardAction(formData);
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
      } else {
        router.push(`/app/cards/${result.cardId}/builder`);
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
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const fd = new FormData();
      fd.set('name', s.cardName);
      fd.set('description', description);
      fd.set('pointsPerCheckin', String(pointsPerCheckin));
      fd.set('pointsForReward', String(pointsForReward));
      fd.set('rewardDescription', rewardDescription);
      if (maxMembers) fd.set('maxMembers', maxMembers);
      fd.set('design', designPayloadJSON);
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
  }, [s, designPayloadJSON, description, pointsPerCheckin, rewardDescription, pointsForReward, maxMembers]);

  // Flash animation whenever the visible card design changes
  useEffect(() => {
    const sig = `${s.template}|${s.palette}|${s.customPrimary ?? ''}|${s.customGradient?.id ?? ''}|${s.font}`;
    prevDesignSig.current = sig;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — init only

  useEffect(() => {
    const sig = `${s.template}|${s.palette}|${s.customPrimary ?? ''}|${s.customGradient?.id ?? ''}|${s.font}`;
    if (!prevDesignSig.current || prevDesignSig.current === sig) { prevDesignSig.current = sig; return; }
    prevDesignSig.current = sig;
    setCardAnimating(true);
    const t = setTimeout(() => setCardAnimating(false), 380);
    return () => clearTimeout(t);
  }, [s.template, s.palette, s.customPrimary, s.customGradient, s.font]);

  // Wallet auto-flip loop: 3.5s front → flip to back → 2s back → flip to front → repeat
  useEffect(() => {
    function scheduleFlip() {
      walletTimerRef.current = setTimeout(() => {
        setWalletFlipped(true);
        walletTimerRef.current = setTimeout(() => {
          setWalletFlipped(false);
          scheduleFlip();
        }, 2400);
      }, 3500);
    }
    scheduleFlip();
    return () => { if (walletTimerRef.current) clearTimeout(walletTimerRef.current); };
  }, []);

  // Inject custom font into the document when the user sets one
  useEffect(() => {
    if (!s.customFontUrl) return;
    const id = 'sellio-custom-font';
    let el = document.getElementById(id) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.id = id;
      el.rel = 'stylesheet';
      document.head.appendChild(el);
    }
    el.href = s.customFontUrl;
  }, [s.customFontUrl]);

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'templates', label: 'Plantillas' },
    { id: 'background', label: 'Fondo' },
    { id: 'colors', label: 'Colores' },
    { id: 'typography', label: 'Tipo' },
    { id: 'elements', label: 'Elementos' },
  ];

  const cardSlug = card ? `sellio.app/c/${card.id.slice(0, 8)}` : null;

  return (
    <div className="sellio-builder" style={{ display: 'flex', flexDirection: 'column', background: '#0D0B09', color: '#F5F0EB', borderRadius: exitHref ? 0 : 16, border: exitHref ? 'none' : '1px solid rgba(245,240,235,0.07)', overflow: 'hidden', boxShadow: exitHref ? 'none' : '0 20px 60px rgba(0,0,0,0.5)', fontFamily: 'Space Grotesk,sans-serif', height: exitHref ? '100vh' : undefined }}>
      {/* Hidden form inputs */}
      <form id="card-builder-form" onSubmit={handleSubmit}>
        <input name="name"              value={s.cardName}          readOnly aria-hidden className="hidden" />
        <input name="description"       value={description}          readOnly aria-hidden className="hidden" />
        <input name="pointsPerCheckin"  value={pointsPerCheckin}     readOnly aria-hidden className="hidden" />
        <input name="pointsForReward"   value={pointsForReward}      readOnly aria-hidden className="hidden" />
        <input name="rewardDescription" value={rewardDescription}    readOnly aria-hidden className="hidden" />
        <input name="maxMembers"        value={maxMembers}           readOnly aria-hidden className="hidden" />
        <input name="design"            value={designPayloadJSON}    readOnly aria-hidden className="hidden" />
      </form>

      {/* Top bar */}
      <div style={{ height: 48, background: '#111009', borderBottom: '1px solid rgba(245,240,235,0.07)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        {exitHref && (
          <>
            <Link href={exitHref} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6560', textDecoration: 'none', transition: 'color 0.15s', flexShrink: 0 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#F5F0EB'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#6B6560'; }}
            >
              <ChevronLeft size={14} /> Salir
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
          background: tier === 'elite' ? 'rgba(167,139,250,0.15)' : 'rgba(193,125,60,0.15)',
          color: tier === 'elite' ? '#A78BFA' : '#C17D3C',
        }}>
          {tier === 'elite' ? 'Elite' : 'Basic'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {error && (
            <span style={{ fontSize: 11, color: '#F87171', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={error}>
              {error}
            </span>
          )}
          {autoSave ? (
            <span style={{
              fontSize: 11,
              transition: 'color 0.3s',
              color: saveStatus === 'saving' ? '#6B6560' : saveStatus === 'saved' ? '#4ADE80' : saveStatus === 'error' ? '#F87171' : 'transparent',
            }}>
              {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'error' ? 'Error al guardar' : '·'}
            </span>
          ) : (
            <Button type="submit" form="card-builder-form" loading={isPending} size="sm" disabled={!typeConfirmed}>
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
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, position: 'relative' }}>
            {!typeConfirmed && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(13,11,9,0.82)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>🎯</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: '#F5F0EB' }}>Elige el tipo primero</div>
                <div style={{ fontSize: 11, color: '#4A4540', lineHeight: 1.6 }}>Selecciona Sellos o Puntos en el panel derecho para desbloquear la personalización.</div>
              </div>
            )}

            {/* Templates tab — two sections: Personalizar + Plantillas */}
            {activeTab === 'templates' && (() => {
              const innerWidth = Math.max(leftWidth - 32 - 12, 120);
              const colW = Math.max(Math.floor((innerWidth - 8) / 2), 56);
              const colH = Math.round(colW * (230 / 380));
              const colScale = colW / 380;

              // ── Layouts filtered by cardType:
              // stamps: any clean-front template (Stamp template excluded — stamps are always on the back via flip)
              // points: any template except Stamp (Stamp is stamps-specific)
              const DESIGN_LAYOUTS = TEMPLATES.filter(t => t.id !== 'custom' && t.id !== 'stamp');

              // ── Custom layout distribution options
              const CUSTOM_DISTRIBUTIONS = [
                { id: 'stack'    as const, label: 'Vertical'  },
                { id: 'centered' as const, label: 'Centrado'  },
                { id: 'split'    as const, label: 'Acento'    },
              ] as const;

              // ── Element chips for custom template
              const ELEMS: Array<{ key: 'customElemBiz' | 'customElemCardName' | 'customElemPoints' | 'customElemMember' | 'customElemQr' | 'customElemLogo'; label: string; Icon: LucideIcon }> = [
                { key: 'customElemBiz',      label: 'Nombre del negocio', Icon: Building2 },
                { key: 'customElemCardName', label: 'Tipo de tarjeta',    Icon: Tag       },
                { key: 'customElemPoints',   label: 'Puntos',             Icon: Star      },
                { key: 'customElemMember',   label: 'Nombre del cliente', Icon: User      },
                { key: 'customElemQr',       label: 'Código QR',          Icon: QrCode    },
                { key: 'customElemLogo',     label: 'Logo / badge',       Icon: Badge     },
              ];

              // ── Business template presets filtered by confirmed cardType
              type BizPreset = Partial<BuilderState>;
              const ALL_BUSINESS_TEMPLATES: Array<{ id: string; name: string; icon: LucideIcon; preset: BizPreset; forType: CardType }> = [
                { id: 'cafe',       name: 'Cafetería',       icon: Coffee,          forType: 'stamps',
                  preset: { template: 'stamp',   palette: 'amber',   font: 'syne',   businessName: 'Tu Cafetería',   cardName: 'Tarjeta Café',      pointsStyle: 'stamps', stampIcon: 'coffee'   } },
                { id: 'salon',      name: 'Peluquería',      icon: Scissors,        forType: 'stamps',
                  preset: { template: 'stamp',   palette: 'teal',    font: 'syne',   businessName: 'Tu Salón',       cardName: 'Membership Card',   pointsStyle: 'stamps', stampIcon: 'scissors' } },
                { id: 'gym-stamp',  name: 'Gym / Fitness',   icon: Dumbbell,        forType: 'stamps',
                  preset: { template: 'stamp',   palette: 'coral',   font: 'syne',   businessName: 'Tu Gym',         cardName: 'Plan Fitness',      pointsStyle: 'stamps', stampIcon: 'dumbbell' } },
                { id: 'bar',        name: 'Bar / Drinks',    icon: Beer,            forType: 'stamps',
                  preset: { template: 'stamp',   palette: 'violet',  font: 'syne',   businessName: 'Tu Bar',         cardName: 'Night Pass',        pointsStyle: 'stamps', stampIcon: 'cup-soda' } },
                { id: 'restaurant', name: 'Restaurante',     icon: UtensilsCrossed, forType: 'points',
                  preset: { template: 'classic', palette: 'emerald', font: 'syne',   businessName: 'Tu Restaurante', cardName: 'Club Gastronómico', pointsStyle: 'number' } },
                { id: 'spa',        name: 'Spa & Wellness',  icon: Leaf,            forType: 'points',
                  preset: { template: 'classic', palette: 'violet',  font: 'outfit', businessName: 'Tu Spa',         cardName: 'Club Wellness',     pointsStyle: 'number' } },
                { id: 'classes',    name: 'Clases Privadas', icon: BookOpen,        forType: 'points',
                  preset: { template: 'classic', palette: 'indigo',  font: 'outfit', businessName: 'Tu Academia',    cardName: 'Tarjeta Educativa', pointsStyle: 'number' } },
                { id: 'retail',     name: 'Tienda / Retail', icon: ShoppingBag,     forType: 'points',
                  preset: { template: 'classic', palette: 'indigo',  font: 'syne',   businessName: 'Tu Tienda',      cardName: 'VIP Member',        pointsStyle: 'number' } },
              ];
              const BUSINESS_TEMPLATES = ALL_BUSINESS_TEMPLATES.filter(t => t.forType === s.cardType);

              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* ══ PERSONALIZAR ══════════════════════════════ */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#F5F0EB', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Personalizar</span>
                    </div>

                    {(
                      <>
                        {/* Diseño grid */}
                        <div style={{ fontSize: 9, color: '#4A4540', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Diseño</div>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, 1fr)`, gap: 6, marginBottom: 16 }}>
                          {DESIGN_LAYOUTS.map((tpl) => {
                            const locked = !canUse(tier, tpl.tier);
                            const MiniCard = CARD_RENDERERS[tpl.id];
                            const isActive = s.template === tpl.id;
                            return (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => locked ? upgrade(tpl.tier) : set('template', tpl.id)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: locked ? 'not-allowed' : 'pointer', padding: 0 }}
                              >
                                <div style={{
                                  position: 'relative', width: colW, height: colH,
                                  borderRadius: 7, overflow: 'hidden',
                                  border: `2px solid ${isActive ? '#E8341A' : 'rgba(245,240,235,0.07)'}`,
                                  boxShadow: isActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none',
                                  transition: 'all 0.15s',
                                  opacity: locked ? 0.45 : 1,
                                }}>
                                  <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${colScale})`, pointerEvents: 'none' }}>
                                    <MiniCard s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />
                                  </div>
                                  {locked && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                                      <Lock size={9} color="#FFB347" />
                                    </div>
                                  )}
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#E8341A' : '#4A4540', transition: 'color 0.15s' }}>{tpl.name}</span>
                              </button>
                            );
                          })}

                          {/* Custom tile — always last */}
                          {(() => {
                            const isActive = s.template === 'custom';
                            const CustomCard = CARD_RENDERERS['custom'];
                            return (
                              <button
                                type="button"
                                onClick={() => set('template', 'custom')}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                <div style={{
                                  position: 'relative', width: colW, height: colH,
                                  borderRadius: 7, overflow: 'hidden',
                                  border: `2px solid ${isActive ? '#E8341A' : 'rgba(245,240,235,0.07)'}`,
                                  boxShadow: isActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none',
                                  transition: 'all 0.15s',
                                }}>
                                  <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${colScale})`, pointerEvents: 'none' }}>
                                    <CustomCard s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />
                                  </div>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#E8341A' : '#4A4540', transition: 'color 0.15s' }}>Custom</span>
                              </button>
                            );
                          })()}
                        </div>

                        {/* Custom-only controls */}
                        {s.template === 'custom' && (
                          <>
                            {/* Distribución */}
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 9, color: '#4A4540', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Distribución</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                                {CUSTOM_DISTRIBUTIONS.map(({ id, label }) => {
                                  const CustomCard = CARD_RENDERERS['custom'];
                                  const previewState = { ...s, customLayout: id };
                                  const distW = Math.max(Math.floor((innerWidth - 16) / 3), 40);
                                  const distH = Math.round(distW * (230 / 380));
                                  const distScale = distW / 380;
                                  const isDistActive = s.customLayout === id;
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => set('customLayout', id)}
                                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                      <div style={{
                                        position: 'relative', width: distW, height: distH,
                                        borderRadius: 5, overflow: 'hidden',
                                        border: `2px solid ${isDistActive ? '#E8341A' : 'rgba(245,240,235,0.07)'}`,
                                        boxShadow: isDistActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none',
                                        transition: 'all 0.15s',
                                      }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${distScale})`, pointerEvents: 'none' }}>
                                          <CustomCard s={previewState} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow />
                                        </div>
                                      </div>
                                      <span style={{ fontSize: 8, fontWeight: 600, color: isDistActive ? '#E8341A' : '#4A4540', transition: 'color 0.15s' }}>{label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Elementos */}
                            <div>
                              <div style={{ fontSize: 9, color: '#4A4540', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Elementos</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {ELEMS.map(({ key, label, Icon }) => {
                                  const on = s[key] as boolean;
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => set(key, !on)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                                        background: on ? 'rgba(232,52,26,0.07)' : 'transparent',
                                        border: `1.5px solid ${on ? 'rgba(232,52,26,0.3)' : 'rgba(245,240,235,0.06)'}`,
                                        transition: 'all 0.15s',
                                      }}
                                    >
                                      <div style={{
                                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: on ? '#E8341A' : 'rgba(245,240,235,0.04)',
                                        transition: 'background 0.15s',
                                      }}>
                                        <Icon size={12} color={on ? '#fff' : '#4A4540'} />
                                      </div>
                                      <span style={{ fontSize: 11, fontWeight: 500, color: on ? '#F5F0EB' : '#4A4540', flex: 1, transition: 'color 0.15s' }}>{label}</span>
                                      <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: on ? '#E8341A' : 'rgba(245,240,235,0.1)', transition: 'background 0.15s' }} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(245,240,235,0.07)', marginBottom: 24 }} />

                  {/* ══ PLANTILLAS ════════════════════════════════ */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#F5F0EB', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Plantillas</div>

                    {/* ── By business ── */}
                    <div style={{ fontSize: 9, color: '#4A4540', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Por negocio</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {BUSINESS_TEMPLATES.map(({ id, name, icon: BizIcon, preset }) => {
                        const mergedState: BuilderState = { ...s, ...preset };
                        const TemplateComp = CARD_RENDERERS[preset.template ?? s.template] ?? ClassicCard;
                        const presetPalId = preset.palette ?? s.palette;
                        const presetPal = palettes.find(p => p.id === presetPalId) ?? palettes[0]!;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setS(prev => ({ ...prev, ...preset }))}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <div style={{
                              position: 'relative', width: colW, height: colH,
                              borderRadius: 7, overflow: 'hidden',
                              border: '1.5px solid rgba(245,240,235,0.07)',
                              transition: 'border-color 0.15s',
                            }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232,52,26,0.3)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,240,235,0.07)'; }}
                            >
                              <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${colScale})`, pointerEvents: 'none' }}>
                                <TemplateComp s={mergedState} pal={presetPal} font={font} pattern={pattern} W={380} H={230} noShadow />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <BizIcon size={11} color="#6B6560" />
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#6B6560' }}>{name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
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
                        onClick={() => { set('palette', p.id); set('customGradient', null); set('customPrimary', undefined); }}
                        style={{ aspectRatio: '1', borderRadius: 5, cursor: 'pointer', background: p.bg, border: `2px solid ${s.palette === p.id && !s.customGradient && !s.customPrimary ? '#fff' : 'transparent'}`, transform: s.palette === p.id && !s.customGradient && !s.customPrimary ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </Section>

                <Section label="Fondo personalizado (Color libre)">
                  <input type="color" value={s.customPrimary ?? primaryColor} onChange={(e) => { set('customPrimary', e.target.value); set('customGradient', null); }} style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid rgba(245,240,235,0.12)', background: 'none', cursor: 'pointer', padding: 2 }} />
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

            {/* Colors → solo estilo del QR */}
            {activeTab === 'colors' && (
              <Section label="Estilo del QR" action={!canUse(tier, 'elite') ? <LockPill tier="elite" onUpgrade={() => upgrade('elite')} /> : undefined}>
                {(['simple', 'colored', 'logo'] as const).map((qs) => {
                  const locked = qs === 'logo' && !canUse(tier, 'elite');
                  return (
                    <div key={qs}
                      onClick={() => locked ? upgrade('elite') : set('qrStyle', qs)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, cursor: locked ? 'not-allowed' : 'pointer', marginBottom: 4, background: s.qrStyle === qs ? '#201D18' : 'transparent', border: `1px solid ${s.qrStyle === qs ? 'rgba(245,240,235,0.12)' : 'transparent'}`, opacity: locked ? 0.4 : 1 }}
                    >
                      <QR size={28} color={qs === 'colored' ? pal.primary : qs === 'logo' ? '#A78BFA' : 'rgba(255,255,255,0.6)'} />
                      <span style={{ fontSize: 12 }}>{qs === 'simple' ? 'Simple (blanco)' : qs === 'colored' ? 'A color' : 'Con logo'}</span>
                      {locked && <Lock size={9} style={{ marginLeft: 'auto', color: '#A78BFA' }} />}
                      {s.qrStyle === qs && !locked && <span style={{ marginLeft: 'auto', color: '#E8341A', fontSize: 12 }}>✓</span>}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Typography */}
            {activeTab === 'typography' && (
              <>
              <Section label="Tipografía">
                {FONTS.map((f) => {
                  const locked = !canUse(tier, f.tier);
                  const isActive = s.font === f.id;
                  // Per-font display customization for visual distinction
                  const displayStyle: React.CSSProperties = f.id === 'syne'
                    ? { fontFamily: `'Syne', sans-serif`, fontWeight: 800, fontSize: 26, color: '#F5F0EB', letterSpacing: '-0.02em', lineHeight: 1 }
                    : f.id === 'outfit'
                    ? { fontFamily: `'Outfit', sans-serif`, fontWeight: 800, fontSize: 24, color: '#F5F0EB', lineHeight: 1 }
                    : f.id === 'playfair'
                    ? { fontFamily: `'Playfair Display', serif`, fontWeight: 700, fontSize: 22, color: '#F5F0EB', lineHeight: 1.1 }
                    : f.id === 'cormorant'
                    ? { fontFamily: `'Cormorant Garamond', serif`, fontWeight: 600, fontSize: 26, color: '#F5F0EB', fontStyle: 'italic', lineHeight: 1.1 }
                    : f.id === 'cabinet'
                    ? { fontFamily: `'Plus Jakarta Sans', sans-serif`, fontWeight: 800, fontSize: 22, color: '#F5F0EB', lineHeight: 1 }
                    : f.id === 'bebas'
                    ? { fontFamily: `'Bebas Neue', sans-serif`, fontWeight: 400, fontSize: 32, color: '#F5F0EB', letterSpacing: '0.08em', lineHeight: 1 }
                    : f.id === 'josefin'
                    ? { fontFamily: `'Josefin Sans', sans-serif`, fontWeight: 700, fontSize: 20, color: '#F5F0EB', letterSpacing: '0.12em', textTransform: 'uppercase' }
                    : { fontFamily: `'Space Grotesk', monospace`, fontWeight: 500, fontSize: 18, color: '#F5F0EB', letterSpacing: '0.04em' };

                  const bodyStyle: React.CSSProperties = {
                    fontFamily: `'${f.body}', sans-serif`,
                    fontSize: 11,
                    color: '#6B6560',
                    marginTop: 4,
                    fontStyle: f.id === 'cormorant' ? 'normal' : undefined,
                    letterSpacing: f.id === 'josefin' ? '0.04em' : undefined,
                  };

                  return (
                    <div key={f.id}
                      onClick={() => locked ? upgrade(f.tier) : set('font', f.id)}
                      style={{ padding: 12, borderRadius: 8, marginBottom: 6, cursor: locked ? 'not-allowed' : 'pointer', border: `1.5px solid ${isActive ? '#E8341A' : 'rgba(245,240,235,0.07)'}`, background: isActive ? '#201D18' : 'transparent', opacity: locked ? 0.45 : 1, transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: isActive ? '#E8341A' : '#4A4540', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.name}</span>
                        {locked && <LockPill tier={f.tier} onUpgrade={() => {}} />}
                        {isActive && !locked && <span style={{ fontSize: 9, color: '#E8341A', fontWeight: 700 }}>✓ Activa</span>}
                      </div>
                      <div style={displayStyle}>Aa Bb 123</div>
                      <div style={bodyStyle}>Texto descriptivo del negocio</div>
                    </div>
                  );
                })}
              </Section>

              {/* Custom font — Elite only */}

              <Section label="Fuente personalizada" action={!canUse(tier, 'elite') ? <LockPill tier="elite" onUpgrade={() => upgrade('elite')} /> : undefined}>
                {!canUse(tier, 'elite') ? (
                  <UpgradeBanner tier="elite" label="Sube cualquier fuente de Google Fonts o un archivo .woff2 propio y úsala en tu tarjeta." onUpgrade={() => upgrade('elite')} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, color: '#6B6560', lineHeight: 1.5 }}>
                      Pega la URL de importación de Google Fonts o un archivo <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>.woff2</code>.
                    </div>
                    <label style={{ display: 'block' }}>
                      <div style={{ fontSize: 11, color: '#6B6560', marginBottom: 5, fontWeight: 500 }}>URL de la fuente</div>
                      <input
                        type="url"
                        value={s.customFontUrl ?? ''}
                        onChange={(e) => set('customFontUrl', e.target.value || undefined)}
                        placeholder="https://fonts.googleapis.com/css2?family=..."
                        style={{ width: '100%', background: '#201D18', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: '#F5F0EB', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ display: 'block' }}>
                      <div style={{ fontSize: 11, color: '#6B6560', marginBottom: 5, fontWeight: 500 }}>Nombre CSS de la familia</div>
                      <input
                        type="text"
                        value={s.customFontFamily ?? ''}
                        onChange={(e) => set('customFontFamily', e.target.value || undefined)}
                        placeholder="Ej: Roboto, Pacifico, MiFuente"
                        style={{ width: '100%', background: '#201D18', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: '#F5F0EB', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </label>
                    {s.customFontFamily && (
                      <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(245,240,235,0.1)', background: '#0A0907' }}>
                        <div style={{ fontSize: 9, color: '#4A4540', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Preview</div>
                        <div style={{ fontFamily: `'${s.customFontFamily}', sans-serif`, fontSize: 26, fontWeight: 700, color: '#F5F0EB', lineHeight: 1 }}>Aa Bb 123</div>
                        <div style={{ fontFamily: `'${s.customFontFamily}', sans-serif`, fontSize: 11, color: '#6B6560', marginTop: 4 }}>{s.businessName || 'Tu Negocio'}</div>
                      </div>
                    )}
                    {s.customFontFamily && (
                      <button
                        type="button"
                        onClick={() => { set('customFontUrl', undefined); set('customFontFamily', undefined); }}
                        style={{ fontSize: 10, color: '#6B6560', background: 'none', border: '1px solid rgba(245,240,235,0.08)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Quitar fuente personalizada
                      </button>
                    )}
                  </div>
                )}
              </Section>
              </>
            )}


            {/* Elements */}
            {activeTab === 'elements' && (
              <>
                <Section label={s.cardType === 'stamps' ? 'Display de sellos' : 'Display de puntos'}>
                  {POINTS_STYLES.filter(ps => s.cardType === 'stamps' ? (ps.id === 'stamps' || ps.id === 'stars') : (ps.id === 'number' || ps.id === 'bar' || ps.id === 'stars')).map((ps) => {
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

                {s.cardType === 'stamps' && (
                  <Section label="Diseño de sellos">
                    {(() => {
                      const currentScenario = STAMP_CATEGORIES.find(c => c.icons.some(i => i.id === s.stampIcon))?.id || 'generic';
                      return (
                        <>
                          <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: '#6B6560', marginBottom: 5, display: 'block', fontWeight: 500 }}>Escenario / Rubro</span>
                            <select
                              value={currentScenario}
                              onChange={(e) => {
                                const newScenario = e.target.value;
                                const firstIcon = STAMP_CATEGORIES.find(c => c.id === newScenario)?.icons[0];
                                if (firstIcon) {
                                  if (!canUse(tier, firstIcon.tier)) {
                                    upgrade(firstIcon.tier);
                                  } else {
                                    set('stampIcon', firstIcon.id as StampIconId);
                                  }
                                }
                              }}
                              style={{ width: '100%', background: '#201D18', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 7, padding: '8px 10px', fontSize: 12, color: '#F5F0EB', outline: 'none' }}
                            >
                              {STAMP_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </div>

                          {currentScenario !== 'custom' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                              {STAMP_CATEGORIES.find(c => c.id === currentScenario)?.icons.map(si => {
                                const locked = !canUse(tier, si.tier);
                                const IconComp = si.icon;
                                return (
                                  <button
                                    key={si.id}
                                    type="button"
                                    onClick={() => locked ? upgrade(si.tier) : set('stampIcon', si.id as StampIconId)}
                                    style={{
                                      aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: locked ? 'not-allowed' : 'pointer', background: s.stampIcon === si.id ? 'rgba(232,52,26,0.15)' : 'transparent', border: `1px solid ${s.stampIcon === si.id ? '#E8341A' : 'rgba(245,240,235,0.12)'}`, opacity: locked ? 0.45 : 1, position: 'relative'
                                    }}
                                    title={si.label}
                                  >
                                    <IconComp size={18} color={s.stampIcon === si.id ? '#E8341A' : '#A39D98'} />
                                    <span style={{ fontSize: 9, color: s.stampIcon === si.id ? '#E8341A' : '#6B6560', fontWeight: 600 }}>{si.label}</span>
                                    {locked && <Lock size={8} style={{ position: 'absolute', top: 4, right: 4, color: '#FFB347' }} />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Ver todos / búsqueda extendida */}
                          {currentScenario !== 'custom' && (
                            <button
                              type="button"
                              onClick={() => setShowIconPicker(v => !v)}
                              style={{ marginTop: 8, fontSize: 10, color: '#E8341A', background: 'none', border: '1px solid rgba(232,52,26,0.25)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', width: '100%', fontWeight: 600, letterSpacing: '0.04em' }}
                            >
                              {showIconPicker ? '▲ Ocultar librería' : '▼ Ver todos los íconos'}
                            </button>
                          )}

                          {showIconPicker && currentScenario !== 'custom' && (() => {
                            const filtered = STAMP_ICONS_EXTENDED.filter(ic =>
                              ic.id !== 'custom' &&
                              (!iconSearch || ic.label.toLowerCase().includes(iconSearch.toLowerCase()) || ic.category.toLowerCase().includes(iconSearch.toLowerCase()))
                            );
                            return (
                              <div style={{ marginTop: 8, background: '#0A0A0A', border: '1px solid rgba(245,240,235,0.08)', borderRadius: 10, padding: 10 }}>
                                <input
                                  type="text"
                                  placeholder="Buscar ícono..."
                                  value={iconSearch}
                                  onChange={e => setIconSearch(e.target.value)}
                                  style={{ width: '100%', background: '#1A1713', border: '1px solid rgba(245,240,235,0.12)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#F5F0EB', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, maxHeight: 220, overflowY: 'auto' }}>
                                  {filtered.map(ic => {
                                    const locked = !canUse(tier, ic.tier);
                                    const IconComp = ic.icon;
                                    const isActive = s.stampIcon === ic.id;
                                    return (
                                      <button
                                        key={ic.id}
                                        type="button"
                                        title={`${ic.label} · ${ic.category}`}
                                        onClick={() => {
                                          if (locked) { upgrade(ic.tier); return; }
                                          set('stampIcon', ic.id as StampIconId);
                                          setShowIconPicker(false);
                                        }}
                                        style={{ aspectRatio: '1', borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: locked ? 'not-allowed' : 'pointer', background: isActive ? 'rgba(232,52,26,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? '#E8341A' : 'rgba(245,240,235,0.08)'}`, opacity: locked ? 0.4 : 1, transition: 'all 0.12s', position: 'relative' }}
                                      >
                                        <IconComp size={16} color={isActive ? '#E8341A' : '#6B6560'} />
                                        <span style={{ fontSize: 8, color: isActive ? '#E8341A' : '#4A4540', textAlign: 'center', lineHeight: 1.2 }}>{ic.label}</span>
                                        {locked && <Lock size={7} style={{ position: 'absolute', top: 2, right: 2, color: '#FFB347' }} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {currentScenario === 'custom' && canUse(tier, 'elite') && (
                            <div style={{ marginTop: 10, padding: '10px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}>
                              <CtrlInput
                                label="URL del Sello (Imagen)"
                                value={s.customStampUrl ?? ''}
                                onChange={(v) => set('customStampUrl', v)}
                                placeholder="https://ejemplo.com/sello.png"
                              />
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                                Pega la URL de una imagen PNG con fondo transparente.
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </Section>
                )}

                <Section label="Elementos adicionales">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12 }}>Badge de nivel</span>
                    <Toggle on={s.showBadge} onChange={() => set('showBadge', !s.showBadge)} />
                  </div>
                  {s.showBadge && (
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
                    <Toggle on={s.showMemberNum} onChange={() => set('showMemberNum', !s.showMemberNum)} />
                  </div>
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
                    {(['basic', 'elite'] as Tier[]).map((t) => (
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
        <div
          style={{ background: '#0D0B09', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', pointerEvents: isDragging ? 'none' : 'auto' }}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Dot grid background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#2E2A26 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4, pointerEvents: 'none' }} />
          {/* Ambient glow */}
          <div style={{ position: 'absolute', width: 320, height: 160, borderRadius: '50%', background: `radial-gradient(ellipse, ${pal.primary}18 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />

          {/* Panel collapse toggle */}
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

          {/* ── Main canvas row: card left, wallet right ── */}
          <div
            style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 52, padding: '48px 40px 32px', width: '100%', overflowY: 'auto' }}
          >

            {/* Left: two-view card with from-above transition */}
            {(() => {
              const IconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon ?? STAMP_ICONS_EXTENDED[0]!.icon;
              const totalStamps = Math.min(s.cardType === 'stamps' ? pointsForReward : 10, 20);
              const filled = Math.round(totalStamps * 0.7);
              const cols = Math.min(totalStamps, 5);
              const rows = Math.ceil(totalStamps / cols);

              const faceStyle = (active: boolean): React.CSSProperties => ({
                position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden',
                transformOrigin: '50% 50%',
                transform: active ? 'perspective(1000px) rotateY(0deg) scale(1)' : 'perspective(1000px) rotateY(-90deg) scale(0.94)',
                opacity: active ? 1 : 0,
                transition: active
                  ? 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease 0.12s'
                  : 'transform 0.28s ease-in, opacity 0.18s ease-in',
                pointerEvents: active ? 'auto' : 'none',
                zIndex: active ? 1 : 0,
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flexShrink: 0 }}>

                  {/* Card — swap animation wraps the whole tilt+float unit */}
                  <div style={{ animation: cardAnimating ? 'cardSwap 0.45s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}>
                    <div
                      ref={cardRef}
                      style={{ display: 'inline-block' }}
                    >
                      {/* Tilt + float + shadow */}
                      <div
                        onClick={() => setIsFlipped(v => !v)}
                        style={{
                          width: 380, height: 230,
                          position: 'relative',
                          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                          transition: 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)',
                          animation: cardAnimating ? 'none' : 'cardFloat 5s ease-in-out infinite',
                          filter: `drop-shadow(0 28px 52px ${pal.primary}38)`,
                          willChange: 'transform',
                          cursor: 'pointer',
                        }}>

                        {/* ── FRONT: selected template — clean when cardType=stamps (stamps shown on back) ── */}
                        <div style={faceStyle(!isFlipped)}>
                          {(() => { const FrontCard = CARD_RENDERERS[s.template] ?? ClassicCard; return <FrontCard s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />; })()}
                        </div>

                        {/* ── BACK: stamps or points ── */}
                        <div style={{ ...faceStyle(isFlipped), background: `linear-gradient(135deg, #1A1712 0%, #111009 100%)` }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: `${pal.primary}12`, pointerEvents: 'none' }} />
                          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '16px 18px 12px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ flexShrink: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: pal.primary, letterSpacing: '-0.01em' }}>{s.businessName || 'Tu Negocio'}</div>
                              <div style={{ fontSize: 7.5, color: 'rgba(245,240,235,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>{s.cardType === 'stamps' ? 'Stamp Card' : 'Loyalty Points'}</div>
                            </div>

                            {s.cardType === 'stamps' ? (
                              <>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
                                  {Array.from({ length: rows }, (_, r) => (
                                    <div key={r} style={{ display: 'flex', gap: 7 }}>
                                      {Array.from({ length: cols }, (_, c) => {
                                        const i = r * cols + c;
                                        if (i >= totalStamps) return <div key={c} style={{ flex: 1 }} />;
                                        return (
                                          <div key={c} style={{ flex: 1, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: i < filled ? pal.primary : 'rgba(245,240,235,0.06)', border: i < filled ? 'none' : '1.5px solid rgba(245,240,235,0.12)' }}>
                                            <IconComp size={16} color={i < filled ? '#fff' : 'rgba(245,240,235,0.2)'} />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ fontSize: 9, color: 'rgba(245,240,235,0.3)' }}>
                                    {filled}/{totalStamps} · <span style={{ color: pal.primary, fontWeight: 700 }}>{totalStamps - filled} para la recompensa</span>
                                  </div>
                                  <div style={{ fontSize: 7.5, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: 'rgba(245,240,235,0.12)', letterSpacing: '0.12em' }}>SELLIO</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: pal.primary, lineHeight: 1, letterSpacing: '-0.04em' }}>{filled * 10}</div>
                                    <div style={{ fontSize: 9, color: 'rgba(245,240,235,0.3)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>puntos acumulados</div>
                                  </div>
                                  <div style={{ width: '80%' }}>
                                    <div style={{ height: 5, background: 'rgba(245,240,235,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${Math.min(100, Math.round(filled / totalStamps * 100))}%`, background: pal.primary, borderRadius: 3, transition: 'width 0.3s' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                                      <div style={{ fontSize: 8, color: 'rgba(245,240,235,0.25)' }}>{filled * 10} pts</div>
                                      <div style={{ fontSize: 8, color: 'rgba(245,240,235,0.25)' }}>Meta: {totalStamps * 10} pts</div>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ fontSize: 9, color: 'rgba(245,240,235,0.3)' }}>
                                    Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>{(totalStamps - filled) * 10} pts</span> para la recompensa
                                  </div>
                                  <div style={{ fontSize: 7.5, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: 'rgba(245,240,235,0.12)', letterSpacing: '0.12em' }}>SELLIO</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* flip label below card */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.45 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#7A7470', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {isFlipped ? 'Ver frente' : s.cardType === 'stamps' ? 'Ver sellos' : 'Ver puntos'}
                    </span>
                    <span style={{ fontSize: 11, color: '#7A7470' }}>↻</span>
                  </div>
                </div>
              );
            })()}

            {/* Right: iPhone wallet with animated flip card */}
            {(() => {
              const W_CARD = 192;
              const H_CARD = Math.round(W_CARD * 230 / 380);
              const wScale = W_CARD / 380;
              const WIconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon ?? STAMP_ICONS_EXTENDED[0]!.icon;
              const wTotal = Math.min(s.cardType === 'stamps' ? pointsForReward : 10, 20);
              const wFilled = Math.round(wTotal * 0.7);
              const wCols = Math.min(wTotal, 5);
              const wRows = Math.ceil(wTotal / wCols);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#4A4540', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vista en Wallet</div>
                  {/* iPhone shell */}
                  <div style={{ width: 230, height: 460, borderRadius: 42, background: '#000', border: '7px solid #1C1C1E', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Status bar */}
                    <div style={{ height: 28, background: '#000', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>9:41</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 7, color: '#fff' }}>▪▪▪</span>
                        <span style={{ fontSize: 7, color: '#fff', background: '#4ADE80', borderRadius: 3, padding: '1px 3px' }}>85</span>
                      </div>
                    </div>

                    {/* Wallet content */}
                    <div style={{ flex: 1, background: '#111', display: 'flex', flexDirection: 'column', padding: '12px 10px 10px', gap: 10 }}>
                      {/* Wallet header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>Wallet</span>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 11, color: '#fff' }}>+</span>
                        </div>
                      </div>

                      {/* ── Two-view card — from-above transition ── */}
                      <div
                        style={{ width: W_CARD, height: H_CARD, alignSelf: 'center', cursor: 'pointer', flexShrink: 0, position: 'relative', perspective: '600px', perspectiveOrigin: '50% 50%' }}
                        onClick={() => {
                          if (walletTimerRef.current) clearTimeout(walletTimerRef.current);
                          setWalletFlipped(f => {
                            const next = !f;
                            walletTimerRef.current = setTimeout(() => setWalletFlipped(false), next ? 2400 : 0);
                            return next;
                          });
                        }}
                      >
                        {/* Front face */}
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
                          transformOrigin: '50% 0%',
                          transform: !walletFlipped ? 'rotateX(0deg) scale(1)' : 'rotateX(-72deg) scale(0.96)',
                          opacity: !walletFlipped ? 1 : 0,
                          transition: !walletFlipped
                            ? 'transform 0.46s cubic-bezier(0.16,1,0.3,1), opacity 0.38s ease'
                            : 'transform 0.26s ease-in, opacity 0.2s ease-in',
                          pointerEvents: !walletFlipped ? 'auto' : 'none',
                        }}>
                          <div style={{ width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${wScale})`, pointerEvents: 'none' }}>
                            <CardFrontPreview s={s} pal={pal} font={font} />
                          </div>
                        </div>
                        {/* Back face */}
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
                          background: `linear-gradient(135deg, #1A1712 0%, #111009 100%)`,
                          transformOrigin: '50% 0%',
                          transform: walletFlipped ? 'rotateX(0deg) scale(1)' : 'rotateX(-72deg) scale(0.96)',
                          opacity: walletFlipped ? 1 : 0,
                          transition: walletFlipped
                            ? 'transform 0.46s cubic-bezier(0.16,1,0.3,1), opacity 0.38s ease'
                            : 'transform 0.26s ease-in, opacity 0.2s ease-in',
                          pointerEvents: walletFlipped ? 'auto' : 'none',
                        }}>
                          <div style={{ position: 'absolute', right: -10, top: -10, width: 60, height: 60, borderRadius: '50%', background: `${pal.primary}18` }} />
                          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '10px 12px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div>
                              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 10, color: pal.primary }}>{s.businessName || 'Tu Negocio'}</div>
                              <div style={{ fontSize: 6, color: 'rgba(245,240,235,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>{s.cardType === 'stamps' ? 'Stamp Card' : 'Loyalty Points'}</div>
                            </div>
                            {s.cardType === 'stamps' ? (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
                                {Array.from({ length: wRows }, (_, r) => (
                                  <div key={r} style={{ display: 'flex', gap: 4 }}>
                                    {Array.from({ length: wCols }, (_, c) => {
                                      const i = r * wCols + c;
                                      if (i >= wTotal) return <div key={c} style={{ flex: 1 }} />;
                                      return (
                                        <div key={c} style={{ flex: 1, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, background: i < wFilled ? pal.primary : 'rgba(245,240,235,0.07)', border: i < wFilled ? 'none' : '1px solid rgba(245,240,235,0.12)' }}>
                                          <WIconComp size={9} color={i < wFilled ? '#fff' : 'rgba(245,240,235,0.2)'} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: pal.primary, letterSpacing: '-0.03em', lineHeight: 1 }}>70</div>
                                <div style={{ fontSize: 6, color: 'rgba(245,240,235,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>puntos</div>
                                <div style={{ width: '80%', height: 3, background: 'rgba(245,240,235,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: '70%', background: pal.primary, borderRadius: 2 }} />
                                </div>
                              </div>
                            )}
                            <div style={{ fontSize: 6, color: 'rgba(245,240,235,0.35)' }}>
                              {s.cardType === 'stamps'
                                ? <>Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>{wTotal - wFilled}</span> sellos</>
                                : <>Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>30 pts</span> para la recompensa</>}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Tap hint */}
                      <div style={{ textAlign: 'center', fontSize: 8, color: '#3A3530', letterSpacing: '0.06em' }}>
                        {walletFlipped ? '↑ toca para ver el frente' : `↓ toca para ver ${s.cardType === 'stamps' ? 'sellos' : 'puntos'}`}
                      </div>

                      {/* Stacked other cards */}
                      <div style={{ position: 'relative', height: 48, marginTop: 'auto' }}>
                        {[['#A855F7', 'redBus'], ['#22C55E', 'Rewards'], ['#3B82F6', 'Coffee Club']].map(([color, label], i) => (
                          <div key={label} style={{ position: 'absolute', bottom: i * 10, left: 0, right: 0, height: 44, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', padding: '0 10px', zIndex: i, boxShadow: '0 -4px 12px rgba(0,0,0,0.5)' }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div style={{ height: 20, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>{/* closes main canvas row */}

          {/* Floating card animation keyframe injection */}
          <style>{`
            @keyframes cardFloat {
              0%   { transform: translateY(0px)   rotateX(0deg)    rotateY(0deg)   scale(1);    }
              15%  { transform: translateY(-7px)  rotateX(2.5deg)  rotateY(-4deg)  scale(1.01); }
              35%  { transform: translateY(-13px) rotateX(-1.5deg) rotateY(5deg)   scale(1.02); }
              55%  { transform: translateY(-16px) rotateX(1deg)    rotateY(-3deg)  scale(1.015);}
              75%  { transform: translateY(-9px)  rotateX(-2deg)   rotateY(3.5deg) scale(1.01); }
              100% { transform: translateY(0px)   rotateX(0deg)    rotateY(0deg)   scale(1);    }
            }
            @keyframes cardSwap {
              0%   { transform: perspective(1200px) rotateX(-40deg) translateY(-22px) scale(0.93); opacity: 0.4; }
              55%  { transform: perspective(1200px) rotateX(5deg)   translateY(3px)   scale(1.01); opacity: 1;   }
              100% { transform: perspective(1200px) rotateX(0deg)   translateY(0)     scale(1);    opacity: 1;   }
            }
          `}</style>
        </div>

        {/* ── Right panel ── */}
        <div style={{ background: '#111009', borderLeft: '1px solid rgba(245,240,235,0.07)', overflowY: 'auto' }}>

          {/* Tipo de recompensa — primera decisión, visible siempre al inicio */}
          <div style={{ padding: '16px 16px', borderBottom: '1px solid rgba(245,240,235,0.07)', background: '#0D0B09' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Tipo de recompensa</div>
            {isEdit ? (
              // Editing: read-only badge
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: s.cardType === 'stamps' ? 'rgba(232,52,26,0.08)' : 'rgba(167,139,250,0.08)', border: `1px solid ${s.cardType === 'stamps' ? 'rgba(232,52,26,0.22)' : 'rgba(167,139,250,0.22)'}` }}>
                {s.cardType === 'stamps' ? <Ticket size={18} color="#E8341A" /> : <Star size={18} color="#A78BFA" />}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.cardType === 'stamps' ? '#E8341A' : '#A78BFA' }}>{s.cardType === 'stamps' ? 'Tarjeta de Sellos' : 'Tarjeta de Puntos'}</div>
                  <div style={{ fontSize: 9.5, color: '#4A4540', marginTop: 1 }}>No se puede cambiar después de guardar</div>
                </div>
              </div>
            ) : (
              // New card: interactive picker
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'stretch' }}>
                {([['stamps', 'Sellos', 'Visita por visita'], ['points', 'Puntos', 'Totalmente configurable']] as const).map(([type, label, sub]) => {
                  const active = s.cardType === type;
                  const accentColor = type === 'stamps' ? '#E8341A' : '#A78BFA';
                  return (
                    <button key={type} type="button"
                      onClick={() => { if (!typeConfirmed || type !== s.cardType) setPendingCardType(type); }}
                      style={{ background: active ? `${accentColor}12` : '#201D18', border: `1.5px solid ${active ? `${accentColor}40` : 'rgba(245,240,235,0.08)'}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}
                    >
                      {active && <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: accentColor }} />}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        {type === 'stamps' ? <Ticket size={22} color={active ? '#E8341A' : '#4A4540'} /> : <Star size={22} color={active ? '#A78BFA' : '#4A4540'} />}
                      </div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 12, color: active ? accentColor : '#F5F0EB', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 9, color: '#4A4540', lineHeight: 1.3, textAlign: 'center' }}>{sub}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rest of right panel — locked until type is confirmed */}
          {!typeConfirmed && (
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(245,240,235,0.07)', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,240,235,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={14} color="#4A4540" />
              </div>
              <div style={{ fontSize: 11, color: '#4A4540', lineHeight: 1.6 }}>Elige y confirma el tipo de recompensa para continuar personalizando tu tarjeta.</div>
            </div>
          )}

          {typeConfirmed && (
          <>

          {/* Contenido visual */}
          <RightSection title="Contenido">
            <CtrlInput label="Nombre del negocio" value={s.businessName} onChange={(v) => set('businessName', v)} maxLength={30} />
            <CtrlInput label="Nombre de la tarjeta" value={s.cardName} onChange={(v) => set('cardName', v)} maxLength={25} error={fieldErrors.name} />
          </RightSection>

          {/* Configuración de negocio */}
          <RightSection title="Configuración">
            <CtrlInput label="Descripción" value={description} onChange={setDescription} error={fieldErrors.description} />
            <CtrlInput label="Recompensa" value={rewardDescription} onChange={setRewardDescription} placeholder="1 café gratis" error={fieldErrors.rewardDescription} />
            {s.cardType === 'points' && (
              <CtrlInput label="Puntos por visita" value={String(pointsPerCheckin)} onChange={(v) => setPointsPerCheckin(Math.max(1, Number(v) || 1))} type="number" error={fieldErrors.pointsPerCheckin} />
            )}
            <CtrlInput
              label={s.cardType === 'stamps' ? 'Número de sellos' : 'Puntos para recompensa'}
              value={String(pointsForReward)}
              onChange={(v) => setPointsForReward(Math.max(1, Math.min(s.cardType === 'stamps' ? 20 : 9999, Number(v) || 1)))}
              type="number"
              error={fieldErrors.pointsForReward}
            />
            <CtrlInput label="Máximo de miembros" value={maxMembers} onChange={setMaxMembers} type="number" placeholder="Sin límite" error={fieldErrors.maxMembers} />
          </RightSection>

          {/* Exportar */}
          <RightSection title="Exportar">
            {([['PNG', 'Imagen de alta resolución', 'free'], ['PDF', 'Para impresión (85×54mm)', 'free'], ['SVG', 'Vectorial editable', 'free'], ['Lote 50u', 'Para imprenta profesional', 'elite']] as const).map(([fmt, desc, req]) => {
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
                  {locked ? <Lock size={10} style={{ color: '#FFB347', flexShrink: 0 }} /> : <button type="button" style={{ display: 'flex', alignItems: 'center', color: '#E8341A', background: 'none', border: 'none', cursor: 'pointer' }}><DownloadIcon size={10} /></button>}
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
              <PrinterIcon size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} /> Descargar para imprimir
            </button>
          </RightSection>

          </>
          )}
        </div>
      </div>

      {(success || error) && (
        <div style={{ borderTop: '1px solid rgba(245,240,235,0.07)', padding: '12px 16px' }}>
          {success && <Alert variant="success">Cambios guardados correctamente.</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      {/* Card type confirmation modal */}
      {pendingCardType && (
        <CardTypeConfirmModal
          type={pendingCardType}
          onAccept={() => {
            set('cardType', pendingCardType);
            set('pointsStyle', pendingCardType === 'stamps' ? 'stamps' : 'number');
            set('template', 'classic');
            setTypeConfirmed(true);
            setPendingCardType(null);
          }}
          onCancel={() => setPendingCardType(null)}
        />
      )}
    </div>
  );
}

// ── Card front preview (customer-facing view) ──────────────────

function CardFrontPreview({ s, pal, font }: { s: BuilderState; pal: { primary: string; bg: string }; font: FontOption }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${pal.bg} 0%, #0D0B09 65%, ${pal.primary}18 100%)`, borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: `${pal.primary}12`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: -20, bottom: -50, width: 140, height: 140, borderRadius: '50%', background: `${pal.primary}08`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top: business name + logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `${font.display},Syne,sans-serif`, fontWeight: 800, fontSize: 18, color: pal.primary, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.businessName || 'Tu Negocio'}</div>
            <div style={{ fontSize: 7.5, color: 'rgba(245,240,235,0.32)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>{s.cardType === 'stamps' ? 'Stamp Card' : 'Loyalty Card'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#fff', boxShadow: `0 4px 14px ${pal.primary}55` }}>
              {(s.businessName || 'S').charAt(0).toUpperCase()}
            </div>
            {s.showBadge && s.badgeText && (
              <div style={{ background: `${pal.primary}18`, border: `1px solid ${pal.primary}40`, borderRadius: 20, padding: '2px 8px', fontSize: 7, color: pal.primary, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.badgeText}</div>
            )}
          </div>
        </div>
        {/* Center: accumulated value */}
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 58, color: '#F5F0EB', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {s.cardType === 'points' ? '847' : '7'}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(245,240,235,0.32)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 5 }}>
            {s.cardType === 'points' ? 'Puntos acumulados' : 'Sellos acumulados'}
          </div>
        </div>
        {/* Bottom: member info + QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(245,240,235,0.28)', letterSpacing: '0.1em', marginBottom: 2 }}>Nº 00847291</div>
            <div style={{ fontSize: 8, color: 'rgba(245,240,235,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Miembro</div>
            <div style={{ fontFamily: `${font.display},Syne,sans-serif`, fontWeight: 700, fontSize: 13, color: 'rgba(245,240,235,0.75)' }}>Ana García</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, opacity: 0.32 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: 3, border: '1.5px solid rgba(245,240,235,0.7)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 3, boxSizing: 'border-box' }}>
                <div style={{ background: 'rgba(245,240,235,0.85)', borderRadius: 1 }} />
                <div style={{ background: i === 1 || i === 3 ? 'transparent' : 'rgba(245,240,235,0.85)', borderRadius: 1 }} />
                <div style={{ background: i === 2 ? 'transparent' : 'rgba(245,240,235,0.85)', borderRadius: 1 }} />
                <div style={{ background: 'rgba(245,240,235,0.85)', borderRadius: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card type confirmation modal ────────────────────────────────

function CardTypeConfirmModal({ type, onAccept, onCancel }: { type: CardType; onAccept: () => void; onCancel: () => void }) {
  const isStamps = type === 'stamps';
  const accent = isStamps ? '#E8341A' : '#A78BFA';
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        style={{ background: '#1A1712', border: '1px solid rgba(245,240,235,0.1)', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 360, width: 'calc(100% - 32px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          {isStamps ? <Ticket size={32} color="#E8341A" /> : <Star size={32} color="#A78BFA" />}
        </div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 19, color: '#F5F0EB', marginBottom: 8, textAlign: 'center' }}>
          {isStamps ? 'Tarjeta de Sellos' : 'Tarjeta de Puntos'}
        </div>
        <div style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.65, marginBottom: 16, textAlign: 'center' }}>
          {isStamps
            ? 'Los clientes acumularán un sello por cada visita hasta completar la tarjeta y ganar su recompensa.'
            : 'Los clientes acumularán puntos por visita. Tú configuras cuántos puntos vale cada visita y cuántos se necesitan para la recompensa.'}
        </div>
        <div style={{ background: 'rgba(232,52,26,0.08)', border: '1px solid rgba(232,52,26,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#F87171', lineHeight: 1.55 }}>
          ⚠ Esta elección no podrá cambiarse una vez que guardes la tarjeta.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel}
            style={{ flex: 1, background: 'transparent', border: '1px solid rgba(245,240,235,0.14)', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#6B6560', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif' }}>
            Cancelar
          </button>
          <button type="button" onClick={onAccept}
            style={{ flex: 1, background: accent, border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff', cursor: 'pointer', boxShadow: `0 4px 16px ${accent}40` }}>
            Elegir {isStamps ? 'Sellos' : 'Puntos'}
          </button>
        </div>
      </div>
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
