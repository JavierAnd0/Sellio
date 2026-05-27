'use client';

import React, { type FormEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { type LucideIcon, Lock, ChevronLeft, Download as DownloadIcon, Printer as PrinterIcon, Building2, Tag, Star, User, QrCode, Badge, Coffee, UtensilsCrossed, Leaf, Dumbbell, BookOpen, Scissors, ShoppingBag, Beer, Ticket, Croissant, Home, Monitor, Gem, Music } from 'lucide-react';

import { Alert, Button } from '@sellio/ui';
import type { Card } from '@sellio/domain';

import { createCardAction, updateCardAction } from '@/actions/cards/card.actions';
import type { CreateCardResult } from '@/actions/cards/card.actions';
import {
  type Tier, type TabId, type TemplateId, type PointsStyleId, type CardType, type StampShapeId,
  type CustomGradient, type BuilderState, type StampIconId, type FontOption, type GradientStyleId,
  canUse, BASE_PALETTES, PATTERNS, FONTS, TEMPLATES,
  BADGE_OPTIONS, POINTS_STYLES, STAMP_SHAPES, STAMP_CATEGORIES, STAMP_ICONS_EXTENDED, DEFAULT_BUILDER, QR, ClassicCard, CARD_RENDERERS,
  stampShapeStyle, buildGradientBg, GRADIENT_STYLES, SPECIAL_EFFECTS, SpecialEffectOverlay, effectWrapperStyle,
  type FreeLayoutElem, defaultFreeElems, defaultFreeElemsBack, FreeLayoutOverlay, SNAP_POINTS,
} from './card-renderer';

// ── Types ──────────────────────────────────────────────────────

interface CardFormProps {
  card?: Card;
  primaryColor?: string;
  autoSave?: boolean;
  exitHref?: string;
  orgTier?: Tier;
  cardActiveUserCount?: number;
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
      style={{ width: 36, height: 20, borderRadius: 10, background: on && !disabled ? '#E8341A' : 'var(--cb-deep)', position: 'relative', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: disabled ? 0.4 : 1, flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 2, left: on && !disabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}

function UpgradeBanner({ label, onUpgrade }: { tier: string; label: string; onUpgrade: () => void }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.08),rgba(167,139,250,0.04))', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', marginBottom: 4, fontFamily: 'Syne,sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Requiere Elite</div>
      <div style={{ fontSize: 11, color: 'var(--cb-muted)', lineHeight: 1.5, marginBottom: 10 }}>{label}</div>
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

function StampCountField({ value, onChange, activeUserCount, error }: {
  value: number; onChange: (v: number) => void; activeUserCount: number; error?: string;
}) {
  const [confirmed, setConfirmed] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const isLocked = activeUserCount > 0 || confirmed;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--cb-muted)', marginBottom: 5, fontWeight: 500 }}>Número de sellos</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="number"
          value={value}
          min={2}
          max={20}
          disabled={isLocked}
          onChange={(e) => !isLocked && onChange(Math.max(2, Math.min(20, Number(e.target.value) || 2)))}
          style={{ flex: 1, background: isLocked ? 'rgba(var(--cb-fg-rgb),0.04)' : 'var(--cb-input)', border: `1px solid ${error ? '#F87171' : 'rgba(var(--cb-fg-rgb),0.12)'}`, borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: isLocked ? 'var(--cb-muted)' : 'var(--cb-fg)', outline: 'none', cursor: isLocked ? 'not-allowed' : 'text' }}
        />
        {!isLocked && (
          <button
            type="button"
            onClick={() => setShowWarning(true)}
            style={{ flexShrink: 0, background: 'rgba(232,52,26,0.1)', border: '1px solid rgba(232,52,26,0.3)', borderRadius: 7, padding: '7px 10px', fontSize: 11, fontWeight: 700, color: '#E8341A', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif' }}
          >
            Confirmar
          </button>
        )}
        {isLocked && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: activeUserCount > 0 ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)', border: `1px solid ${activeUserCount > 0 ? 'rgba(248,113,113,0.25)' : 'rgba(74,222,128,0.25)'}`, borderRadius: 7, padding: '6px 8px' }}>
            <Lock size={10} color={activeUserCount > 0 ? '#F87171' : '#4ADE80'} />
            <span style={{ fontSize: 9, fontWeight: 700, color: activeUserCount > 0 ? '#F87171' : '#4ADE80' }}>
              {activeUserCount > 0 ? `${activeUserCount} usuario${activeUserCount !== 1 ? 's' : ''}` : 'Confirmado'}
            </span>
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 10, color: '#F87171', display: 'block', marginTop: 3 }}>{error}</span>}
      {!isLocked && (
        <div style={{ fontSize: 9, color: 'var(--cb-dim)', marginTop: 4, lineHeight: 1.4 }}>
          Una vez que la tarjeta tenga usuarios activos, este número no podrá cambiarse.
        </div>
      )}
      {/* Confirm dialog */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--cb-panel)', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', borderRadius: 18, padding: 28, maxWidth: 320, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,52,26,0.1)', border: '1px solid rgba(232,52,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Lock size={18} color="#E8341A" />
            </div>
            {/* Title */}
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--cb-fg)', marginBottom: 8, fontFamily: 'Syne,sans-serif', letterSpacing: '-0.02em' }}>¿Confirmar {value} sellos?</div>
            {/* Body */}
            <div style={{ fontSize: 12, color: 'var(--cb-muted)', lineHeight: 1.65, marginBottom: 6 }}>
              Esta acción fija el número de sellos de la tarjeta.
            </div>
            {/* Warning pill */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 22 }}>
              <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <span style={{ fontSize: 11, color: '#F87171', lineHeight: 1.55 }}>
                Una vez que la tarjeta tenga usuarios activos, no podrás modificar este número.
              </span>
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button type="button" onClick={() => { setConfirmed(true); setShowWarning(false); }} style={{ width: '100%', background: '#E8341A', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Syne,sans-serif', letterSpacing: '0.01em' }}>
                Confirmar {value} sellos
              </button>
              <button type="button" onClick={() => setShowWarning(false)} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', borderRadius: 10, padding: '11px 0', fontSize: 12, fontWeight: 600, color: 'var(--cb-muted)', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CtrlInput({ label, value, onChange, type = 'text', placeholder, maxLength, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: 'text' | 'number'; placeholder?: string; maxLength?: number; error?: string;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--cb-muted)', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        min={type === 'number' ? 1 : undefined}
        style={{ width: '100%', background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: 'var(--cb-fg)', outline: 'none' }}
      />
      {error && <span style={{ fontSize: 10, color: '#F87171', display: 'block', marginTop: 3 }}>{error}</span>}
    </label>
  );
}

// ── CardForm ──────────────────────────────────────────────────

export function CardForm({ card, primaryColor = '#E8341A', autoSave = false, exitHref, orgTier = 'elite', cardActiveUserCount = 0 }: CardFormProps) {
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
      stampShape: (savedDesign?.stampShape as StampShapeId) ?? 'square',
      gradientStyle: (savedDesign?.gradientStyle as GradientStyleId) ?? 'diagonal',
      customGradDark: (savedDesign?.customGradDark as string) ?? undefined,
      freeLayout: (savedDesign?.freeLayout as boolean) ?? false,
      freeElems: Array.isArray(savedDesign?.freeElems) ? (savedDesign.freeElems as FreeLayoutElem[]) : [],
      freeElemsBack: Array.isArray(savedDesign?.freeElemsBack) ? (savedDesign.freeElemsBack as FreeLayoutElem[]) : [],
      customLayout: (savedDesign?.customLayout as BuilderState['customLayout']) ?? 'stack',
      customElemBiz:      (savedDesign?.customElemBiz      as boolean) ?? true,
      customElemCardName: (savedDesign?.customElemCardName as boolean) ?? true,
      customElemPoints:   (savedDesign?.customElemPoints   as boolean) ?? true,
      customElemMember:   (savedDesign?.customElemMember   as boolean) ?? true,
      customElemQr:       (savedDesign?.customElemQr       as boolean) ?? true,
      customElemLogo:     (savedDesign?.customElemLogo     as boolean) ?? true,
      cardType:           (savedDesign?.cardType as CardType) ?? DEFAULT_BUILDER.cardType,
      specialEffect:      (savedDesign?.specialEffect as BuilderState['specialEffect']) ?? 'none',
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

  // Face switcher — which face is currently being edited
  const [activeView, setActiveView] = useState<'front' | 'back' | 'wallet'>('front');

  // Free layout drag state (front)
  const freeDragRef = useRef<{ elemId: string; startPtrX: number; startPtrY: number; startElemX: number; startElemY: number; hasMoved: boolean } | null>(null);
  const [freeLivePos, setFreeLivePos] = useState<{ id: string; x: number; y: number } | null>(null);
  const [freeEditingId, setFreeEditingId] = useState<string | null>(null);
  const [freeEditingValue, setFreeEditingValue] = useState('');
  // Free layout drag state (back)
  const freeDragRefBack = useRef<{ elemId: string; startPtrX: number; startPtrY: number; startElemX: number; startElemY: number } | null>(null);
  const [freeLivePosBack, setFreeLivePosBack] = useState<{ id: string; x: number; y: number } | null>(null);
  const FREE_SCALE = 1.16;

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
    if (s.customGradient) {
      const dark = s.customGradDark ?? '#080808';
      return { primary: s.customGradient.primary, bg: buildGradientBg(s.customGradient.primary, dark, s.customGradient.bg, s.gradientStyle) };
    }
    if (s.customPrimary) {
      const baseBg = `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${s.customPrimary} 100%)`;
      return { primary: s.customPrimary, bg: buildGradientBg(s.customPrimary, '#0E0604', baseBg, s.gradientStyle) };
    }
    const palette = palettes.find((p) => p.id === s.palette) ?? palettes[0]!;
    return { primary: palette.primary, bg: buildGradientBg(palette.primary, palette.dark, palette.bg, s.gradientStyle) };
  }, [s.customGradient, s.customGradDark, s.customPrimary, s.palette, s.gradientStyle, palettes]);

  const backFaceBg = useMemo(() => {
    return buildGradientBg(pal.primary, '#080604', pal.bg, s.gradientStyle);
  }, [pal.primary, pal.bg, s.gradientStyle]);

  const font = useMemo((): FontOption => {
    if (s.customFontFamily) {
      return { id: 'custom', display: s.customFontFamily, body: s.customFontFamily, name: 'Fuente personalizada', tier: 'elite' };
    }
    return FONTS.find((f) => f.id === s.font) ?? FONTS[0]!;
  }, [s.font, s.customFontFamily]);
  const pattern = useMemo(() => (PATTERNS.find((p) => p.id === s.pattern) ?? PATTERNS[0])!, [s.pattern]);

  // Free layout helpers
  const freeElems: FreeLayoutElem[] = s.freeElems.length > 0 ? s.freeElems : defaultFreeElems(pal);
  const freeElemsBack: FreeLayoutElem[] = s.freeElemsBack.length > 0 ? s.freeElemsBack : defaultFreeElemsBack(pal);
  const nearestSnap = useCallback((x: number, y: number) => {
    let bestX: number = SNAP_POINTS[0]!.x;
    let bestY: number = SNAP_POINTS[0]!.y;
    let bestD = Infinity;
    for (const pt of SNAP_POINTS) {
      const d = (x - pt.x) ** 2 + (y - pt.y) ** 2;
      if (d < bestD) { bestD = d; bestX = pt.x; bestY = pt.y; }
    }
    return { x: bestX, y: bestY };
  }, []);
  const toggleFreeLayout = useCallback(() => {
    setS(prev => {
      const on = !prev.freeLayout;
      return { ...prev, freeLayout: on, freeElems: on && prev.freeElems.length === 0 ? defaultFreeElems(pal) : prev.freeElems };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pal.primary]);

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
    stampShape: s.stampShape,
    customGradDark: s.customGradDark,
    cardName: s.cardName, businessName: s.businessName,
    customLayout: s.customLayout,
    customElemBiz: s.customElemBiz, customElemCardName: s.customElemCardName,
    customElemPoints: s.customElemPoints, customElemMember: s.customElemMember,
    customElemQr: s.customElemQr, customElemLogo: s.customElemLogo,
    cardType: s.cardType,
    gradientStyle: s.gradientStyle,
    specialEffect: s.specialEffect,
    freeLayout: s.freeLayout,
    freeElems: s.freeElems,
    freeElemsBack: s.freeElemsBack,
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
  }, []);

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
    { id: 'colors',    label: 'Colores'    },
    { id: 'typography', label: 'Tipo'      },
    { id: 'elements',  label: 'Elementos'  },
  ];

  const cardSlug = card ? `sellio.app/c/${card.id.slice(0, 8)}` : null;

  return (
    <div className="sellio-builder" style={{ display: 'flex', flexDirection: 'column', background: 'var(--cb-bg)', color: 'var(--cb-fg)', borderRadius: exitHref ? 0 : 16, border: exitHref ? 'none' : '1px solid rgba(var(--cb-fg-rgb),0.07)', overflow: 'hidden', boxShadow: exitHref ? 'none' : '0 20px 60px rgba(0,0,0,0.5)', fontFamily: 'Space Grotesk,sans-serif', height: exitHref ? '100vh' : undefined }}>
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
      <div style={{ height: 48, background: 'var(--cb-panel)', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        {exitHref && (
          <>
            <Link href={exitHref} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--cb-muted)', textDecoration: 'none', transition: 'color 0.15s', flexShrink: 0 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cb-fg)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cb-muted)'; }}
            >
              <ChevronLeft size={14} /> Salir
            </Link>
            <div style={{ width: 1, height: 24, background: 'rgba(var(--cb-fg-rgb),0.12)' }} />
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#E8341A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 12, color: '#fff' }}>S</div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15 }}>Sellio<span style={{ color: '#E8341A' }}>.</span></span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(var(--cb-fg-rgb),0.12)' }} />
        <span style={{ fontSize: 12, color: 'var(--cb-muted)' }}>Card Builder</span>
        <div style={{ width: 1, height: 24, background: 'rgba(var(--cb-fg-rgb),0.12)' }} />
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
              color: saveStatus === 'saving' ? 'var(--cb-muted)' : saveStatus === 'saved' ? '#4ADE80' : saveStatus === 'error' ? '#F87171' : 'transparent',
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
        <div style={{ width: leftCollapsed ? 0 : leftWidth, minWidth: 0, background: 'var(--cb-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.16,1,0.3,1)', flexShrink: 0 }}>

          {/* ── Face switcher ── */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', minWidth: 260, flexShrink: 0 }}>
            {(s.freeLayout ? (['front', 'back', 'wallet'] as const) : (['front', 'back'] as const)).map(view => {
              const isActive = activeView === view;
              const label = view === 'front' ? 'Frente' : view === 'back' ? 'Reverso' : 'Wallet';
              const icon = view === 'front' ? '◻' : view === 'back' ? '◼' : '⬡';
              return (
                <button
                  key={view}
                  type="button"
                  disabled={!typeConfirmed}
                  onClick={() => {
                    setActiveView(view);
                    // En modo libre el overlay siempre es el frente — no volteamos
                    if (view !== 'wallet') setIsFlipped(view === 'back');
                  }}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: typeConfirmed ? 'pointer' : 'not-allowed',
                    border: `1.5px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.08)'}`,
                    background: isActive ? 'rgba(232,52,26,0.1)' : 'transparent',
                    color: isActive ? '#E8341A' : 'var(--cb-subtle)',
                    transition: 'all 0.15s',
                    opacity: typeConfirmed ? 1 : 0.35,
                  }}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>

          {/* ── Modo Libre toggle ── */}
          {activeView === 'front' && typeConfirmed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', minWidth: 260, flexShrink: 0, background: s.freeLayout ? 'rgba(167,139,250,0.04)' : 'transparent', transition: 'background 0.2s' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.freeLayout ? '#A78BFA' : '#5A5450', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Modo Libre</div>
                <div style={{ fontSize: 8, color: s.freeLayout ? 'rgba(167,139,250,0.6)' : 'var(--cb-dim)', marginTop: 1 }}>
                  {s.freeLayout ? 'Arrastra los elementos · snap a zonas' : 'Posiciona libremente los elementos'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleFreeLayout}
                style={{
                  width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', flexShrink: 0,
                  background: s.freeLayout ? '#A78BFA' : 'rgba(var(--cb-fg-rgb),0.1)',
                  border: `1.5px solid ${s.freeLayout ? '#A78BFA' : 'rgba(var(--cb-fg-rgb),0.12)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: s.freeLayout ? 19 : 2, width: 14, height: 14, borderRadius: '50%',
                  background: s.freeLayout ? '#fff' : 'rgba(var(--cb-fg-rgb),0.4)',
                  transition: 'left 0.2s, background 0.2s',
                }} />
              </button>
            </div>
          )}

          {/* Tab bar — only for front face */}
          {activeView === 'front' && (
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', minWidth: 260, flexShrink: 0 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{ flex: 1, padding: '10px 2px', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textAlign: 'center', cursor: 'pointer', color: activeTab === tab.id ? '#E8341A' : 'var(--cb-muted)', borderTop: 'none', borderRight: 'none', borderLeft: 'none', borderBottom: `2px solid ${activeTab === tab.id ? '#E8341A' : 'transparent'}`, background: 'none', textTransform: 'uppercase', transition: 'all 0.15s' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, position: 'relative' }}>
            {!typeConfirmed && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(var(--cb-bg-rgb),0.82)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>🎯</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--cb-fg)' }}>Elige el tipo primero</div>
                <div style={{ fontSize: 11, color: 'var(--cb-subtle)', lineHeight: 1.6 }}>Selecciona Sellos o Puntos en el panel derecho para desbloquear la personalización.</div>
              </div>
            )}

            {/* ══ REVERSO panel ══════════════════════════════════════ */}
            {activeView === 'back' && typeConfirmed && (() => {
              const currentIconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: '#E8341A' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cb-fg)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Reverso · {s.cardType === 'stamps' ? 'Sellos' : 'Puntos'}
                    </span>
                  </div>

                  {/* Display de sellos / puntos */}
                  <Section label={s.cardType === 'stamps' ? 'Display de sellos' : 'Display de puntos'}>
                    {POINTS_STYLES.filter(ps => s.cardType === 'stamps' ? (ps.id === 'stamps' || ps.id === 'stars') : (ps.id === 'number' || ps.id === 'bar' || ps.id === 'stars')).map((ps) => {
                      const locked = !canUse(tier, ps.tier);
                      return (
                        <div key={ps.id}
                          onClick={() => locked ? upgrade(ps.tier) : set('pointsStyle', ps.id)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 7, marginBottom: 5, cursor: locked ? 'not-allowed' : 'pointer', background: s.pointsStyle === ps.id ? 'var(--cb-input)' : 'transparent', border: `1px solid ${s.pointsStyle === ps.id ? 'rgba(var(--cb-fg-rgb),0.12)' : 'transparent'}`, opacity: locked ? 0.45 : 1 }}
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

                  {/* Fondo del reverso */}
                  <Section label="Fondo del reverso">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
                      {GRADIENT_STYLES.map(gs => {
                        const isActive = s.gradientStyle === gs.id;
                        const previewBg = buildGradientBg(pal.primary, '#080604', pal.bg, gs.id);
                        return (
                          <button key={gs.id} type="button" onClick={() => set('gradientStyle', gs.id)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <div style={{ width: '100%', aspectRatio: '1.5', borderRadius: 6, background: previewBg, border: `2px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.08)'}`, boxShadow: isActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none', transition: 'all 0.15s', position: 'relative' }}>
                              {isActive && <div style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#E8341A' }} />}
                            </div>
                            <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? '#E8341A' : 'var(--cb-subtle)', textAlign: 'center' }}>{gs.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  {/* Stamps controls */}
                  {s.cardType === 'stamps' && (
                    <>

                      {/* Forma de sellos */}
                      <Section label="Forma de sellos">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                          {STAMP_SHAPES.map((sh) => {
                            const locked = !canUse(tier, sh.tier);
                            const isActive = s.stampShape === sh.id;
                            const cellStyle = stampShapeStyle(sh.id, true, pal.primary, 22);
                            return (
                              <button key={sh.id} type="button"
                                onClick={() => locked ? upgrade(sh.tier) : set('stampShape', sh.id as StampShapeId)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: locked ? 'not-allowed' : 'pointer', padding: 0, opacity: locked ? 0.45 : 1, position: 'relative' }}
                              >
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: isActive ? 'rgba(232,52,26,0.1)' : 'rgba(var(--cb-fg-rgb),0.04)', border: `1.5px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                                  <div style={cellStyle} />
                                </div>
                                <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? '#E8341A' : 'var(--cb-subtle)', textAlign: 'center', lineHeight: 1.2 }}>{sh.label}</span>
                                {locked && <div style={{ position: 'absolute', top: 2, right: 2 }}><Lock size={7} color="#FFB347" /></div>}
                              </button>
                            );
                          })}
                        </div>
                      </Section>

                      <Section label="Diseño de sellos">
                        {(() => {
                          const currentScenario = STAMP_CATEGORIES.find(c => c.icons.some(i => i.id === s.stampIcon))?.id || 'generic';
                          return (
                            <>
                              <div style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: 11, color: 'var(--cb-muted)', marginBottom: 5, display: 'block', fontWeight: 500 }}>Escenario / Rubro</span>
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
                                  style={{ width: '100%', background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 7, padding: '8px 10px', fontSize: 12, color: 'var(--cb-fg)', outline: 'none' }}
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
                                        style={{ aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: locked ? 'not-allowed' : 'pointer', background: s.stampIcon === si.id ? 'rgba(232,52,26,0.15)' : 'transparent', border: `1px solid ${s.stampIcon === si.id ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.12)'}`, opacity: locked ? 0.45 : 1, position: 'relative' }}
                                        title={si.label}
                                      >
                                        <IconComp size={18} color={s.stampIcon === si.id ? '#E8341A' : '#A39D98'} />
                                        <span style={{ fontSize: 9, color: s.stampIcon === si.id ? '#E8341A' : 'var(--cb-muted)', fontWeight: 600 }}>{si.label}</span>
                                        {locked && <Lock size={8} style={{ position: 'absolute', top: 4, right: 4, color: '#FFB347' }} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

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
                                  (!iconSearch || ic.label.toLowerCase().includes(iconSearch.toLowerCase()) || ic.en.toLowerCase().includes(iconSearch.toLowerCase()) || ic.category.toLowerCase().includes(iconSearch.toLowerCase()))
                                );
                                return (
                                  <div style={{ marginTop: 8, background: '#0A0A0A', border: '1px solid rgba(var(--cb-fg-rgb),0.08)', borderRadius: 10, padding: 10 }}>
                                    <input
                                      type="text"
                                      placeholder="Buscar ícono..."
                                      value={iconSearch}
                                      onChange={e => setIconSearch(e.target.value)}
                                      style={{ width: '100%', background: 'var(--cb-panel-2)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--cb-fg)', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
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
                                            style={{ aspectRatio: '1', borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: locked ? 'not-allowed' : 'pointer', background: isActive ? 'rgba(232,52,26,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.08)'}`, opacity: locked ? 0.4 : 1, transition: 'all 0.12s', position: 'relative' }}
                                          >
                                            <IconComp size={16} color={isActive ? '#E8341A' : 'var(--cb-muted)'} />
                                            <span style={{ fontSize: 8, color: isActive ? '#E8341A' : 'var(--cb-subtle)', textAlign: 'center', lineHeight: 1.2 }}>{ic.label}</span>
                                            {locked && <Lock size={7} style={{ position: 'absolute', top: 2, right: 2, color: '#FFB347' }} />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}

                              {currentScenario === 'custom' && canUse(tier, 'elite') && (
                                <div style={{ marginTop: 10 }}>
                                  <label style={{ display: 'block', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1.5px dashed rgba(var(--cb-fg-rgb),0.18)', borderRadius: 10, background: 'var(--cb-input)', transition: 'border-color 0.15s' }}>
                                      {s.customStampUrl
                                        ? <img src={s.customStampUrl} alt="icono" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.06)', padding: 4 }} />
                                        : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(var(--cb-fg-rgb),0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <DownloadIcon size={16} color="var(--cb-subtle)" />
                                          </div>
                                      }
                                      <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cb-fg)', marginBottom: 2 }}>
                                          {s.customStampUrl ? 'Cambiar imagen' : 'Subir icono personalizado'}
                                        </div>
                                        <div style={{ fontSize: 9, color: 'var(--cb-muted)' }}>PNG, SVG o WebP · fondo transparente</div>
                                      </div>
                                    </div>
                                    <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" style={{ display: 'none' }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                          const result = ev.target?.result;
                                          if (typeof result === 'string') set('customStampUrl', result);
                                        };
                                        reader.readAsDataURL(file);
                                      }}
                                    />
                                  </label>
                                  {s.customStampUrl && (
                                    <button type="button" onClick={() => set('customStampUrl', undefined)}
                                      style={{ marginTop: 6, fontSize: 10, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                      Eliminar imagen
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </Section>

                    </>
                  )}

                  {/* Elementos del reverso — modo libre */}
                  {s.freeLayout && s.cardType === 'stamps' && (
                    <div style={{ marginTop: 16, borderTop: '1px solid rgba(var(--cb-fg-rgb),0.07)', paddingTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: '#E8341A', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Elementos del reverso</div>
                        <button type="button" onClick={() => setS(prev => ({ ...prev, freeElemsBack: defaultFreeElemsBack(pal) }))}
                          style={{ fontSize: 9, color: 'var(--cb-muted)', background: 'none', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', fontWeight: 600 }}>
                          Restablecer
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {freeElemsBack.map(el => {
                          const labelMap: Record<string, string> = { biz: 'Nombre del negocio', points: 'Grid de sellos' };
                          const updateElemsBack = (updater: (fe: FreeLayoutElem) => FreeLayoutElem) =>
                            setS(prev => ({ ...prev, freeElemsBack: (prev.freeElemsBack.length > 0 ? prev.freeElemsBack : defaultFreeElemsBack(pal)).map(fe => fe.id === el.id ? updater(fe) : fe) }));
                          return (
                            <div key={el.id} style={{ borderRadius: 8, background: 'rgba(var(--cb-fg-rgb),0.02)', border: '1px solid rgba(var(--cb-fg-rgb),0.05)', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px' }}>
                                <span style={{ fontSize: 10, fontWeight: 500, color: el.visible ? '#A39D98' : 'var(--cb-deep)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelMap[el.id] ?? el.id}</span>
                                {el.id === 'biz' && <span style={{ fontSize: 8, color: 'var(--cb-deep)', fontWeight: 600, minWidth: 22, textAlign: 'right' }}>{Math.round(el.fontSize)}px</span>}
                                <button type="button" onClick={() => updateElemsBack(fe => ({ ...fe, visible: !fe.visible }))}
                                  style={{ fontSize: 10, color: el.visible ? 'var(--cb-muted)' : 'var(--cb-deep)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', flexShrink: 0, lineHeight: 1 }}
                                  title={el.visible ? 'Ocultar' : 'Mostrar'}>
                                  {el.visible ? '●' : '○'}
                                </button>
                              </div>
                              {el.visible && el.id === 'biz' && (
                                <div style={{ padding: '0 10px 7px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 8, color: 'var(--cb-deep)', width: 22 }}>Tam.</span>
                                  <input type="range" min={7} max={22} step={1} value={Math.round(el.fontSize)}
                                    onChange={ev => updateElemsBack(fe => ({ ...fe, fontSize: Number(ev.target.value) }))}
                                    style={{ flex: 1, accentColor: '#E8341A', height: 3 }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Preview live hint */}
                  <div style={{ marginTop: 4, padding: '10px 12px', borderRadius: 8, background: 'rgba(232,52,26,0.05)', border: '1px solid rgba(232,52,26,0.12)' }}>
                    <div style={{ fontSize: 10, color: '#E8341A', fontWeight: 600, marginBottom: 3 }}>Vista en tiempo real</div>
                    <div style={{ fontSize: 10, color: 'var(--cb-muted)', lineHeight: 1.5 }}>{'Toca la tarjeta en el canvas para ver la animación de volteo, o haz clic en "Frente" para regresar.'}</div>
                  </div>

                  {currentIconComp && s.cardType === 'stamps' && (
                    <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--cb-bg)', border: '1px solid rgba(var(--cb-fg-rgb),0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {React.createElement(currentIconComp, { size: 18, color: pal.primary })}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cb-fg)' }}>{s.stampIcon}</div>
                        <div style={{ fontSize: 9, color: 'var(--cb-subtle)' }}>{pointsForReward} sellos · {rewardDescription || 'sin recompensa'}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ══ FRENTE panel (existing tabs) ══════════════════════ */}
            {activeView === 'front' && (<>

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
              const ALL_BUSINESS_TEMPLATES: Array<{ id: string; name: string; desc: string; icon: LucideIcon; preset: BizPreset; forType: CardType }> = [
                // ── STAMPS ────────────────────────────────────────────────
                { id: 'cafe',    name: 'Cafetería',      desc: 'Warm & clásico',      icon: Coffee,          forType: 'stamps',
                  preset: { template: 'classic', palette: 'amber',   font: 'syne',      businessName: 'Café Aroma',      cardName: 'Stamp Card',      pointsStyle: 'stamps', stampIcon: 'coffee'   } },
                { id: 'salon',   name: 'Salón de Belleza', desc: 'Editorial & elegante', icon: Scissors,      forType: 'stamps',
                  preset: { template: 'paper',   palette: 'teal',    font: 'playfair',  businessName: 'Studio Belle',    cardName: 'Beauty Pass',     pointsStyle: 'stamps', stampIcon: 'scissors' } },
                { id: 'gym',     name: 'Gym / Fitness',  desc: 'Dark & potente',       icon: Dumbbell,       forType: 'stamps',
                  preset: { template: 'carbon',  palette: 'coral',   font: 'bebas',     businessName: 'Power Gym',       cardName: 'Fitness Card',    pointsStyle: 'stamps', stampIcon: 'dumbbell' } },
                { id: 'bar',     name: 'Bar / Drinks',   desc: 'Neon & nocturno',      icon: Beer,           forType: 'stamps',
                  preset: { template: 'neon',    palette: 'violet',  font: 'syne',      businessName: 'Night Lounge',    cardName: 'Night Pass',      pointsStyle: 'stamps', stampIcon: 'cup-soda' } },
                { id: 'bakery',  name: 'Panadería',      desc: 'Minimal & artesanal',  icon: Croissant,      forType: 'stamps',
                  preset: { template: 'minimal', palette: 'amber',   font: 'outfit',    businessName: 'La Boulangerie',  cardName: 'Bread Lover',     pointsStyle: 'stamps', stampIcon: 'croissant'} },
                { id: 'food',    name: 'Restaurante',    desc: 'Bold & energético',    icon: UtensilsCrossed, forType: 'stamps',
                  preset: { template: 'bold',    palette: 'emerald', font: 'syne',      businessName: 'Sabor & Co.',     cardName: 'Foodie Card',     pointsStyle: 'stamps', stampIcon: 'utensils' } },
                // ── POINTS ────────────────────────────────────────────────
                { id: 'restaurant-pts', name: 'Restaurante',   desc: 'Luxury & gourmet',   icon: UtensilsCrossed, forType: 'points',
                  preset: { template: 'luxury',  palette: 'emerald', font: 'playfair',  businessName: 'Casa Gourmet',    cardName: 'Club Gastronómico', pointsStyle: 'number' } },
                { id: 'spa',     name: 'Spa & Wellness', desc: 'Marble & premium',     icon: Leaf,           forType: 'points',
                  preset: { template: 'marble',  palette: 'violet',  font: 'cormorant', businessName: 'Zen Spa',         cardName: 'Wellness Club',   pointsStyle: 'number' } },
                { id: 'hotel',   name: 'Hotel',          desc: 'Carbon & exclusivo',   icon: Home,           forType: 'points',
                  preset: { template: 'carbon',  palette: 'amber',   font: 'josefin',   businessName: 'Grand Hotel',     cardName: 'Loyalty Suite',   pointsStyle: 'number' } },
                { id: 'retail',  name: 'Retail / Moda',  desc: 'Gold & aspiracional',  icon: ShoppingBag,    forType: 'points',
                  preset: { template: 'gold',    palette: 'amber',   font: 'josefin',   businessName: 'Fashion Store',   cardName: 'VIP Member',      pointsStyle: 'number' } },
                { id: 'classes', name: 'Academia',       desc: 'Glass & moderno',      icon: BookOpen,       forType: 'points',
                  preset: { template: 'glass',   palette: 'indigo',  font: 'cabinet',   businessName: 'EduPlus',         cardName: 'Premium Pass',    pointsStyle: 'number' } },
                { id: 'tech',    name: 'Tecnología',     desc: 'Night & digital',      icon: Monitor,        forType: 'points',
                  preset: { template: 'night',   palette: 'indigo',  font: 'mono',      businessName: 'TechHub',         cardName: 'Tech Points',     pointsStyle: 'number' } },
                { id: 'music',   name: 'Música / Arte',  desc: 'Neon & creativo',      icon: Music,          forType: 'points',
                  preset: { template: 'neon',    palette: 'violet',  font: 'bebas',     businessName: 'Música Studio',   cardName: 'Artist Pass',     pointsStyle: 'number' } },
                { id: 'jewelry', name: 'Joyería',        desc: 'Marble & lujoso',      icon: Gem,            forType: 'points',
                  preset: { template: 'marble',  palette: 'amber',   font: 'cormorant', businessName: 'Joyería Élite',   cardName: 'Gold Member',     pointsStyle: 'number' } },
              ];
              const BUSINESS_TEMPLATES = ALL_BUSINESS_TEMPLATES.filter(t => t.forType === s.cardType);

              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* ══ PERSONALIZAR ══════════════════════════════ */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cb-fg)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Personalizar</span>
                    </div>

                    {(
                      <>
                        {/* Diseño grid */}
                        <div style={{ fontSize: 9, color: 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Diseño</div>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, 1fr)`, gap: 6, marginBottom: 16 }}>
                          {DESIGN_LAYOUTS.filter(t => t.id !== 'canvas').map((tpl) => {
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
                                  border: `2px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.07)'}`,
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
                                <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#E8341A' : 'var(--cb-subtle)', transition: 'color 0.15s' }}>{tpl.name}</span>
                              </button>
                            );
                          })}

                          {/* Custom tile — always last in 2-col grid */}
                          {(() => {
                            const isActive = s.template === 'custom';
                            const CustomCardComp = CARD_RENDERERS['custom'];
                            return (
                              <button
                                type="button"
                                onClick={() => set('template', 'custom')}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                <div style={{
                                  position: 'relative', width: colW, height: colH,
                                  borderRadius: 7, overflow: 'hidden',
                                  border: `2px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.07)'}`,
                                  boxShadow: isActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none',
                                  transition: 'all 0.15s',
                                }}>
                                  <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${colScale})`, pointerEvents: 'none' }}>
                                    <CustomCardComp s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />
                                  </div>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#E8341A' : 'var(--cb-subtle)', transition: 'color 0.15s' }}>Custom</span>
                              </button>
                            );
                          })()}
                        </div>

                        {/* Estilo de gradiente */}
                        {!s.freeLayout && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 9, color: 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Estilo de fondo</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
                              {GRADIENT_STYLES.map(gs => {
                                const isActive = s.gradientStyle === gs.id;
                                const palette = palettes.find(p => p.id === s.palette) ?? palettes[0]!;
                                const previewBg = buildGradientBg(palette.primary, palette.dark, palette.bg, gs.id);
                                return (
                                  <button key={gs.id} type="button" onClick={() => set('gradientStyle', gs.id)}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <div style={{ width: '100%', aspectRatio: '1.5', borderRadius: 6, background: previewBg, border: `2px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.08)'}`, boxShadow: isActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none', transition: 'all 0.15s', position: 'relative' }}>
                                      {isActive && <div style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#E8341A' }} />}
                                    </div>
                                    <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? '#E8341A' : 'var(--cb-subtle)', textAlign: 'center' }}>{gs.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Free layout element controls — visible when Modo Libre is active */}
                        {s.freeLayout && activeView === 'front' && (
                          <div style={{ marginBottom: 16, padding: '10px 0 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div style={{ fontSize: 9, color: '#A78BFA', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Elementos</div>
                              <button
                                type="button"
                                onClick={() => setS(prev => ({ ...prev, freeElems: defaultFreeElems(pal) }))}
                                style={{ fontSize: 9, color: 'var(--cb-muted)', background: 'none', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', fontWeight: 600 }}
                              >Restablecer</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {freeElems.map(el => {
                                const isStamps = s.cardType === 'stamps';
                                const labelMap: Record<string, string> = { biz: 'Nombre del negocio', cardname: 'Nombre de tarjeta', logo: 'Logo', points: isStamps ? 'Sellos' : 'Puntos', member: 'Miembro', qr: 'Código QR' };
                                const iconMap: Record<string, string> = { biz: 'B', cardname: 'T', logo: '◈', points: isStamps ? '⬡' : '#', member: 'M', qr: '⊞' };
                                const updateElems = (updater: (fe: FreeLayoutElem) => FreeLayoutElem) =>
                                  setS(prev => ({ ...prev, freeElems: (prev.freeElems.length > 0 ? prev.freeElems : defaultFreeElems(pal)).map(fe => fe.id === el.id ? updater(fe) : fe) }));
                                return (
                                  <div key={el.id} style={{ borderRadius: 8, background: 'rgba(var(--cb-fg-rgb),0.02)', border: '1px solid rgba(var(--cb-fg-rgb),0.05)', overflow: 'hidden' }}>
                                    {/* Row: icon + label + size + visibility + color */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px' }}>
                                      <div style={{ width: 20, height: 20, borderRadius: 4, background: el.visible ? 'rgba(167,139,250,0.1)' : 'rgba(var(--cb-fg-rgb),0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 9, color: el.visible ? '#A78BFA' : 'var(--cb-deep)', fontWeight: 700 }}>{iconMap[el.id] ?? 'T'}</span>
                                      </div>
                                      <span style={{ fontSize: 10, fontWeight: 500, color: el.visible ? '#A39D98' : 'var(--cb-deep)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelMap[el.id] ?? el.id}</span>
                                      {/* Font size badge */}
                                      <span style={{ fontSize: 8, color: 'var(--cb-deep)', fontWeight: 600, minWidth: 22, textAlign: 'right' }}>{Math.round(el.fontSize)}px</span>
                                      <button
                                        type="button"
                                        onClick={() => updateElems(fe => ({ ...fe, visible: !fe.visible }))}
                                        style={{ fontSize: 10, color: el.visible ? 'var(--cb-muted)' : 'var(--cb-deep)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', flexShrink: 0, lineHeight: 1 }}
                                        title={el.visible ? 'Ocultar' : 'Mostrar'}
                                      >{el.visible ? '●' : '○'}</button>
                                      {el.id !== 'logo' && el.id !== 'qr' && (
                                        <input
                                          type="color"
                                          value={el.color.startsWith('rgba') ? '#ffffff' : el.color}
                                          onChange={ev => updateElems(fe => ({ ...fe, color: ev.target.value }))}
                                          style={{ width: 22, height: 18, borderRadius: 4, border: '1px solid rgba(var(--cb-fg-rgb),0.12)', background: 'none', cursor: 'pointer', padding: 1, flexShrink: 0 }}
                                          title="Color"
                                        />
                                      )}
                                    </div>
                                    {/* Size slider */}
                                    {el.visible && (
                                      <div style={{ padding: '0 10px 7px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 8, color: 'var(--cb-deep)', width: 22 }}>Tam.</span>
                                        <input
                                          type="range"
                                          min={el.id === 'points' ? 20 : el.id === 'logo' ? 18 : 6}
                                          max={el.id === 'points' ? 80 : el.id === 'logo' ? 60 : 28}
                                          step={1}
                                          value={Math.round(el.fontSize)}
                                          onChange={ev => updateElems(fe => ({ ...fe, fontSize: Number(ev.target.value) }))}
                                          style={{ flex: 1, accentColor: '#A78BFA', height: 3 }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Custom-only controls */}
                        {s.template === 'custom' && (
                          <>
                            {/* Distribución */}
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 9, color: 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Distribución</div>
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
                                        border: `2px solid ${isDistActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.07)'}`,
                                        boxShadow: isDistActive ? '0 0 0 2px rgba(232,52,26,0.18)' : 'none',
                                        transition: 'all 0.15s',
                                      }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${distScale})`, pointerEvents: 'none' }}>
                                          <CustomCard s={previewState} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow />
                                        </div>
                                      </div>
                                      <span style={{ fontSize: 8, fontWeight: 600, color: isDistActive ? '#E8341A' : 'var(--cb-subtle)', transition: 'color 0.15s' }}>{label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Elementos */}
                            <div>
                              <div style={{ fontSize: 9, color: 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Elementos</div>
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
                                        border: `1.5px solid ${on ? 'rgba(232,52,26,0.3)' : 'rgba(var(--cb-fg-rgb),0.06)'}`,
                                        transition: 'all 0.15s',
                                      }}
                                    >
                                      <div style={{
                                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: on ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.04)',
                                        transition: 'background 0.15s',
                                      }}>
                                        <Icon size={12} color={on ? '#fff' : 'var(--cb-subtle)'} />
                                      </div>
                                      <span style={{ fontSize: 11, fontWeight: 500, color: on ? 'var(--cb-fg)' : 'var(--cb-subtle)', flex: 1, transition: 'color 0.15s' }}>{label}</span>
                                      <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: on ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.1)', transition: 'background 0.15s' }} />
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
                  <div style={{ height: 1, background: 'rgba(var(--cb-fg-rgb),0.07)', marginBottom: 24 }} />

                  {/* ══ PLANTILLAS ════════════════════════════════ */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cb-fg)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Plantillas</div>

                    {/* ── By business ── */}
                    <div style={{ fontSize: 9, color: 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Por negocio</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {BUSINESS_TEMPLATES.map(({ id, name, desc, icon: BizIcon, preset }) => {
                        const mergedState: BuilderState = { ...s, ...preset };
                        const TemplateComp = CARD_RENDERERS[preset.template ?? s.template] ?? ClassicCard;
                        const presetPalId = preset.palette ?? s.palette;
                        const presetPal = palettes.find(p => p.id === presetPalId) ?? palettes[0]!;
                        const presetFont = FONTS.find(f => f.id === (preset.font ?? s.font)) ?? FONTS[0]!;
                        const isActivePreset = s.template === preset.template && s.palette === preset.palette && s.font === preset.font;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setS(prev => ({ ...prev, ...preset }))}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                          >
                            <div style={{
                              position: 'relative', width: colW, height: colH,
                              borderRadius: 7, overflow: 'hidden',
                              border: `1.5px solid ${isActivePreset ? 'rgba(232,52,26,0.5)' : 'rgba(var(--cb-fg-rgb),0.07)'}`,
                              boxShadow: isActivePreset ? '0 0 0 2px rgba(232,52,26,0.12)' : 'none',
                              transition: 'border-color 0.15s, box-shadow 0.15s',
                            }}
                              onMouseEnter={(e) => { if (!isActivePreset) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232,52,26,0.25)'; }}
                              onMouseLeave={(e) => { if (!isActivePreset) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(var(--cb-fg-rgb),0.07)'; }}
                            >
                              <div style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${colScale})`, pointerEvents: 'none' }}>
                                <TemplateComp s={mergedState} pal={presetPal} font={presetFont} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />
                              </div>
                              {isActivePreset && (
                                <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#E8341A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: 8, color: '#fff', fontWeight: 800 }}>✓</span>
                                </div>
                              )}
                            </div>
                            <div style={{ paddingLeft: 2 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <BizIcon size={10} color={isActivePreset ? '#E8341A' : 'var(--cb-muted)'} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: isActivePreset ? '#E8341A' : '#A39D98', transition: 'color 0.15s' }}>{name}</span>
                              </div>
                              <div style={{ fontSize: 9, color: 'var(--cb-dim)', marginTop: 1 }}>{desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* Colors — gradientes + color libre + patrón + QR */}
            {activeTab === 'colors' && (
              <>
                <Section label="Combinación de colores">
                  {(() => {
                    const GRADIENT_PRESETS = [
                      { name: 'Fuego',     a: '#1A0806', b: '#E8341A' },
                      { name: 'Aurora',    a: '#0A1628', b: '#3B82F6' },
                      { name: 'Esmeralda',a: '#021208', b: '#1A8C5B' },
                      { name: 'Rosa',      a: '#1A0612', b: '#E84B8A' },
                      { name: 'Violeta',   a: '#09061A', b: '#9B3FE8' },
                      { name: 'Sunset',    a: '#6B0F1A', b: '#F5A623' },
                      { name: 'Teal',      a: '#021010', b: '#00A8A0' },
                      { name: 'Ámbar',     a: '#100B04', b: '#C17D3C' },
                    ];

                    const currentA = s.customGradDark ?? '#0D0B09';
                    const currentB = s.customPrimary ?? (s.customGradient?.primary ?? primaryColor);
                    const hasCombo = !!(s.customGradDark || s.customPrimary || s.customGradient);
                    const previewGrad = `linear-gradient(135deg,${currentA} 0%,${currentA}CC 50%,${currentB} 100%)`;

                    const applyCombo = (a: string, b: string) => {
                      const A = a.toUpperCase();
                      const B = b.toUpperCase();
                      const grad = `linear-gradient(135deg,${A} 0%,${A}CC 50%,${B} 100%)`;
                      setS(prev => ({
                        ...prev,
                        customPrimary: B,
                        customGradDark: A,
                        customGradient: { id: 'custom', primary: B, bg: grad, name: 'Custom' },
                      }));
                    };

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* Live preview bar */}
                        <div style={{ position: 'relative', height: 56, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', background: previewGrad }}>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', borderRadius: 4, padding: '2px 6px' }}>{currentA.toUpperCase()}</span>
                            {hasCombo
                              ? <button type="button" onClick={() => { set('customPrimary', undefined); set('customGradient', null); set('customGradDark', undefined); }} style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>Resetear</button>
                              : <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Vista previa</span>
                            }
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', borderRadius: 4, padding: '2px 6px' }}>{currentB.toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Preset combos */}
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--cb-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Combos sugeridos</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                            {GRADIENT_PRESETS.map((p) => {
                              const g = `linear-gradient(135deg,${p.a} 0%,${p.a}CC 50%,${p.b} 100%)`;
                              const isActive = currentA === p.a && currentB === p.b;
                              return (
                                <button key={p.name} type="button" onClick={() => applyCombo(p.a, p.b)} title={p.name}
                                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: `2px solid ${isActive ? '#fff' : 'transparent'}`, borderRadius: 10, padding: '2px', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                                  <div style={{ width: '100%', height: 32, borderRadius: 7, background: g, boxShadow: isActive ? '0 0 0 2px rgba(255,255,255,0.15)' : 'none' }} />
                                  <span style={{ fontSize: 8, color: isActive ? 'var(--cb-fg)' : 'var(--cb-muted)', fontWeight: isActive ? 700 : 400 }}>{p.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Manual pickers */}
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--cb-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Personalizar</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {/* Color A */}
                            <label style={{ cursor: 'pointer' }}>
                              <div style={{ fontSize: 10, color: 'var(--cb-muted)', marginBottom: 5, fontWeight: 500 }}>Inicio</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 8, padding: '7px 10px' }}>
                                <input type="color" value={currentA} onChange={e => applyCombo(e.target.value, currentB)}
                                  style={{ width: 22, height: 22, borderRadius: 5, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, color: 'var(--cb-fg)', fontFamily: 'monospace' }}>{currentA.toUpperCase()}</span>
                              </div>
                            </label>
                            {/* Color B */}
                            <label style={{ cursor: 'pointer' }}>
                              <div style={{ fontSize: 10, color: 'var(--cb-muted)', marginBottom: 5, fontWeight: 500 }}>Final</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 8, padding: '7px 10px' }}>
                                <input type="color" value={currentB} onChange={e => applyCombo(currentA, e.target.value)}
                                  style={{ width: 22, height: 22, borderRadius: 5, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, color: 'var(--cb-fg)', fontFamily: 'monospace' }}>{currentB.toUpperCase()}</span>
                              </div>
                            </label>
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </Section>

                <Section label="Patrón overlay" action={!canUse(tier, 'elite') ? <LockPill tier="elite" onUpgrade={() => upgrade('elite')} /> : undefined}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PATTERNS.map((p) => {
                      const locked = p.id !== 'none' && !canUse(tier, 'elite');
                      const isActive = s.pattern === p.id;
                      return (
                        <div key={p.id}
                          onClick={() => locked ? upgrade('elite') : set('pattern', p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, cursor: locked ? 'not-allowed' : 'pointer', background: isActive ? 'var(--cb-input)' : 'transparent', border: `1px solid ${isActive ? 'rgba(var(--cb-fg-rgb),0.12)' : 'transparent'}`, opacity: locked ? 0.4 : 1, transition: 'all 0.12s' }}
                        >
                          <div style={{ width: 24, height: 24, borderRadius: 5, background: '#0A0A0A', backgroundImage: p.css || undefined, backgroundSize: p.size || undefined, flexShrink: 0, border: '1px solid rgba(var(--cb-fg-rgb),0.12)' }} />
                          <span style={{ fontSize: 12, color: isActive ? 'var(--cb-fg)' : '#A39D98' }}>{p.name}</span>
                          {isActive && <span style={{ marginLeft: 'auto', color: '#E8341A', fontSize: 12 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </Section>

                <Section label="Estilo del QR" action={!canUse(tier, 'elite') ? <LockPill tier="elite" onUpgrade={() => upgrade('elite')} /> : undefined}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(['simple', 'colored', 'logo'] as const).map((qs) => {
                      const locked = qs === 'logo' && !canUse(tier, 'elite');
                      const isActive = s.qrStyle === qs;
                      return (
                        <div key={qs}
                          onClick={() => locked ? upgrade('elite') : set('qrStyle', qs)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, cursor: locked ? 'not-allowed' : 'pointer', background: isActive ? 'var(--cb-input)' : 'transparent', border: `1px solid ${isActive ? 'rgba(var(--cb-fg-rgb),0.12)' : 'transparent'}`, opacity: locked ? 0.4 : 1, transition: 'all 0.12s' }}
                        >
                          <QR size={28} color={qs === 'colored' ? pal.primary : qs === 'logo' ? '#A78BFA' : 'rgba(255,255,255,0.6)'} />
                          <span style={{ fontSize: 12, color: isActive ? 'var(--cb-fg)' : '#A39D98' }}>{qs === 'simple' ? 'Simple (blanco)' : qs === 'colored' ? 'A color' : 'Con logo'}</span>
                          {locked && <Lock size={9} style={{ marginLeft: 'auto', color: '#A78BFA' }} />}
                          {isActive && !locked && <span style={{ marginLeft: 'auto', color: '#E8341A', fontSize: 12 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </>
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
                    ? { fontFamily: `'Syne', sans-serif`,              fontWeight: 800, fontSize: 26, color: 'var(--cb-fg)', letterSpacing: '-0.02em', lineHeight: 1 }
                    : f.id === 'outfit'
                    ? { fontFamily: `'Outfit', sans-serif`,             fontWeight: 800, fontSize: 24, color: 'var(--cb-fg)', lineHeight: 1 }
                    : f.id === 'raleway'
                    ? { fontFamily: `'Raleway', sans-serif`,            fontWeight: 800, fontSize: 24, color: 'var(--cb-fg)', letterSpacing: '0.04em', lineHeight: 1 }
                    : f.id === 'montserrat'
                    ? { fontFamily: `'Montserrat', sans-serif`,         fontWeight: 800, fontSize: 22, color: 'var(--cb-fg)', letterSpacing: '-0.01em', lineHeight: 1 }
                    : f.id === 'poppins'
                    ? { fontFamily: `'Poppins', sans-serif`,            fontWeight: 700, fontSize: 23, color: 'var(--cb-fg)', lineHeight: 1 }
                    : f.id === 'playfair'
                    ? { fontFamily: `'Playfair Display', serif`,        fontWeight: 700, fontSize: 22, color: 'var(--cb-fg)', lineHeight: 1.1 }
                    : f.id === 'cormorant'
                    ? { fontFamily: `'Cormorant Garamond', serif`,      fontWeight: 600, fontSize: 26, color: 'var(--cb-fg)', fontStyle: 'italic', lineHeight: 1.1 }
                    : f.id === 'cabinet'
                    ? { fontFamily: `'Plus Jakarta Sans', sans-serif`,  fontWeight: 800, fontSize: 22, color: 'var(--cb-fg)', lineHeight: 1 }
                    : f.id === 'bebas'
                    ? { fontFamily: `'Bebas Neue', sans-serif`,         fontWeight: 400, fontSize: 32, color: 'var(--cb-fg)', letterSpacing: '0.08em', lineHeight: 1 }
                    : f.id === 'fraunces'
                    ? { fontFamily: `'Fraunces', serif`,                fontWeight: 900, fontSize: 26, color: 'var(--cb-fg)', fontStyle: 'italic', lineHeight: 1 }
                    : f.id === 'josefin'
                    ? { fontFamily: `'Josefin Sans', sans-serif`,       fontWeight: 700, fontSize: 20, color: 'var(--cb-fg)', letterSpacing: '0.12em', textTransform: 'uppercase' }
                    : f.id === 'cinzel'
                    ? { fontFamily: `'Cinzel', serif`,                  fontWeight: 700, fontSize: 20, color: 'var(--cb-fg)', letterSpacing: '0.1em' }
                    : { fontFamily: `'Space Grotesk', monospace`,       fontWeight: 500, fontSize: 18, color: 'var(--cb-fg)', letterSpacing: '0.04em' };

                  const bodyStyle: React.CSSProperties = {
                    fontFamily: `'${f.body}', sans-serif`,
                    fontSize: 11,
                    color: 'var(--cb-muted)',
                    marginTop: 4,
                    fontStyle: f.id === 'cormorant' ? 'normal' : undefined,
                    letterSpacing: f.id === 'josefin' ? '0.04em' : undefined,
                  };

                  return (
                    <div key={f.id}
                      onClick={() => locked ? upgrade(f.tier) : set('font', f.id)}
                      style={{ padding: 12, borderRadius: 8, marginBottom: 6, cursor: locked ? 'not-allowed' : 'pointer', border: `1.5px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.07)'}`, background: isActive ? 'var(--cb-input)' : 'transparent', opacity: locked ? 0.45 : 1, transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: isActive ? '#E8341A' : 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.name}</span>
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
                    <div style={{ fontSize: 11, color: 'var(--cb-muted)', lineHeight: 1.5 }}>
                      Pega la URL de importación de Google Fonts o un archivo <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>.woff2</code>.
                    </div>
                    <label style={{ display: 'block' }}>
                      <div style={{ fontSize: 11, color: 'var(--cb-muted)', marginBottom: 5, fontWeight: 500 }}>URL de la fuente</div>
                      <input
                        type="url"
                        value={s.customFontUrl ?? ''}
                        onChange={(e) => set('customFontUrl', e.target.value || undefined)}
                        placeholder="https://fonts.googleapis.com/css2?family=..."
                        style={{ width: '100%', background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: 'var(--cb-fg)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ display: 'block' }}>
                      <div style={{ fontSize: 11, color: 'var(--cb-muted)', marginBottom: 5, fontWeight: 500 }}>Nombre CSS de la familia</div>
                      <input
                        type="text"
                        value={s.customFontFamily ?? ''}
                        onChange={(e) => set('customFontFamily', e.target.value || undefined)}
                        placeholder="Ej: Roboto, Pacifico, MiFuente"
                        style={{ width: '100%', background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 7, padding: '8px 10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: 'var(--cb-fg)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </label>
                    {s.customFontFamily && (
                      <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(var(--cb-fg-rgb),0.1)', background: '#0A0907' }}>
                        <div style={{ fontSize: 9, color: 'var(--cb-subtle)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Preview</div>
                        <div style={{ fontFamily: `'${s.customFontFamily}', sans-serif`, fontSize: 26, fontWeight: 700, color: 'var(--cb-fg)', lineHeight: 1 }}>Aa Bb 123</div>
                        <div style={{ fontFamily: `'${s.customFontFamily}', sans-serif`, fontSize: 11, color: 'var(--cb-muted)', marginTop: 4 }}>{s.businessName || 'Tu Negocio'}</div>
                      </div>
                    )}
                    {s.customFontFamily && (
                      <button
                        type="button"
                        onClick={() => { set('customFontUrl', undefined); set('customFontFamily', undefined); }}
                        style={{ fontSize: 10, color: 'var(--cb-muted)', background: 'none', border: '1px solid rgba(var(--cb-fg-rgb),0.08)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontWeight: 600 }}
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
                <Section label="Elementos adicionales">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12 }}>Badge de nivel</span>
                    <Toggle on={s.showBadge} onChange={() => set('showBadge', !s.showBadge)} />
                  </div>
                  {s.showBadge && (
                    <select
                      value={s.badgeText}
                      onChange={(e) => set('badgeText', e.target.value)}
                      style={{ width: '100%', background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 7, padding: '8px 10px', fontSize: 12, color: 'var(--cb-fg)', marginBottom: 10, fontFamily: 'Space Grotesk,sans-serif' }}
                    >
                      {BADGE_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12 }}>Número de miembro</span>
                    <Toggle on={s.showMemberNum} onChange={() => set('showMemberNum', !s.showMemberNum)} />
                  </div>
                </Section>

                <Section label="Efectos especiales">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                    {SPECIAL_EFFECTS.map(ef => {
                      const isActive = s.specialEffect === ef.id;
                      return (
                        <button key={ef.id} type="button" onClick={() => set('specialEffect', ef.id)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <div style={{
                            width: '100%', aspectRatio: '1.65', borderRadius: 8, overflow: 'hidden', position: 'relative',
                            background: pal.bg,
                            border: `2px solid ${isActive ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.08)'}`,
                            boxShadow: ef.id === 'glow' ? `0 0 10px ${pal.primary}99, 0 0 20px ${pal.primary}55` : isActive ? '0 0 0 2px rgba(232,52,26,0.2)' : 'none',
                            transition: 'all 0.15s',
                          }}>
                            {ef.id === 'foil' && (
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 15%, rgba(255,0,120,0.45) 28%, rgba(255,210,0,0.45) 38%, rgba(0,255,140,0.45) 48%, rgba(0,170,255,0.45) 58%, rgba(170,0,255,0.45) 68%, transparent 82%)', backgroundSize: '300% 300%', animation: 'foilShift 4s ease-in-out infinite', mixBlendMode: 'overlay' }} />
                            )}
                            {ef.id === 'emboss' && (
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(0,0,0,0.14) 100%)', boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.3)' }} />
                            )}
                            {isActive && (
                              <div style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: '#E8341A' }} />
                            )}
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#E8341A' : 'var(--cb-subtle)' }}>{ef.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {/* Dev-only tier switcher */}
                <Section label="Simular tier">
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['basic', 'elite'] as Tier[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(t)}
                        style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${tier === t ? '#E8341A' : 'rgba(var(--cb-fg-rgb),0.12)'}`, background: tier === t ? '#E8341A' : 'transparent', fontSize: 10, cursor: 'pointer', color: 'var(--cb-fg)', fontFamily: 'Space Grotesk,sans-serif', fontWeight: 600, textTransform: 'capitalize' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Section>
              </>
            )}
            {/* closes activeView === 'front' wrapper */}
            </>)}
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
            borderRight: '1px solid rgba(var(--cb-fg-rgb),0.07)',
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
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 2, height: 24, background: 'rgba(var(--cb-fg-rgb),0.2)', borderRadius: 2 }} />
        </div>

        {/* ── Canvas ── */}
        <div
          style={{ background: 'var(--cb-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', pointerEvents: isDragging ? 'none' : 'auto' }}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Dot grid background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--cb-deep) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4, pointerEvents: 'none' }} />
          {/* Ambient glow */}
          <div style={{ position: 'absolute', width: 320, height: 160, borderRadius: '50%', background: `radial-gradient(ellipse, ${pal.primary}18 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s' }} />

          {/* Panel collapse toggle */}
          <button
            type="button"
            onClick={() => setLeftCollapsed((v) => !v)}
            title={leftCollapsed ? 'Mostrar panel' : 'Ocultar panel'}
            style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, width: 24, height: 24, borderRadius: 6, background: 'var(--cb-panel-2)', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--cb-muted)', fontSize: 12, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cb-fg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--cb-fg-rgb),0.25)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cb-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--cb-fg-rgb),0.1)'; }}
          >
            {leftCollapsed ? '›' : '‹'}
          </button>

          {/* ── Main canvas row: card left, wallet right ── */}
          <div
            style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 52, padding: '48px 40px 100px', width: '100%', overflowY: 'auto' }}
          >

            {/* Left: two-view card — hidden when showing wallet view in free layout */}
            {activeView !== 'wallet' && (() => {
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
                        onClick={() => {
                          if (s.freeLayout && isFlipped) { setIsFlipped(false); setActiveView('front'); return; }
                          if (!s.freeLayout) { setIsFlipped(v => { setActiveView(!v ? 'back' : 'front'); return !v; }); }
                        }}
                        style={{
                          width: 380, height: 230,
                          position: 'relative',
                          transform: s.freeLayout
                            ? `scale(${FREE_SCALE})`
                            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                          transition: s.freeLayout ? 'transform 0.3s ease' : 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)',
                          animation: (cardAnimating || s.freeLayout) ? 'none' : 'cardFloat 5s ease-in-out infinite',
                          filter: `drop-shadow(0 28px 52px ${pal.primary}38)`,
                          willChange: 'transform',
                          cursor: s.freeLayout ? 'default' : 'pointer',
                        }}>

                        {/* ── FRONT: selected template — clean when cardType=stamps (stamps shown on back) ── */}
                        <div style={{ ...faceStyle(!isFlipped), cursor: s.freeLayout ? 'default' : 'pointer' }}
                          onClick={s.freeLayout ? (e) => e.stopPropagation() : undefined}>
                          {s.freeLayout ? (
                            /* Free layout mode: template bg + draggable overlay elements */
                            <div style={{ position: 'relative', width: 380, height: 230 }}>
                              {(() => { const BgCard = CARD_RENDERERS[s.template] ?? ClassicCard; return <BgCard s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow bgOnly />; })()}
                              {/* Snap point indicators — subtle dots visible during any drag */}
                              {freeDragRef.current && SNAP_POINTS.map(pt => (
                                <div key={pt.id} style={{ position: 'absolute', left: pt.x, top: pt.y, width: 4, height: 4, borderRadius: '50%', background: 'rgba(167,139,250,0.35)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
                              ))}
                              {/* Draggable elements — hide points handle on stamps front */}
                              {freeElems.filter(el => el.visible && !(el.id === 'points' && s.cardType === 'stamps')).map(el => {
                                const isLive = freeLivePos?.id === el.id;
                                const isEditing = freeEditingId === el.id;
                                const ex = isLive ? freeLivePos!.x : el.x;
                                const ey = isLive ? freeLivePos!.y : el.y;
                                const isText = el.id === 'biz' || el.id === 'cardname';
                                const labelMap: Record<string, string> = { biz: 'Negocio', cardname: 'Tarjeta', logo: 'Logo', points: 'Pts', member: 'Miembro', qr: 'QR' };
                                // Compute approximate visual bounds so the selection border matches the element size
                                const getElemBounds = (): { w: number; h: number } => {
                                  if (el.id === 'logo' || el.id === 'qr') return { w: el.fontSize, h: el.fontSize };
                                  if (el.id === 'biz') { const t = s.businessName || 'Tu Negocio'; return { w: Math.max(40, t.length * el.fontSize * 0.62), h: el.fontSize * 1.3 }; }
                                  if (el.id === 'cardname') { const t = s.cardName || 'Member Card'; return { w: Math.max(30, t.length * el.fontSize * 0.52), h: el.fontSize * 1.3 }; }
                                  if (el.id === 'member') return { w: 'Ana García'.length * el.fontSize * 0.55, h: el.fontSize * 1.3 };
                                  if (el.id === 'points') {
                                    if (s.cardType === 'stamps') { const c = Math.round(el.fontSize * 0.38); const g = c * 0.3; return { w: 4 * c + 3 * g, h: 2 * c + g }; }
                                    if (s.pointsStyle === 'bar') return { w: el.fontSize * 2.4, h: el.fontSize * 1.5 };
                                    if (s.pointsStyle === 'stars') return { w: el.fontSize * 5 * 0.55 + 4 * el.fontSize * 0.12, h: el.fontSize * 0.6 };
                                    return { w: el.fontSize * 1.6, h: el.fontSize * 1.4 };
                                  }
                                  return { w: 30, h: 20 };
                                };
                                const bounds = getElemBounds();
                                return (
                                  <div
                                    key={el.id}
                                    onPointerDown={(e) => {
                                      if (isEditing) return;
                                      e.stopPropagation();
                                      e.currentTarget.setPointerCapture(e.pointerId);
                                      freeDragRef.current = { elemId: el.id, startPtrX: e.clientX, startPtrY: e.clientY, startElemX: el.x, startElemY: el.y, hasMoved: false };
                                      setFreeLivePos({ id: el.id, x: el.x, y: el.y });
                                    }}
                                    onPointerMove={(e) => {
                                      if (!freeDragRef.current || freeDragRef.current.elemId !== el.id) return;
                                      const dx = Math.abs(e.clientX - freeDragRef.current.startPtrX);
                                      const dy = Math.abs(e.clientY - freeDragRef.current.startPtrY);
                                      if (dx > 4 || dy > 4) freeDragRef.current.hasMoved = true;
                                      const nx = Math.max(0, Math.min(370, freeDragRef.current.startElemX + (e.clientX - freeDragRef.current.startPtrX) / FREE_SCALE));
                                      const ny = Math.max(0, Math.min(220, freeDragRef.current.startElemY + (e.clientY - freeDragRef.current.startPtrY) / FREE_SCALE));
                                      setFreeLivePos({ id: el.id, x: nx, y: ny });
                                    }}
                                    onPointerUp={(e) => {
                                      if (!freeDragRef.current || freeDragRef.current.elemId !== el.id) return;
                                      if (!freeDragRef.current.hasMoved && isText) {
                                        freeDragRef.current = null;
                                        setFreeLivePos(null);
                                        setFreeEditingValue(el.id === 'biz' ? (s.businessName || '') : (s.cardName || ''));
                                        setFreeEditingId(el.id);
                                        return;
                                      }
                                      const nx = Math.max(0, Math.min(370, freeDragRef.current.startElemX + (e.clientX - freeDragRef.current.startPtrX) / FREE_SCALE));
                                      const ny = Math.max(0, Math.min(220, freeDragRef.current.startElemY + (e.clientY - freeDragRef.current.startPtrY) / FREE_SCALE));
                                      const snapped = nearestSnap(nx, ny);
                                      freeDragRef.current = null;
                                      setFreeLivePos(null);
                                      setS(prev => ({ ...prev, freeElems: (prev.freeElems.length > 0 ? prev.freeElems : defaultFreeElems(pal)).map(fe => fe.id === el.id ? { ...fe, x: snapped.x, y: snapped.y } : fe) }));
                                    }}
                                    style={{
                                      position: 'absolute', left: ex, top: ey,
                                      width: isEditing ? undefined : bounds.w,
                                      height: isEditing ? undefined : bounds.h,
                                      border: isEditing ? 'none' : isLive ? '1.5px solid #A78BFA' : isText ? '1.5px dashed rgba(167,139,250,0.3)' : '1.5px dashed rgba(167,139,250,0.18)',
                                      borderRadius: 5,
                                      cursor: isEditing ? 'text' : isText ? 'pointer' : 'grab',
                                      background: isEditing ? 'transparent' : isLive ? 'rgba(167,139,250,0.08)' : 'transparent',
                                      zIndex: isEditing ? 40 : isLive ? 30 : 20,
                                      transition: isLive ? 'none' : 'border-color 0.15s, background 0.15s',
                                      userSelect: 'none',
                                      transform: 'translate(-2px, -2px)',
                                      boxSizing: 'border-box',
                                      overflow: 'visible',
                                    }}
                                  >
                                    {isEditing ? (
                                      <input
                                        autoFocus
                                        value={freeEditingValue}
                                        onChange={e => setFreeEditingValue(e.target.value)}
                                        onBlur={() => {
                                          set(el.id === 'biz' ? 'businessName' : 'cardName', freeEditingValue);
                                          setFreeEditingId(null);
                                        }}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur();
                                        }}
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                          background: 'rgba(0,0,0,0.7)',
                                          border: '1.5px solid #A78BFA',
                                          borderRadius: 5,
                                          color: '#fff',
                                          fontSize: Math.max(8, el.fontSize * 0.6),
                                          fontWeight: el.fontWeight,
                                          fontFamily: `'${font.display}',sans-serif`,
                                          outline: 'none',
                                          padding: '3px 6px',
                                          minWidth: 80,
                                          maxWidth: 200,
                                          backdropFilter: 'blur(8px)',
                                        }}
                                      />
                                    ) : (
                                      <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 7, fontWeight: 700, color: isLive ? '#A78BFA' : isText ? 'rgba(167,139,250,0.65)' : 'rgba(167,139,250,0.45)', letterSpacing: '0.05em', pointerEvents: 'none', whiteSpace: 'nowrap', lineHeight: 1 }}>
                                        {isText ? '✎ ' : ''}{labelMap[el.id] ?? el.id}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              {/* Actual content rendered at live positions */}
                              <FreeLayoutOverlay
                                s={s} pal={pal} font={font} pattern={pattern} W={380} H={230}
                                hidePoints={s.cardType === 'stamps'}
                                elemsOverride={freeElems.map(fe => freeLivePos?.id === fe.id ? { ...fe, x: freeLivePos.x, y: freeLivePos.y } : fe)}
                              />
                            </div>
                          ) : (
                            (() => {
                              const FrontCard = CARD_RENDERERS[s.template] ?? ClassicCard;
                              return (
                                <div style={{ position: 'relative', ...effectWrapperStyle(s.specialEffect, pal.primary) }}>
                                  <FrontCard s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />
                                  <SpecialEffectOverlay effect={s.specialEffect} primary={pal.primary} />
                                </div>
                              );
                            })()
                          )}
                        </div>

                        {/* ── BACK: points → template renderer | stamps → stamp grid over template bg ── */}
                        <div style={faceStyle(isFlipped)}>
                          {(() => {
                            const backPal = { ...pal, bg: backFaceBg };
                            return s.cardType === 'points' ? (
                            (() => {
                              const BackCard = CARD_RENDERERS[s.template] ?? ClassicCard;
                              return (
                                <div style={{ position: 'relative', ...effectWrapperStyle(s.specialEffect, pal.primary) }}>
                                  <BackCard s={s} pal={backPal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={false} />
                                  <SpecialEffectOverlay effect={s.specialEffect} primary={pal.primary} />
                                </div>
                              );
                            })()
                          ) : (
                            (() => {
                              const IconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon ?? STAMP_ICONS_EXTENDED[0]!.icon;
                              const totalStamps = Math.min(pointsForReward, 20);
                              const filled = Math.round(totalStamps * 0.7);
                              let cols = Math.min(totalStamps, 5);
                              let minWaste = cols * Math.ceil(totalStamps / cols) - totalStamps;
                              for (let c = Math.min(totalStamps, 7); c >= 2; c--) {
                                const w = c * Math.ceil(totalStamps / c) - totalStamps;
                                if (w < minWaste) { minWaste = w; cols = c; }
                                if (w === 0) break;
                              }
                              const rows = Math.ceil(totalStamps / cols);
                              const iconSize = cols <= 3 ? 20 : cols <= 4 ? 17 : cols <= 5 ? 14 : cols <= 6 ? 12 : 10;
                              // Back face element positions (free layout or defaults)
                              const backBizElem = freeElemsBack.find(e => e.id === 'biz') ?? { x: 18, y: 14, fontSize: 10, color: pal.primary, fontWeight: 800, visible: true, id: 'biz' as const };
                              const backGridElem = freeElemsBack.find(e => e.id === 'points') ?? { x: 18, y: 50, fontSize: 44, color: pal.primary, fontWeight: 900, visible: true, id: 'points' as const };
                              const cellPx = cols <= 3 ? 64 : cols <= 4 ? 54 : cols <= 5 ? 46 : cols <= 6 ? 38 : 32;
                              return (
                                <div style={{ position: 'relative', width: 380, height: 230, ...effectWrapperStyle(s.specialEffect, pal.primary) }}>
                                  <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: backFaceBg }}>
                                    {pattern.id !== 'none' && <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern.css, backgroundSize: pattern.size || undefined, borderRadius: 20 }} />}
                                  </div>
                                  {/* Business name — absolutely positioned */}
                                  {backBizElem.visible && (() => {
                                    const liveBiz = freeLivePosBack?.id === 'biz';
                                    const bx = liveBiz ? freeLivePosBack!.x : backBizElem.x;
                                    const by = liveBiz ? freeLivePosBack!.y : backBizElem.y;
                                    return (
                                      <div style={{ position: 'absolute', left: bx, top: by }}>
                                        <div style={{ fontSize: backBizElem.fontSize, fontWeight: backBizElem.fontWeight, fontFamily: `'${font.display}',sans-serif`, color: backBizElem.color, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{s.businessName || 'Tu Negocio'}</div>
                                        <div style={{ fontSize: Math.round(backBizElem.fontSize * 0.7), color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Stamp Card</div>
                                      </div>
                                    );
                                  })()}
                                  {/* Stamp grid — absolutely positioned */}
                                  {backGridElem.visible && (() => {
                                    const liveGrid = freeLivePosBack?.id === 'points';
                                    const gx = liveGrid ? freeLivePosBack!.x : backGridElem.x;
                                    const gy = liveGrid ? freeLivePosBack!.y : backGridElem.y;
                                    return (
                                      <div style={{ position: 'absolute', left: gx, top: gy, display: 'flex', flexDirection: 'column', gap: s.stampShape === 'pill' ? 3 : 5 }}>
                                        {Array.from({ length: rows }, (_, r) => (
                                          <div key={r} style={{ display: 'flex', gap: s.stampShape === 'pill' ? 4 : 5 }}>
                                            {Array.from({ length: cols }, (_, c) => {
                                              const i = r * cols + c;
                                              if (i >= totalStamps) return <div key={c} style={{ width: s.stampShape === 'pill' ? cellPx * 1.5 : cellPx }} />;
                                              const isFilled = i < filled;
                                              const shapeStyle = stampShapeStyle(s.stampShape, isFilled, pal.primary, cellPx);
                                              return (
                                                <div key={c} style={shapeStyle}>
                                                  {s.pointsStyle === 'stars'
                                                    ? <span style={{ fontSize: iconSize, color: isFilled ? '#fff' : 'rgba(255,255,255,0.2)', transform: s.stampShape === 'diamond' ? 'rotate(-45deg)' : undefined, display: 'inline-block', lineHeight: 1 }}>★</span>
                                                    : <IconComp size={iconSize} color={isFilled ? '#fff' : 'rgba(255,255,255,0.22)'} style={s.stampShape === 'diamond' ? { transform: 'rotate(-45deg)' } as React.CSSProperties : undefined} />
                                                  }
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                  {/* Fixed footer */}
                                  <div style={{ position: 'absolute', bottom: 12, left: 18, right: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.3)', fontFamily: `'${font.display}',sans-serif` }}>
                                      {filled}/{totalStamps} · <span style={{ color: pal.primary, fontWeight: 700 }}>{totalStamps - filled} para la recompensa</span>
                                    </div>
                                    <div style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.12em' }}>SELLIO</div>
                                  </div>
                                  {/* Drag handles for back elements (free layout mode only) */}
                                  {s.freeLayout && freeElemsBack.filter(e => e.visible).map(el => {
                                    const isLive = freeLivePosBack?.id === el.id;
                                    const ex = isLive ? freeLivePosBack!.x : el.x;
                                    const ey = isLive ? freeLivePosBack!.y : el.y;
                                    const labelBack: Record<string, string> = { biz: 'Negocio', points: 'Sellos' };
                                    const backBounds = el.id === 'biz'
                                      ? { w: Math.max(40, (s.businessName || 'Tu Negocio').length * el.fontSize * 0.62), h: el.fontSize * 2.2 }
                                      : { w: cols * (cellPx + 5), h: rows * (cellPx + 5) };
                                    return (
                                      <div
                                        key={el.id}
                                        onPointerDown={(e) => {
                                          e.stopPropagation();
                                          e.currentTarget.setPointerCapture(e.pointerId);
                                          freeDragRefBack.current = { elemId: el.id, startPtrX: e.clientX, startPtrY: e.clientY, startElemX: el.x, startElemY: el.y };
                                          setFreeLivePosBack({ id: el.id, x: el.x, y: el.y });
                                        }}
                                        onPointerMove={(e) => {
                                          if (!freeDragRefBack.current || freeDragRefBack.current.elemId !== el.id) return;
                                          const nx = Math.max(0, Math.min(360, freeDragRefBack.current.startElemX + (e.clientX - freeDragRefBack.current.startPtrX) / FREE_SCALE));
                                          const ny = Math.max(0, Math.min(210, freeDragRefBack.current.startElemY + (e.clientY - freeDragRefBack.current.startPtrY) / FREE_SCALE));
                                          setFreeLivePosBack({ id: el.id, x: nx, y: ny });
                                        }}
                                        onPointerUp={(e) => {
                                          if (!freeDragRefBack.current || freeDragRefBack.current.elemId !== el.id) return;
                                          const nx = Math.max(0, Math.min(360, freeDragRefBack.current.startElemX + (e.clientX - freeDragRefBack.current.startPtrX) / FREE_SCALE));
                                          const ny = Math.max(0, Math.min(210, freeDragRefBack.current.startElemY + (e.clientY - freeDragRefBack.current.startPtrY) / FREE_SCALE));
                                          freeDragRefBack.current = null;
                                          setFreeLivePosBack(null);
                                          setS(prev => ({ ...prev, freeElemsBack: (prev.freeElemsBack.length > 0 ? prev.freeElemsBack : defaultFreeElemsBack(pal)).map(fe => fe.id === el.id ? { ...fe, x: nx, y: ny } : fe) }));
                                        }}
                                        style={{
                                          position: 'absolute', left: ex, top: ey,
                                          width: backBounds.w, height: backBounds.h,
                                          border: isLive ? '1.5px solid #E8341A' : '1.5px dashed rgba(232,52,26,0.35)',
                                          borderRadius: 5, cursor: 'grab',
                                          background: isLive ? 'rgba(232,52,26,0.08)' : 'transparent',
                                          zIndex: isLive ? 30 : 20,
                                          transition: isLive ? 'none' : 'border-color 0.15s',
                                          userSelect: 'none', transform: 'translate(-2px,-2px)', boxSizing: 'border-box',
                                        }}
                                      >
                                        <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 7, fontWeight: 700, color: isLive ? '#E8341A' : 'rgba(232,52,26,0.6)', letterSpacing: '0.05em', whiteSpace: 'nowrap', lineHeight: 1, pointerEvents: 'none' }}>
                                          {labelBack[el.id] ?? el.id}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <SpecialEffectOverlay effect={s.specialEffect} primary={pal.primary} />
                                </div>
                              );
                            })()
                          );
                          })()}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* flip label / free layout hint below card */}
                  {s.freeLayout ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.6 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: isFlipped ? '#E8341A' : '#A78BFA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {isFlipped ? `Reverso · arrastra elementos · ↻ volver` : 'Frente · Modo Libre — arrastra · snap a zonas'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.45 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#7A7470', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {isFlipped ? 'Ver frente' : s.cardType === 'stamps' ? 'Ver sellos' : 'Ver puntos'}
                      </span>
                      <span style={{ fontSize: 11, color: '#7A7470' }}>↻</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Right: iPhone wallet with animated flip card — hidden in free layout (moved to its own view) */}
            {!s.freeLayout && (() => {
              const W_CARD = 192;
              const H_CARD = Math.round(W_CARD * 230 / 380);
              const wScale = W_CARD / 380;
              const WIconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon ?? STAMP_ICONS_EXTENDED[0]!.icon;
              const wTotal = Math.min(s.cardType === 'stamps' ? pointsForReward : 10, 20);
              const wFilled = Math.round(wTotal * 0.7);
              let wCols = Math.min(wTotal, 5);
              let wMinWaste = wCols * Math.ceil(wTotal / wCols) - wTotal;
              for (let c = Math.min(wTotal, 7); c >= 2; c--) {
                const w = c * Math.ceil(wTotal / c) - wTotal;
                if (w < wMinWaste) { wMinWaste = w; wCols = c; }
                if (w === 0) break;
              }
              const wRows = Math.ceil(wTotal / wCols);
              const wIconSize = wCols <= 3 ? 11 : wCols <= 5 ? 9 : 7;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--cb-subtle)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vista en Wallet</div>
                  {/* iPhone shell — shadow wrapper gives room so overflow:hidden on canvas doesn't clip it */}
                  <div style={{ padding: '4px 20px 56px', margin: '-4px -20px -56px' }}>
                  <div style={{ width: 230, height: 460, borderRadius: 42, background: '#000', border: '7px solid #1C1C1E', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.6), 0 48px 80px rgba(0,0,0,0.45)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Status bar */}
                    <div style={{ height: 28, background: '#000', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>9:41</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 7, color: '#fff' }}>▪▪▪</span>
                        <span style={{ fontSize: 7, color: '#fff', background: '#4ADE80', borderRadius: 3, padding: '1px 3px' }}>85</span>
                      </div>
                    </div>

                    {/* Wallet content */}
                    <div style={{ flex: 1, background: '#111', display: 'flex', flexDirection: 'column', padding: '10px 10px 8px', gap: 8 }}>
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
                            <CardFrontPreview s={s} pal={pal} font={font} pattern={pattern} />
                          </div>
                        </div>
                        {/* Back face */}
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
                          background: backFaceBg,
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
                              <div style={{ fontSize: 6, color: 'rgba(var(--cb-fg-rgb),0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>{s.cardType === 'stamps' ? 'Stamp Card' : 'Loyalty Points'}</div>
                            </div>
                            {s.cardType === 'stamps' ? (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: wRows > 3 ? 2 : 3, justifyContent: 'center', overflow: 'hidden' }}>
                                {Array.from({ length: wRows }, (_, r) => (
                                  <div key={r} style={{ display: 'flex', gap: wRows > 3 ? 2 : 3, justifyContent: 'center' }}>
                                    {Array.from({ length: wCols }, (_, c) => {
                                      const i = r * wCols + c;
                                      if (i >= wTotal) return <div key={c} style={{ flex: 1 }} />;
                                      const wCellSize = wCols <= 3 ? 22 : wCols <= 5 ? 17 : 13;
                                      const filled = i < wFilled;
                                      const cellSt = stampShapeStyle(s.stampShape, filled, pal.primary, wCellSize);
                                      return (
                                        <div key={c} style={cellSt}>
                                          {s.pointsStyle === 'stars'
                                            ? <span style={{ fontSize: wIconSize - 1, color: filled ? '#fff' : 'rgba(var(--cb-fg-rgb),0.2)', transform: s.stampShape === 'diamond' ? 'rotate(-45deg)' : undefined, display: 'inline-block' }}>★</span>
                                            : <WIconComp size={wIconSize} color={filled ? '#fff' : 'rgba(var(--cb-fg-rgb),0.2)'} style={s.stampShape === 'diamond' ? { transform: 'rotate(-45deg)' } : undefined} />
                                          }
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: pal.primary, letterSpacing: '-0.03em', lineHeight: 1 }}>70</div>
                                <div style={{ fontSize: 6, color: 'rgba(var(--cb-fg-rgb),0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>puntos</div>
                                <div style={{ width: '80%', height: 3, background: 'rgba(var(--cb-fg-rgb),0.08)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: '70%', background: pal.primary, borderRadius: 2 }} />
                                </div>
                              </div>
                            )}
                            <div style={{ fontSize: 6, color: 'rgba(var(--cb-fg-rgb),0.35)' }}>
                              {s.cardType === 'stamps'
                                ? <>Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>{wTotal - wFilled}</span> sellos</>
                                : <>Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>30 pts</span> para la recompensa</>}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Tap hint */}
                      <div style={{ textAlign: 'center', fontSize: 8, color: 'var(--cb-dim)', letterSpacing: '0.06em' }}>
                        {walletFlipped ? '↑ toca para ver el frente' : `↓ toca para ver ${s.cardType === 'stamps' ? 'sellos' : 'puntos'}`}
                      </div>

                      {/* Stacked other cards — peek effect, bottom of wallet */}
                      <div style={{ marginTop: 'auto', flexShrink: 0, position: 'relative', height: 56, overflow: 'hidden' }}>
                        {[['#A855F7', 'redBus'], ['#22C55E', 'Rewards'], ['#3B82F6', 'Coffee Club']].map(([color, label], i) => (
                          <div key={label} style={{ position: 'absolute', top: i * 12, left: 0, right: 0, height: 44, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', padding: '0 10px', zIndex: i + 1, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
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
                  </div>{/* closes shadow wrapper */}
                </div>
              );
            })()}

            {/* Wallet panel — shown when activeView === 'wallet' */}
            {activeView === 'wallet' && (() => {
              const W_CARD = 192;
              const H_CARD = Math.round(W_CARD * 230 / 380);
              const wScale = W_CARD / 380;
              const WIconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon ?? STAMP_ICONS_EXTENDED[0]!.icon;
              const wTotal = Math.min(s.cardType === 'stamps' ? pointsForReward : 10, 20);
              const wFilled = Math.round(wTotal * 0.7);
              let wCols = Math.min(wTotal, 5);
              let wMinWaste = wCols * Math.ceil(wTotal / wCols) - wTotal;
              for (let c = Math.min(wTotal, 7); c >= 2; c--) {
                const w = c * Math.ceil(wTotal / c) - wTotal;
                if (w < wMinWaste) { wMinWaste = w; wCols = c; }
                if (w === 0) break;
              }
              const wRows = Math.ceil(wTotal / wCols);
              const wIconSize = wCols <= 3 ? 11 : wCols <= 5 ? 9 : 7;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--cb-subtle)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vista en Wallet</div>
                  <div style={{ padding: '4px 20px 56px', margin: '-4px -20px -56px' }}>
                  <div style={{ width: 230, height: 460, borderRadius: 42, background: '#000', border: '7px solid #1C1C1E', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.6), 0 48px 80px rgba(0,0,0,0.45)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 28, background: '#000', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>9:41</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 7, color: '#fff' }}>▪▪▪</span>
                        <span style={{ fontSize: 7, color: '#fff', background: '#4ADE80', borderRadius: 3, padding: '1px 3px' }}>85</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, background: '#111', display: 'flex', flexDirection: 'column', padding: '10px 10px 8px', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>Wallet</span>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 11, color: '#fff' }}>+</span>
                        </div>
                      </div>
                      <div style={{ width: W_CARD, height: H_CARD, alignSelf: 'center', cursor: 'pointer', flexShrink: 0, position: 'relative', perspective: '600px', perspectiveOrigin: '50% 50%' }}
                        onClick={() => {
                          if (walletTimerRef.current) clearTimeout(walletTimerRef.current);
                          setWalletFlipped(f => {
                            const next = !f;
                            walletTimerRef.current = setTimeout(() => setWalletFlipped(false), next ? 2400 : 0);
                            return next;
                          });
                        }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden', transformOrigin: '50% 0%', transform: !walletFlipped ? 'rotateX(0deg) scale(1)' : 'rotateX(-72deg) scale(0.96)', opacity: !walletFlipped ? 1 : 0, transition: !walletFlipped ? 'transform 0.46s cubic-bezier(0.16,1,0.3,1), opacity 0.38s ease' : 'transform 0.26s ease-in, opacity 0.2s ease-in', pointerEvents: !walletFlipped ? 'auto' : 'none' }}>
                          <div style={{ width: 380, height: 230, transformOrigin: 'top left', transform: `scale(${wScale})`, pointerEvents: 'none' }}>
                            <CardFrontPreview s={s} pal={pal} font={font} pattern={pattern} />
                          </div>
                        </div>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden', background: backFaceBg, transformOrigin: '50% 0%', transform: walletFlipped ? 'rotateX(0deg) scale(1)' : 'rotateX(-72deg) scale(0.96)', opacity: walletFlipped ? 1 : 0, transition: walletFlipped ? 'transform 0.46s cubic-bezier(0.16,1,0.3,1), opacity 0.38s ease' : 'transform 0.26s ease-in, opacity 0.2s ease-in', pointerEvents: walletFlipped ? 'auto' : 'none' }}>
                          <div style={{ position: 'absolute', right: -10, top: -10, width: 60, height: 60, borderRadius: '50%', background: `${pal.primary}18` }} />
                          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '10px 12px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div>
                              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 10, color: pal.primary }}>{s.businessName || 'Tu Negocio'}</div>
                              <div style={{ fontSize: 6, color: 'rgba(var(--cb-fg-rgb),0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>{s.cardType === 'stamps' ? 'Stamp Card' : 'Loyalty Points'}</div>
                            </div>
                            {s.cardType === 'stamps' ? (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: wRows > 3 ? 2 : 3, justifyContent: 'center', overflow: 'hidden' }}>
                                {Array.from({ length: wRows }, (_, r) => (
                                  <div key={r} style={{ display: 'flex', gap: wRows > 3 ? 2 : 3, justifyContent: 'center' }}>
                                    {Array.from({ length: wCols }, (_, c) => {
                                      const i = r * wCols + c;
                                      if (i >= wTotal) return <div key={c} style={{ flex: 1 }} />;
                                      const wCellSize = wCols <= 3 ? 22 : wCols <= 5 ? 17 : 13;
                                      const filled = i < wFilled;
                                      const cellSt = stampShapeStyle(s.stampShape, filled, pal.primary, wCellSize);
                                      return (
                                        <div key={c} style={cellSt}>
                                          {s.pointsStyle === 'stars'
                                            ? <span style={{ fontSize: wIconSize - 1, color: filled ? '#fff' : 'rgba(var(--cb-fg-rgb),0.2)', transform: s.stampShape === 'diamond' ? 'rotate(-45deg)' : undefined, display: 'inline-block' }}>★</span>
                                            : <WIconComp size={wIconSize} color={filled ? '#fff' : 'rgba(var(--cb-fg-rgb),0.2)'} style={s.stampShape === 'diamond' ? { transform: 'rotate(-45deg)' } : undefined} />
                                          }
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: pal.primary, letterSpacing: '-0.03em', lineHeight: 1 }}>70</div>
                                <div style={{ fontSize: 6, color: 'rgba(var(--cb-fg-rgb),0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>puntos</div>
                                <div style={{ width: '80%', height: 3, background: 'rgba(var(--cb-fg-rgb),0.08)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: '70%', background: pal.primary, borderRadius: 2 }} />
                                </div>
                              </div>
                            )}
                            <div style={{ fontSize: 6, color: 'rgba(var(--cb-fg-rgb),0.35)' }}>
                              {s.cardType === 'stamps'
                                ? <>Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>{wTotal - wFilled}</span> sellos</>
                                : <>Faltan <span style={{ color: pal.primary, fontWeight: 700 }}>30 pts</span> para la recompensa</>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 8, color: 'var(--cb-dim)', letterSpacing: '0.06em' }}>
                        {walletFlipped ? '↑ toca para ver el frente' : `↓ toca para ver ${s.cardType === 'stamps' ? 'sellos' : 'puntos'}`}
                      </div>
                      <div style={{ marginTop: 'auto', flexShrink: 0, position: 'relative', height: 56, overflow: 'hidden' }}>
                        {[['#A855F7', 'redBus'], ['#22C55E', 'Rewards'], ['#3B82F6', 'Coffee Club']].map(([color, label], i) => (
                          <div key={label} style={{ position: 'absolute', top: i * 12, left: 0, right: 0, height: 44, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', padding: '0 10px', zIndex: i + 1, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ height: 20, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
                    </div>
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
        <div style={{ background: 'var(--cb-panel)', borderLeft: '1px solid rgba(var(--cb-fg-rgb),0.07)', overflowY: 'auto' }}>

          {/* Tipo de recompensa — primera decisión, visible siempre al inicio */}
          <div style={{ padding: '16px 16px', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', background: 'var(--cb-bg)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cb-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Tipo de recompensa</div>
            {isEdit ? (
              // Editing: read-only badge
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: s.cardType === 'stamps' ? 'rgba(232,52,26,0.08)' : 'rgba(167,139,250,0.08)', border: `1px solid ${s.cardType === 'stamps' ? 'rgba(232,52,26,0.22)' : 'rgba(167,139,250,0.22)'}` }}>
                {s.cardType === 'stamps' ? <Ticket size={18} color="#E8341A" /> : <Star size={18} color="#A78BFA" />}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.cardType === 'stamps' ? '#E8341A' : '#A78BFA' }}>{s.cardType === 'stamps' ? 'Tarjeta de Sellos' : 'Tarjeta de Puntos'}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--cb-subtle)', marginTop: 1 }}>No se puede cambiar después de guardar</div>
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
                      style={{ background: active ? `${accentColor}12` : 'var(--cb-input)', border: `1.5px solid ${active ? `${accentColor}40` : 'rgba(var(--cb-fg-rgb),0.08)'}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}
                    >
                      {active && <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: accentColor }} />}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        {type === 'stamps' ? <Ticket size={22} color={active ? '#E8341A' : 'var(--cb-subtle)'} /> : <Star size={22} color={active ? '#A78BFA' : 'var(--cb-subtle)'} />}
                      </div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 12, color: active ? accentColor : 'var(--cb-fg)', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 9, color: 'var(--cb-subtle)', lineHeight: 1.3, textAlign: 'center' }}>{sub}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rest of right panel — locked until type is confirmed */}
          {!typeConfirmed && (
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(var(--cb-fg-rgb),0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={14} color="var(--cb-subtle)" />
              </div>
              <div style={{ fontSize: 11, color: 'var(--cb-subtle)', lineHeight: 1.6 }}>Elige y confirma el tipo de recompensa para continuar personalizando tu tarjeta.</div>
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
            {s.cardType === 'stamps' ? (
              <StampCountField
                value={pointsForReward}
                onChange={setPointsForReward}
                activeUserCount={cardActiveUserCount}
                error={fieldErrors.pointsForReward}
              />
            ) : (
              <CtrlInput
                label="Puntos para recompensa"
                value={String(pointsForReward)}
                onChange={(v) => setPointsForReward(Math.max(1, Math.min(9999, Number(v) || 1)))}
                type="number"
                error={fieldErrors.pointsForReward}
              />
            )}
            <CtrlInput label="Máximo de miembros" value={maxMembers} onChange={setMaxMembers} type="number" placeholder="Sin límite" error={fieldErrors.maxMembers} />
          </RightSection>

          {/* Exportar */}
          <RightSection title="Exportar">
            {([['PNG', 'Imagen de alta resolución', 'free'], ['PDF', 'Para impresión (85×54mm)', 'free'], ['SVG', 'Vectorial editable', 'free'], ['Lote 50u', 'Para imprenta profesional', 'elite']] as const).map(([fmt, desc, req]) => {
              const locked = !canUse(tier, req);
              return (
                <div key={fmt}
                  onClick={() => locked ? upgrade(req) : undefined}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)', cursor: locked ? 'pointer' : 'default', opacity: locked ? 0.5 : 1 }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{fmt}</div>
                    <div style={{ fontSize: 10, color: 'var(--cb-muted)' }}>{desc}</div>
                  </div>
                  {locked ? <Lock size={10} style={{ color: '#FFB347', flexShrink: 0 }} /> : <button type="button" style={{ display: 'flex', alignItems: 'center', color: '#E8341A', background: 'none', border: 'none', cursor: 'pointer' }}><DownloadIcon size={10} /></button>}
                </div>
              );
            })}
          </RightSection>

          {/* Compartir */}
          {cardSlug && (
            <RightSection title="Compartir">
              <div style={{ background: 'var(--cb-input)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--cb-muted)', marginBottom: 6 }}>Link público de la tarjeta</div>
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
            <div style={{ fontSize: 11, color: 'var(--cb-muted)', lineHeight: 1.6, marginBottom: 10 }}>Descarga el PDF listo para imprimir en casa o imprenta. Incluido en todos los planes.</div>
            <button
              type="button"
              style={{ width: '100%', background: 'var(--cb-input)', border: '1px solid rgba(var(--cb-fg-rgb),0.12)', borderRadius: 7, padding: 9, fontSize: 12, color: 'var(--cb-fg)', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontWeight: 600 }}
            >
              <PrinterIcon size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} /> Descargar para imprimir
            </button>
          </RightSection>

          </>
          )}
        </div>
      </div>

      {(success || error) && (
        <div style={{ borderTop: '1px solid rgba(var(--cb-fg-rgb),0.07)', padding: '12px 16px' }}>
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

function CardFrontPreview({ s, pal, font, pattern }: { s: BuilderState; pal: { primary: string; bg: string }; font: FontOption; pattern: typeof PATTERNS[0] }) {
  const CardComp = CARD_RENDERERS[s.template] ?? ClassicCard;
  const freeElems: FreeLayoutElem[] = s.freeElems.length > 0 ? s.freeElems : defaultFreeElems(pal);
  if (s.freeLayout) {
    return (
      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden' }}>
        <CardComp s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow bgOnly />
        <FreeLayoutOverlay s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} elemsOverride={freeElems} />
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden' }}>
      <CardComp s={s} pal={pal} font={font} pattern={pattern} W={380} H={230} noShadow hidePoints={s.cardType === 'stamps'} />
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
        style={{ background: '#1A1712', border: '1px solid rgba(var(--cb-fg-rgb),0.1)', borderRadius: 20, padding: '28px 28px 24px', maxWidth: 360, width: 'calc(100% - 32px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          {isStamps ? <Ticket size={32} color="#E8341A" /> : <Star size={32} color="#A78BFA" />}
        </div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 19, color: 'var(--cb-fg)', marginBottom: 8, textAlign: 'center' }}>
          {isStamps ? 'Tarjeta de Sellos' : 'Tarjeta de Puntos'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--cb-muted)', lineHeight: 1.65, marginBottom: 16, textAlign: 'center' }}>
          {isStamps
            ? 'Los clientes acumularán un sello por cada visita hasta completar la tarjeta y ganar su recompensa.'
            : 'Los clientes acumularán puntos por visita. Tú configuras cuántos puntos vale cada visita y cuántos se necesitan para la recompensa.'}
        </div>
        <div style={{ background: 'rgba(232,52,26,0.08)', border: '1px solid rgba(232,52,26,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#F87171', lineHeight: 1.55 }}>
          ⚠ Esta elección no podrá cambiarse una vez que guardes la tarjeta.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel}
            style={{ flex: 1, background: 'transparent', border: '1px solid rgba(var(--cb-fg-rgb),0.14)', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 600, color: 'var(--cb-muted)', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif' }}>
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
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--cb-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function RightSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(var(--cb-fg-rgb),0.07)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cb-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
