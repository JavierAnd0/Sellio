'use client';
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Check, Star, Heart, Gift,
  Coffee, Croissant, CupSoda, IceCream, Cake, Bean, Milk, Cookie,
  Utensils, Pizza, ChefHat, Sandwich, Beef, Fish, Salad, Soup,
  Scissors, Sparkles, Flower, Droplets, Wind, Smile, Moon, Sun,
  ShoppingBag, Tag, Shirt, Glasses, Watch, Gem, Footprints, Crown,
  Dumbbell, Bike, Trophy, Zap, Music, Headphones, Gamepad2, Camera,
  Car, Plane, Home, Leaf, Globe, Rocket, Shield, Flame,
  GraduationCap, BookOpen, Pencil, Laptop, Smartphone, HeartPulse, Pill, Stethoscope,
  Banknote, CreditCard, Coins, PawPrint, Bird, Popcorn, Film, MapPin, Bus, Train,
  Palette, Brush, Waves, Mountain, Baby, Hammer, Wrench, Trees, Apple, Wine, Beer,
  Candy, Lollipop, Wheat, Rabbit, Dices,
  Image as ImageIcon
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────

export type Tier = 'free' | 'basic' | 'elite' | 'enterprise';
export type TemplateId = 'classic' | 'bold' | 'split' | 'luxury' | 'stamp' | 'minimal' | 'custom'
  | 'night' | 'gold' | 'glass' | 'marble' | 'neon' | 'paper' | 'carbon' | 'canvas';

// ── Free Layout ───────────────────────────────────────────────

export interface FreeLayoutElem {
  id: 'biz' | 'cardname' | 'points' | 'member' | 'qr' | 'logo';
  x: number;   // px in 380-wide card coordinate space
  y: number;   // px in 230-tall card coordinate space
  visible: boolean;
  fontSize: number;
  color: string;
  fontWeight: number;
}

/** 16 snap points arranged in TL / TR / CENTER / BL / BR zones */
export const SNAP_POINTS = [
  { id: 'tl0', x: 22,  y: 22  }, { id: 'tl1', x: 22,  y: 42  },
  { id: 'tl2', x: 22,  y: 65  }, { id: 'tl3', x: 22,  y: 88  },
  { id: 'tr0', x: 326, y: 20  }, { id: 'tr1', x: 326, y: 54  },
  { id: 'c0',  x: 22,  y: 105 }, { id: 'c1',  x: 22,  y: 148 },
  { id: 'c2',  x: 148, y: 100 }, { id: 'c3',  x: 148, y: 140 },
  { id: 'bl0', x: 22,  y: 182 }, { id: 'bl1', x: 22,  y: 202 },
  { id: 'br0', x: 316, y: 174 }, { id: 'br1', x: 316, y: 200 },
  { id: 'tc',  x: 148, y: 22  }, { id: 'bc',  x: 148, y: 196 },
] as const;

export function defaultFreeElems(pal: { primary: string }): FreeLayoutElem[] {
  return [
    { id: 'biz',      x: 22,  y: 22,  visible: true, fontSize: 15, color: pal.primary,               fontWeight: 800 },
    { id: 'cardname', x: 22,  y: 42,  visible: true, fontSize: 9,  color: 'rgba(255,255,255,0.35)',  fontWeight: 400 },
    { id: 'logo',     x: 326, y: 20,  visible: true, fontSize: 32, color: pal.primary,               fontWeight: 800 },
    { id: 'points',   x: 22,  y: 105, visible: true, fontSize: 52, color: '#fff',                    fontWeight: 900 },
    { id: 'member',   x: 22,  y: 182, visible: true, fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 },
    { id: 'qr',       x: 316, y: 174, visible: true, fontSize: 42, color: 'rgba(255,255,255,0.55)', fontWeight: 400 },
  ];
}
export type CustomLayoutId = 'stack' | 'centered' | 'split';
export type GradientStyleId = 'diagonal' | 'flat' | 'radial' | 'sweep' | 'bottom';
export const GRADIENT_STYLES: Array<{ id: GradientStyleId; label: string }> = [
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'flat',     label: 'Plano'    },
  { id: 'radial',   label: 'Radial'   },
  { id: 'sweep',    label: 'Barrido'  },
  { id: 'bottom',   label: 'Inferior' },
];
export type PointsStyleId = 'number' | 'bar' | 'stamps' | 'stars';
export type StampShapeId = 'square' | 'circle' | 'pill' | 'diamond' | 'hexagon';
export type TabId = 'templates' | 'colors' | 'typography' | 'elements';
export type StampIconId =
  | 'check' | 'star' | 'heart' | 'gift' | 'crown' | 'gem' | 'shield' | 'flame' | 'zap'
  | 'coffee' | 'croissant' | 'cup-soda' | 'ice-cream' | 'cake' | 'bean' | 'milk' | 'cookie'
  | 'utensils' | 'pizza' | 'chef-hat' | 'sandwich' | 'beef' | 'fish' | 'salad' | 'soup'
  | 'scissors' | 'sparkles' | 'flower' | 'droplets' | 'wind' | 'smile' | 'moon' | 'sun'
  | 'shopping-bag' | 'tag' | 'shirt' | 'glasses' | 'watch' | 'footprints'
  | 'dumbbell' | 'bike' | 'trophy' | 'music' | 'headphones' | 'gamepad2' | 'camera'
  | 'car' | 'plane' | 'home' | 'leaf' | 'globe' | 'rocket'
  | 'graduation-cap' | 'book-open' | 'pencil' | 'laptop' | 'smartphone'
  | 'heart-pulse' | 'pill' | 'stethoscope'
  | 'banknote' | 'credit-card' | 'coins'
  | 'paw-print' | 'bird' | 'rabbit'
  | 'popcorn' | 'film' | 'map-pin' | 'bus' | 'train'
  | 'palette' | 'brush' | 'waves' | 'mountain' | 'baby' | 'hammer' | 'wrench'
  | 'trees' | 'apple' | 'wine' | 'beer' | 'candy' | 'lollipop' | 'wheat' | 'dices'
  | 'custom';

export interface Palette { id: string; primary: string; dark: string; bg: string; name: string }
export interface CustomGradient { id: string; primary: string; bg: string; name: string }
export interface FontOption { id: string; display: string; body: string; name: string; tier: Tier }
export type CardType = 'points' | 'stamps';

export interface BuilderState {
  cardType: CardType;
  template: TemplateId;
  palette: string;
  customGradient: CustomGradient | null;
  customPrimary?: string;
  font: string;
  customFontUrl?: string;
  customFontFamily?: string;
  businessName: string;
  cardName: string;
  pattern: string;
  pointsStyle: PointsStyleId;
  showBadge: boolean;
  badgeText: string;
  showMemberNum: boolean;
  qrStyle: 'simple' | 'colored' | 'logo';
  stampIcon: StampIconId;
  customStampUrl?: string;
  stampShape: StampShapeId;
  // ── Custom gradient combo ─────────────────────────────────────
  customGradDark?: string;
  // ── Gradient style ────────────────────────────────────────────
  gradientStyle: GradientStyleId;
  // ── Free layout overlay ───────────────────────────────────────
  freeLayout: boolean;
  freeElems: FreeLayoutElem[];
  // ── Custom template controls ──────────────────────────────────
  customLayout: CustomLayoutId;
  customElemBiz: boolean;
  customElemCardName: boolean;
  customElemPoints: boolean;
  customElemMember: boolean;
  customElemQr: boolean;
  customElemLogo: boolean;
  specialEffect: 'none' | 'foil' | 'emboss' | 'glow';
}

// ── Data ──────────────────────────────────────────────────────

export const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, elite: 2, enterprise: 3 };
export const canUse = (tier: Tier, required: string) =>
  TIER_ORDER[tier] >= TIER_ORDER[required as Tier];

export const BASE_PALETTES: Palette[] = [
  { id: 'coral',   primary: '#E8341A', dark: '#0E0604', bg: 'linear-gradient(135deg,#1A0806 0%,#3A1006 55%,#E8341A 100%)', name: 'Coral' },
  { id: 'indigo',  primary: '#5B3FE8', dark: '#060412', bg: 'linear-gradient(135deg,#09061A 0%,#1A0D4A 55%,#5B3FE8 100%)', name: 'Índigo' },
  { id: 'emerald', primary: '#1A8C5B', dark: '#020C06', bg: 'linear-gradient(135deg,#021208 0%,#083220 55%,#1A8C5B 100%)', name: 'Esmeralda' },
  { id: 'amber',   primary: '#C17D3C', dark: '#080602', bg: 'linear-gradient(135deg,#100B04 0%,#2E1E08 55%,#C17D3C 100%)', name: 'Ámbar' },
  { id: 'violet',  primary: '#9B3FE8', dark: '#060310', bg: 'linear-gradient(135deg,#0A0618 0%,#22084A 55%,#9B3FE8 100%)', name: 'Violeta' },
  { id: 'teal',    primary: '#00A8A0', dark: '#020C0C', bg: 'linear-gradient(135deg,#021010 0%,#083030 55%,#00A8A0 100%)', name: 'Teal' },
];

export function buildGradientBg(primary: string, dark: string, baseBg: string, style: GradientStyleId): string {
  switch (style) {
    case 'flat':    return dark;
    case 'radial':  return `radial-gradient(ellipse at 85% 15%, ${primary}55 0%, ${dark} 60%)`;
    case 'sweep':   return `linear-gradient(150deg, ${primary}55 0%, ${dark} 44%)`;
    case 'bottom':  return `radial-gradient(ellipse at 50% 120%, ${primary}55 0%, ${dark} 52%)`;
    case 'diagonal':
    default:        return baseBg;
  }
}

export const SPECIAL_EFFECTS: Array<{ id: BuilderState['specialEffect']; label: string }> = [
  { id: 'none',   label: 'Ninguno' },
  { id: 'foil',   label: 'Foil'    },
  { id: 'emboss', label: 'Emboss'  },
  { id: 'glow',   label: 'Glow'    },
];

export function effectWrapperStyle(effect: BuilderState['specialEffect'], primary: string): React.CSSProperties {
  if (effect === 'glow') {
    return { filter: `drop-shadow(0 0 18px ${primary}CC) drop-shadow(0 0 40px ${primary}66) drop-shadow(0 0 70px ${primary}33)` };
  }
  return {};
}

export function SpecialEffectOverlay({ effect, primary, borderRadius = 20 }: {
  effect: BuilderState['specialEffect'];
  primary: string;
  borderRadius?: number;
}) {
  if (effect === 'foil') {
    return (
      <div style={{
        position: 'absolute', inset: 0, borderRadius,
        background: 'linear-gradient(115deg, transparent 15%, rgba(255,0,120,0.38) 28%, rgba(255,210,0,0.38) 38%, rgba(0,255,140,0.38) 48%, rgba(0,170,255,0.38) 58%, rgba(170,0,255,0.38) 68%, transparent 82%)',
        backgroundSize: '300% 300%',
        animation: 'foilShift 4s ease-in-out infinite',
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
        zIndex: 50,
      }} />
    );
  }
  if (effect === 'emboss') {
    return (
      <div style={{
        position: 'absolute', inset: 0, borderRadius,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 40%, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0.2) 100%)',
        boxShadow: `inset 2px 2px 0 rgba(255,255,255,0.22), inset -2px -2px 0 rgba(0,0,0,0.3), inset 0 0 0 1px ${primary}30`,
        pointerEvents: 'none',
        zIndex: 50,
      }} />
    );
  }
  return null;
}

export const PATTERNS = [
  { id: 'none',     name: 'Sin patrón', css: '',                                                                                                                                            size: '' },
  { id: 'dots',     name: 'Puntos',     css: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',                                                                       size: '20px 20px' },
  { id: 'lines',    name: 'Líneas',     css: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)',               size: '' },
  { id: 'grid',     name: 'Grid',       css: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',        size: '24px 24px' },
  { id: 'diagonal', name: 'Diagonal',   css: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 8px)',              size: '' },
];

export const FONTS: FontOption[] = [
  { id: 'syne',       display: 'Syne',              body: 'Space Grotesk',    name: 'Syne + Space Grotesk',       tier: 'free'  },
  { id: 'outfit',     display: 'Outfit',             body: 'Nunito',           name: 'Outfit + Nunito',             tier: 'free'  },
  { id: 'raleway',    display: 'Raleway',            body: 'Lato',             name: 'Raleway + Lato',             tier: 'free'  },
  { id: 'montserrat', display: 'Montserrat',         body: 'Inter',            name: 'Montserrat + Inter',         tier: 'basic' },
  { id: 'poppins',    display: 'Poppins',            body: 'Nunito',           name: 'Poppins + Nunito',           tier: 'basic' },
  { id: 'playfair',   display: 'Playfair Display',  body: 'DM Sans',          name: 'Playfair + DM Sans',         tier: 'basic' },
  { id: 'cormorant',  display: 'Cormorant Garamond', body: 'Lato',            name: 'Cormorant + Lato',           tier: 'basic' },
  { id: 'cabinet',    display: 'Plus Jakarta Sans',   body: 'Space Grotesk',   name: 'Jakarta + Grotesk',          tier: 'basic' },
  { id: 'bebas',      display: 'Bebas Neue',         body: 'Inter',           name: 'Bebas Neue + Inter',         tier: 'basic' },
  { id: 'fraunces',   display: 'Fraunces',           body: 'DM Sans',          name: 'Fraunces + DM Sans',         tier: 'elite' },
  { id: 'josefin',    display: 'Josefin Sans',       body: 'Source Serif 4',  name: 'Josefin + Source Serif',     tier: 'elite' },
  { id: 'cinzel',     display: 'Cinzel',             body: 'Lato',             name: 'Cinzel + Lato',              tier: 'elite' },
  { id: 'mono',       display: 'Space Grotesk',      body: 'Space Grotesk',   name: 'Monoespaciado',              tier: 'elite' },
];

export const TEMPLATES: Array<{ id: TemplateId; name: string; tier: Tier }> = [
  { id: 'classic', name: 'Classic',       tier: 'free'  },
  { id: 'bold',    name: 'Bold',          tier: 'basic' },
  { id: 'split',   name: 'Split',         tier: 'basic' },
  { id: 'luxury',  name: 'Luxury',        tier: 'elite' },
  { id: 'stamp',   name: 'Stamp',         tier: 'basic' },
  { id: 'minimal', name: 'Minimal',       tier: 'basic' },
  { id: 'night',   name: 'Night',         tier: 'basic' },
  { id: 'gold',    name: 'Gold',          tier: 'basic' },
  { id: 'glass',   name: 'Glass',         tier: 'elite' },
  { id: 'marble',  name: 'Marble',        tier: 'elite' },
  { id: 'neon',    name: 'Neon',          tier: 'basic' },
  { id: 'paper',   name: 'Paper',         tier: 'basic' },
  { id: 'carbon',  name: 'Carbon',        tier: 'elite' },
  { id: 'custom',  name: 'Personalizada', tier: 'free'  },
];

export const BADGE_OPTIONS = ['Gold Member', 'Silver Member', 'Bronze Member', 'VIP', 'Founding Member', 'Loyal Customer'];
export const POINTS_STYLES: Array<{ id: PointsStyleId; label: string; tier: Tier }> = [
  { id: 'number', label: 'Número',    tier: 'free' },
  { id: 'bar',    label: 'Barra',     tier: 'basic' },
  { id: 'stamps', label: 'Sellos',    tier: 'basic' },
  { id: 'stars',  label: 'Estrellas', tier: 'elite' },
];

export const STAMP_SHAPES: Array<{ id: StampShapeId; label: string; tier: Tier }> = [
  { id: 'square',  label: 'Cuadrado', tier: 'basic' },
  { id: 'circle',  label: 'Círculo',  tier: 'basic' },
  { id: 'pill',    label: 'Píldora',  tier: 'basic' },
  { id: 'diamond', label: 'Diamante', tier: 'elite' },
  { id: 'hexagon', label: 'Hexágono', tier: 'elite' },
];

/** Returns the CSS needed to render a stamp cell in the given shape */
export function stampShapeStyle(shape: StampShapeId, filled: boolean, primary: string, size: number): React.CSSProperties {
  const base: React.CSSProperties = {
    width: size, height: size,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: filled ? primary : 'rgba(255,255,255,0.07)',
    border: filled ? 'none' : '1.5px solid rgba(255,255,255,0.14)',
    flexShrink: 0,
    transition: 'background 0.2s',
  };
  switch (shape) {
    case 'circle':  return { ...base, borderRadius: '50%' };
    case 'pill':    return { ...base, borderRadius: 999, width: size * 1.5, height: size };
    case 'diamond': return { ...base, borderRadius: 5, transform: 'rotate(45deg)' };
    case 'hexagon': return { ...base, borderRadius: 4, clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' };
    default:        return { ...base, borderRadius: Math.round(size * 0.22) }; // square
  }
}

export const STAMP_CATEGORIES = [
  {
    id: 'generic',
    label: 'Genéricos',
    icons: [
      { id: 'check', label: 'Check', icon: Check, tier: 'free' as Tier },
      { id: 'star', label: 'Estrella', icon: Star, tier: 'basic' as Tier },
      { id: 'heart', label: 'Corazón', icon: Heart, tier: 'basic' as Tier },
      { id: 'gift', label: 'Regalo', icon: Gift, tier: 'basic' as Tier },
    ]
  },
  {
    id: 'cafe',
    label: 'Cafetería & Snacks',
    icons: [
      { id: 'coffee', label: 'Café', icon: Coffee, tier: 'basic' as Tier },
      { id: 'croissant', label: 'Croissant', icon: Croissant, tier: 'basic' as Tier },
      { id: 'cup-soda', label: 'Bebida', icon: CupSoda, tier: 'basic' as Tier },
      { id: 'ice-cream', label: 'Helado', icon: IceCream, tier: 'basic' as Tier },
    ]
  },
  {
    id: 'food',
    label: 'Restaurante',
    icons: [
      { id: 'utensils', label: 'Cubiertos', icon: Utensils, tier: 'basic' as Tier },
      { id: 'pizza', label: 'Pizza', icon: Pizza, tier: 'basic' as Tier },
      { id: 'chef-hat', label: 'Chef', icon: ChefHat, tier: 'basic' as Tier },
      { id: 'sandwich', label: 'Sándwich', icon: Sandwich, tier: 'basic' as Tier },
    ]
  },
  {
    id: 'beauty',
    label: 'Belleza & Salud',
    icons: [
      { id: 'scissors', label: 'Tijeras', icon: Scissors, tier: 'basic' as Tier },
      { id: 'sparkles', label: 'Brillos', icon: Sparkles, tier: 'basic' as Tier },
      { id: 'flower', label: 'Flor', icon: Flower, tier: 'basic' as Tier },
      { id: 'droplets', label: 'Gotas', icon: Droplets, tier: 'basic' as Tier },
    ]
  },
  {
    id: 'retail',
    label: 'Retail & Moda',
    icons: [
      { id: 'shopping-bag', label: 'Bolsa', icon: ShoppingBag, tier: 'basic' as Tier },
      { id: 'tag', label: 'Etiqueta', icon: Tag, tier: 'basic' as Tier },
      { id: 'shirt', label: 'Ropa', icon: Shirt, tier: 'basic' as Tier },
      { id: 'glasses', label: 'Lentes', icon: Glasses, tier: 'basic' as Tier },
    ]
  },
  {
    id: 'custom',
    label: 'Personalizado',
    icons: [
      { id: 'custom', label: 'Subir Imagen', icon: ImageIcon, tier: 'elite' as Tier }
    ]
  }
];

export const FLAT_STAMP_ICONS = STAMP_CATEGORIES.flatMap(c => c.icons);

// Extended icon library for full picker search
export const STAMP_ICONS_EXTENDED: Array<{ id: StampIconId | string; label: string; en: string; icon: LucideIcon; tier: Tier; category: string }> = [
  // Generic
  { id: 'check',         label: 'Check',        en: 'check mark tick done',                    icon: Check,        tier: 'free',  category: 'Genéricos' },
  { id: 'star',          label: 'Estrella',      en: 'star favorite rating',                    icon: Star,         tier: 'basic', category: 'Genéricos' },
  { id: 'heart',         label: 'Corazón',       en: 'heart love like',                         icon: Heart,        tier: 'basic', category: 'Genéricos' },
  { id: 'gift',          label: 'Regalo',        en: 'gift present reward prize',               icon: Gift,         tier: 'basic', category: 'Genéricos' },
  { id: 'crown',         label: 'Corona',        en: 'crown king queen royal vip',              icon: Crown,        tier: 'basic', category: 'Genéricos' },
  { id: 'gem',           label: 'Gema',          en: 'gem diamond jewel luxury elite',          icon: Gem,          tier: 'basic', category: 'Genéricos' },
  { id: 'shield',        label: 'Escudo',        en: 'shield protect security badge',           icon: Shield,       tier: 'basic', category: 'Genéricos' },
  { id: 'flame',         label: 'Fuego',         en: 'flame fire hot streak',                   icon: Flame,        tier: 'basic', category: 'Genéricos' },
  { id: 'zap',           label: 'Rayo',          en: 'zap lightning bolt energy power',         icon: Zap,          tier: 'basic', category: 'Genéricos' },
  // Café
  { id: 'coffee',        label: 'Café',          en: 'coffee cup espresso latte',               icon: Coffee,       tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'croissant',     label: 'Croissant',     en: 'croissant pastry bakery bread',           icon: Croissant,    tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'cup-soda',      label: 'Bebida',        en: 'cup soda drink beverage juice',           icon: CupSoda,      tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'ice-cream',     label: 'Helado',        en: 'ice cream dessert sweet gelato',          icon: IceCream,     tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'cake',          label: 'Pastel',        en: 'cake birthday dessert sweet bake',        icon: Cake,         tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'bean',          label: 'Grano',         en: 'bean coffee grain seed',                  icon: Bean,         tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'milk',          label: 'Leche',         en: 'milk dairy drink bottle',                 icon: Milk,         tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'cookie',        label: 'Galleta',       en: 'cookie biscuit snack sweet',              icon: Cookie,       tier: 'basic', category: 'Cafetería & Snacks' },
  // Restaurante
  { id: 'utensils',      label: 'Cubiertos',     en: 'utensils fork knife restaurant food',     icon: Utensils,     tier: 'basic', category: 'Restaurante' },
  { id: 'pizza',         label: 'Pizza',         en: 'pizza slice italian food',                icon: Pizza,        tier: 'basic', category: 'Restaurante' },
  { id: 'chef-hat',      label: 'Chef',          en: 'chef hat cook kitchen restaurant',        icon: ChefHat,      tier: 'basic', category: 'Restaurante' },
  { id: 'sandwich',      label: 'Sándwich',      en: 'sandwich burger food lunch',              icon: Sandwich,     tier: 'basic', category: 'Restaurante' },
  { id: 'beef',          label: 'Carne',         en: 'beef meat steak grill bbq',               icon: Beef,         tier: 'basic', category: 'Restaurante' },
  { id: 'fish',          label: 'Pescado',       en: 'fish seafood sushi ocean',                icon: Fish,         tier: 'basic', category: 'Restaurante' },
  { id: 'salad',         label: 'Ensalada',      en: 'salad healthy vegetable green',           icon: Salad,        tier: 'basic', category: 'Restaurante' },
  { id: 'soup',          label: 'Sopa',          en: 'soup bowl warm broth',                    icon: Soup,         tier: 'basic', category: 'Restaurante' },
  // Belleza
  { id: 'scissors',      label: 'Tijeras',       en: 'scissors cut hair salon barber',          icon: Scissors,     tier: 'basic', category: 'Belleza & Salud' },
  { id: 'sparkles',      label: 'Brillos',       en: 'sparkles glitter shine beauty glow',      icon: Sparkles,     tier: 'basic', category: 'Belleza & Salud' },
  { id: 'flower',        label: 'Flor',          en: 'flower nature bloom spa wellness',        icon: Flower,       tier: 'basic', category: 'Belleza & Salud' },
  { id: 'droplets',      label: 'Gotas',         en: 'droplets water hydration spa',            icon: Droplets,     tier: 'basic', category: 'Belleza & Salud' },
  { id: 'wind',          label: 'Viento',        en: 'wind air breeze spa relax',               icon: Wind,         tier: 'basic', category: 'Belleza & Salud' },
  { id: 'smile',         label: 'Sonrisa',       en: 'smile happy face emoji',                  icon: Smile,        tier: 'basic', category: 'Belleza & Salud' },
  { id: 'moon',          label: 'Luna',          en: 'moon night sleep relax rest',             icon: Moon,         tier: 'basic', category: 'Belleza & Salud' },
  { id: 'sun',           label: 'Sol',           en: 'sun light day bright energy',             icon: Sun,          tier: 'basic', category: 'Belleza & Salud' },
  // Retail
  { id: 'shopping-bag',  label: 'Bolsa',         en: 'shopping bag cart purchase store',        icon: ShoppingBag,  tier: 'basic', category: 'Retail & Moda' },
  { id: 'tag',           label: 'Etiqueta',      en: 'tag label price discount sale',           icon: Tag,          tier: 'basic', category: 'Retail & Moda' },
  { id: 'shirt',         label: 'Ropa',          en: 'shirt clothes fashion apparel tshirt',    icon: Shirt,        tier: 'basic', category: 'Retail & Moda' },
  { id: 'glasses',       label: 'Lentes',        en: 'glasses sunglasses eyewear optical',      icon: Glasses,      tier: 'basic', category: 'Retail & Moda' },
  { id: 'watch',         label: 'Reloj',         en: 'watch clock time accessories',            icon: Watch,        tier: 'basic', category: 'Retail & Moda' },
  { id: 'footprints',    label: 'Zapatillas',    en: 'footprints shoes sneakers steps walk',    icon: Footprints,   tier: 'basic', category: 'Retail & Moda' },
  // Otros
  { id: 'dumbbell',      label: 'Pesas',         en: 'dumbbell gym fitness workout weights',    icon: Dumbbell,     tier: 'basic', category: 'Otros' },
  { id: 'bike',          label: 'Bicicleta',     en: 'bike bicycle cycling sport',              icon: Bike,         tier: 'basic', category: 'Otros' },
  { id: 'trophy',        label: 'Trofeo',        en: 'trophy award winner prize achievement',   icon: Trophy,       tier: 'basic', category: 'Otros' },
  { id: 'music',         label: 'Música',        en: 'music note song sound audio',             icon: Music,        tier: 'basic', category: 'Otros' },
  { id: 'headphones',    label: 'Auriculares',   en: 'headphones audio music earphones',        icon: Headphones,   tier: 'basic', category: 'Otros' },
  { id: 'gamepad2',      label: 'Videojuegos',   en: 'gamepad gaming controller video game',    icon: Gamepad2,     tier: 'basic', category: 'Otros' },
  { id: 'camera',        label: 'Cámara',        en: 'camera photo picture photography',        icon: Camera,       tier: 'basic', category: 'Otros' },
  { id: 'car',           label: 'Auto',          en: 'car vehicle automobile transport drive',  icon: Car,          tier: 'basic', category: 'Otros' },
  { id: 'plane',         label: 'Avión',         en: 'plane airplane travel flight trip',       icon: Plane,        tier: 'basic', category: 'Otros' },
  { id: 'home',          label: 'Casa',          en: 'home house building real estate',         icon: Home,         tier: 'basic', category: 'Otros' },
  { id: 'leaf',          label: 'Hoja',          en: 'leaf nature eco green organic plant',     icon: Leaf,         tier: 'basic', category: 'Otros' },
  { id: 'globe',         label: 'Globo',         en: 'globe world earth travel international',  icon: Globe,        tier: 'basic', category: 'Otros' },
  { id: 'rocket',        label: 'Cohete',        en: 'rocket launch space startup boost',       icon: Rocket,       tier: 'basic', category: 'Otros' },
  // Educación & Tecnología
  { id: 'graduation-cap', label: 'Graduación',  en: 'graduation cap diploma school university', icon: GraduationCap, tier: 'basic', category: 'Educación & Tech' },
  { id: 'book-open',      label: 'Libro',       en: 'book open read library education study',  icon: BookOpen,      tier: 'basic', category: 'Educación & Tech' },
  { id: 'pencil',         label: 'Lápiz',       en: 'pencil write draw school art',            icon: Pencil,        tier: 'basic', category: 'Educación & Tech' },
  { id: 'laptop',         label: 'Laptop',      en: 'laptop computer tech digital work',       icon: Laptop,        tier: 'basic', category: 'Educación & Tech' },
  { id: 'smartphone',     label: 'Teléfono',    en: 'smartphone phone mobile cell',            icon: Smartphone,    tier: 'basic', category: 'Educación & Tech' },
  // Salud & Bienestar
  { id: 'heart-pulse',    label: 'Pulso',       en: 'heart pulse health medical cardio',       icon: HeartPulse,    tier: 'basic', category: 'Salud' },
  { id: 'pill',           label: 'Pastilla',    en: 'pill medicine pharmacy drug health',      icon: Pill,          tier: 'basic', category: 'Salud' },
  { id: 'stethoscope',    label: 'Estetoscopio',en: 'stethoscope doctor medical clinic',       icon: Stethoscope,   tier: 'basic', category: 'Salud' },
  { id: 'waves',          label: 'Ondas',       en: 'waves water spa wellness relax ocean',    icon: Waves,         tier: 'basic', category: 'Salud' },
  // Finanzas
  { id: 'banknote',       label: 'Billete',     en: 'banknote money cash bill finance',        icon: Banknote,      tier: 'basic', category: 'Finanzas' },
  { id: 'credit-card',    label: 'Tarjeta',     en: 'credit card payment bank finance',        icon: CreditCard,    tier: 'basic', category: 'Finanzas' },
  { id: 'coins',          label: 'Monedas',     en: 'coins money savings gold currency',       icon: Coins,         tier: 'basic', category: 'Finanzas' },
  // Mascotas
  { id: 'paw-print',      label: 'Huella',      en: 'paw print pet dog cat animal',            icon: PawPrint,      tier: 'basic', category: 'Mascotas' },
  { id: 'bird',           label: 'Pájaro',      en: 'bird parrot pet animal nature',           icon: Bird,          tier: 'basic', category: 'Mascotas' },
  { id: 'rabbit',         label: 'Conejo',      en: 'rabbit bunny pet animal cute',            icon: Rabbit,        tier: 'basic', category: 'Mascotas' },
  // Entretenimiento
  { id: 'popcorn',        label: 'Palomitas',   en: 'popcorn cinema movie film entertainment', icon: Popcorn,       tier: 'basic', category: 'Entretenimiento' },
  { id: 'film',           label: 'Película',    en: 'film movie cinema reel video',            icon: Film,          tier: 'basic', category: 'Entretenimiento' },
  { id: 'dices',          label: 'Dados',       en: 'dice game board play luck fun',           icon: Dices,         tier: 'basic', category: 'Entretenimiento' },
  // Transporte
  { id: 'map-pin',        label: 'Ubicación',   en: 'map pin location place destination gps',  icon: MapPin,        tier: 'basic', category: 'Transporte' },
  { id: 'bus',            label: 'Bus',         en: 'bus transport public commute',            icon: Bus,           tier: 'basic', category: 'Transporte' },
  { id: 'train',          label: 'Tren',        en: 'train rail metro transport commute',      icon: Train,         tier: 'basic', category: 'Transporte' },
  // Arte
  { id: 'palette',        label: 'Paleta',      en: 'palette paint art color artist',          icon: Palette,       tier: 'basic', category: 'Arte' },
  { id: 'brush',          label: 'Pincel',      en: 'brush paint art artist design',           icon: Brush,         tier: 'basic', category: 'Arte' },
  // Naturaleza extra
  { id: 'mountain',       label: 'Montaña',     en: 'mountain hike outdoor nature adventure',  icon: Mountain,      tier: 'basic', category: 'Naturaleza' },
  { id: 'trees',          label: 'Árboles',     en: 'trees forest park nature eco green',      icon: Trees,         tier: 'basic', category: 'Naturaleza' },
  { id: 'wheat',          label: 'Trigo',       en: 'wheat grain bread bakery organic farm',   icon: Wheat,         tier: 'basic', category: 'Naturaleza' },
  // Comida extra
  { id: 'apple',          label: 'Manzana',     en: 'apple fruit healthy food natural',        icon: Apple,         tier: 'basic', category: 'Comida & Bebida' },
  { id: 'wine',           label: 'Vino',        en: 'wine glass drink alcohol bar beverage',   icon: Wine,          tier: 'basic', category: 'Comida & Bebida' },
  { id: 'beer',           label: 'Cerveza',     en: 'beer drink bar pub alcohol hop',          icon: Beer,          tier: 'basic', category: 'Comida & Bebida' },
  { id: 'candy',          label: 'Caramelo',    en: 'candy sweets dessert sugar treat',        icon: Candy,         tier: 'basic', category: 'Comida & Bebida' },
  { id: 'lollipop',       label: 'Paleta',      en: 'lollipop candy sweet treat kids',         icon: Lollipop,      tier: 'basic', category: 'Comida & Bebida' },
  // Servicios
  { id: 'hammer',         label: 'Martillo',    en: 'hammer tool build repair construction',   icon: Hammer,        tier: 'basic', category: 'Servicios' },
  { id: 'wrench',         label: 'Llave',       en: 'wrench tool repair fix mechanic',         icon: Wrench,        tier: 'basic', category: 'Servicios' },
  { id: 'baby',           label: 'Bebé',        en: 'baby child family kids infant',           icon: Baby,          tier: 'basic', category: 'Servicios' },
  // Personalizado
  { id: 'custom',        label: 'Imagen propia', en: 'custom image upload logo photo png svg', icon: ImageIcon,    tier: 'elite', category: 'Personalizado' },
];

// Hoisted constant — avoids allocating a new array on every card render
const STAMP_SLOTS = Array.from({ length: 10 }, (_, i) => i);

export const DEFAULT_BUILDER: BuilderState = {
  cardType: 'stamps',
  template: 'classic',
  palette: 'coral',
  customGradient: null,
  font: 'syne',
  customFontUrl: undefined,
  customFontFamily: undefined,
  businessName: 'Tu Negocio',
  cardName: 'Tarjeta de Fidelidad',
  pattern: 'none',
  pointsStyle: 'number',
  showBadge: false,
  badgeText: 'Gold Member',
  showMemberNum: false,
  qrStyle: 'simple',
  stampIcon: 'check',
  stampShape: 'square',
  gradientStyle: 'diagonal',
  customGradDark: undefined,
  freeLayout: false,
  freeElems: [],
  customLayout: 'stack',
  customElemBiz: true,
  customElemCardName: true,
  customElemPoints: true,
  customElemMember: true,
  customElemQr: true,
  customElemLogo: true,
  specialEffect: 'none',
};

// ── QR placeholder SVG ────────────────────────────────────────

export function QR({ size = 44, color = 'rgba(255,255,255,0.55)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <rect x="6" y="6" width="8" height="8" rx="1" fill={color} />
      <rect x="26" y="2" width="16" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <rect x="30" y="6" width="8" height="8" rx="1" fill={color} />
      <rect x="2" y="26" width="16" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <rect x="6" y="30" width="8" height="8" rx="1" fill={color} />
      <rect x="26" y="26" width="4" height="4" fill={color} />
      <rect x="32" y="26" width="4" height="4" fill={color} />
      <rect x="38" y="26" width="4" height="4" fill={color} />
      <rect x="26" y="32" width="4" height="10" fill={color} />
      <rect x="32" y="32" width="10" height="4" fill={color} />
      <rect x="38" y="38" width="4" height="4" fill={color} />
    </svg>
  );
}

// ── Card renderer props ───────────────────────────────────────

export interface CardProps {
  s: BuilderState;
  pal: { primary: string; bg: string };
  font: FontOption;
  pattern: typeof PATTERNS[0];
  W?: number;
  H?: number;
  noShadow?: boolean;
  /** When true, hides the points/stamps section from the front face (clean front design) */
  hidePoints?: boolean;
  /** When true, renders only the background/decorative layer — no text or UI content */
  bgOnly?: boolean;
  /** Real member number for this customer (omit in builder preview to show placeholder) */
  memberNumber?: number;
}

function formatMemberNumber(n: number | undefined): string {
  if (n === undefined) return '00847291';
  return String(n).padStart(8, '0');
}

// ── Classic ───────────────────────────────────────────────────

export function ClassicCard({ s, pal, font, pattern, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, padding: '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', transition: 'all 0.3s', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {pattern.id !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern.css, backgroundSize: pattern.size || undefined, pointerEvents: 'none', borderRadius: 20 }} />
      )}
      <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', border: `1px solid ${pal.primary}20`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: -80, top: -80, width: 260, height: 260, borderRadius: '50%', border: `1px solid ${pal.primary}10`, pointerEvents: 'none' }} />
      {!bgOnly && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: H <= 80 ? 8 : 22, position: 'relative' }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 8 : 15, color: pal.primary, letterSpacing: '0.03em', marginBottom: 3 }}>{s.businessName || 'Tu Negocio'}</div>
          <div style={{ fontSize: H <= 80 ? 5 : 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ width: H <= 80 ? 18 : 34, height: H <= 80 ? 18 : 34, borderRadius: 9, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: H <= 80 ? 8 : 14, color: '#fff' }}>S</div>
          {s.showBadge && H > 80 && (<div style={{ background: `${pal.primary}25`, border: `1px solid ${pal.primary}40`, borderRadius: 100, padding: '2px 8px', fontSize: 8, color: pal.primary, fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{s.badgeText}</div>)}
        </div>
      </div>}
      {!bgOnly && H > 80 && !hidePoints && (
        <div style={{ position: 'relative', marginBottom: 20 }}>
          {s.pointsStyle === 'number' && (<><div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1 }}>847</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>puntos acumulados</div></>)}
          {s.pointsStyle === 'bar' && (<><div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: 32, color: '#fff', lineHeight: 1 }}>847 pts</div><div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}><div style={{ height: '100%', width: '68%', background: pal.primary, borderRadius: 2 }} /></div></>)}
          {s.pointsStyle === 'stamps' && (()=>{
            const IconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon || Check;
            return (<><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Sellos acumulados</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{STAMP_SLOTS.map(i => {
            const isStamped = i < 7;
            return (
              <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: isStamped ? pal.primary : 'rgba(255,255,255,0.08)', border: `1.5px solid ${isStamped ? pal.primary : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.stampIcon === 'custom' && s.customStampUrl
                  ? <img src={s.customStampUrl} style={{ width: 14, height: 14, objectFit: 'contain', opacity: isStamped ? 1 : 0.25 }} alt="sello" />
                  : <IconComp size={14} color={isStamped ? '#fff' : 'rgba(255,255,255,0.25)'} />}
              </div>
            );
          })}</div></>);
          })()}
          {s.pointsStyle === 'stars' && (<div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: 5 }).map((_, i) => (<span key={i} style={{ fontSize: 28, color: i < 4 ? pal.primary : 'rgba(255,255,255,0.15)' }}>★</span>))}</div>)}
        </div>
      )}
      {!bgOnly && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          {s.showMemberNum && H > 80 && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
          <div style={{ fontSize: H <= 80 ? 5 : 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Miembro</div>
          <div style={{ fontSize: H <= 80 ? 7 : 12, fontWeight: 500, color: '#fff', marginTop: 2, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
        </div>
        <QR size={H <= 80 ? 22 : 42} color={s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.55)'} />
      </div>}
    </div>
  );
}

export function BoldCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, padding: '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', border: `1px solid ${pal.primary}30`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ position: 'absolute', left: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${pal.primary}15 0%, transparent 70%)` }} />
      {!bgOnly && <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: H <= 80 ? 6 : 16, position: 'relative' }}>
        <div style={{ width: H <= 80 ? 18 : 36, height: H <= 80 ? 18 : 36, borderRadius: 9, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: H <= 80 ? 8 : 15, color: '#fff' }}>S</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 6 : 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>
          {s.showBadge && H > 80 && <div style={{ fontSize: 9, color: pal.primary, fontWeight: 700 }}>{s.badgeText}</div>}
        </div>
      </div>
      {!hidePoints && <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 22 : 52, color: pal.primary, lineHeight: 1, marginBottom: 4 }}>847</div>}
      {!hidePoints && H > 80 && <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: 16, color: 'rgba(255,255,255,0.15)', marginBottom: 20 }}>puntos</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: hidePoints ? 'flex-end' : 'flex-end', marginTop: hidePoints ? 'auto' : undefined, position: hidePoints ? 'absolute' : undefined, bottom: hidePoints ? 22 : undefined, left: hidePoints ? 24 : undefined, right: hidePoints ? 24 : undefined }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 7 : 14, color: '#fff' }}>{s.businessName || 'Tu Negocio'}</div>
          {H > 80 && <>{s.showMemberNum && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 1 }}>№ {formatMemberNumber(memberNumber)}</div>}<div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div></>}
        </div>
        <QR size={H <= 80 ? 22 : 42} color={pal.primary} />
      </div>
      </>}
    </div>
  );
}

export function SplitCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, borderRadius: 20, overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', display: 'flex', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ flex: (hidePoints || bgOnly) ? '0 0 28%' : '0 0 44%', background: pal.primary, padding: isSmall ? '10px 8px' : '22px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'flex 0.3s' }}>
        {!bgOnly && <div style={{ width: isSmall ? 14 : 32, height: isSmall ? 14 : 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 13, color: '#fff' }}>S</div>}
        {!bgOnly && !hidePoints && <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 16 : 36, color: '#fff', lineHeight: 1 }}>847</div>
          <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>puntos</div>
        </div>}
      </div>
      <div style={{ flex: 1, background: '#0D0B09', padding: isSmall ? '10px 8px' : '22px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {!bgOnly && <>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 7 : 13, color: '#fff', marginBottom: 2 }}>{s.businessName || 'Tu Negocio'}</div>
          <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.3)' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 12, color: '#fff', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 40} color="rgba(255,255,255,0.5)" />
        </div>
        </>}
      </div>
    </div>
  );
}

export function LuxuryCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, padding: isSmall ? '10px 12px' : '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? `inset 0 0 0 1px ${pal.primary}30` : `0 32px 80px rgba(0,0,0,0.7), inset 0 0 0 1px ${pal.primary}30`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(45deg, ${pal.primary}06 0px, ${pal.primary}06 1px, transparent 1px, transparent 12px)` }} />
      {!bgOnly && <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isSmall ? 6 : 18, position: 'relative' }}>
        <div>
          {!isSmall && <div style={{ fontSize: 8, color: pal.primary, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5 }}>Sellio Loyalty</div>}
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 700, fontSize: isSmall ? 8 : 16, color: '#fff' }}>{s.businessName || 'Tu Negocio'}</div>
        </div>
        {s.showBadge && !isSmall && (<div style={{ background: `linear-gradient(135deg,${pal.primary},${pal.primary}AA)`, borderRadius: 100, padding: '3px 10px', fontSize: 8, color: '#fff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.badgeText}</div>)}
      </div>
      {!hidePoints && <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 24 : 48, color: '#fff', lineHeight: 1, marginBottom: 4, position: 'relative' }}>847</div>}
      {!hidePoints && !isSmall && <div style={{ fontSize: 8, color: `${pal.primary}99`, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24, position: 'relative' }}>puntos de lealtad</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: hidePoints ? 'absolute' : 'relative', bottom: hidePoints ? (isSmall ? 10 : 22) : undefined, left: hidePoints ? (isSmall ? 12 : 24) : undefined, right: hidePoints ? (isSmall ? 12 : 24) : undefined }}>
        <div>
          {!isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>TITULAR</div>}
          {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
          <div style={{ fontSize: isSmall ? 7 : 12, color: '#fff', fontFamily: `'${font.body}', sans-serif`, marginTop: isSmall ? 0 : 2 }}>Ana García</div>
        </div>
        <QR size={isSmall ? 20 : 44} color={pal.primary} />
      </div>
      </>}
    </div>
  );
}

export function StampCard({ s, pal, font, W = 380, H = 230, noShadow, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  const stamps = 7;
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, padding: isSmall ? '10px 12px' : '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSmall ? 6 : 14 }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 7 : 13, color: pal.primary }}>{s.businessName || 'Tu Negocio'}</div>
          {!isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Stamp Card</div>}
        </div>
        <div style={{ width: isSmall ? 16 : 28, height: isSmall ? 16 : 28, borderRadius: 7, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 11, color: '#fff' }}>S</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: isSmall ? 3 : 6, marginBottom: isSmall ? 6 : 12 }}>
        {(() => {
          const IconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon || Check;
          return STAMP_SLOTS.map(i => {
            const isStamped = i < stamps;
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: isSmall ? 4 : 8, background: isStamped ? pal.primary : 'rgba(255,255,255,0.06)', border: `1.5px solid ${isStamped ? pal.primary : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.stampIcon === 'custom' && s.customStampUrl
                  ? <img src={s.customStampUrl} style={{ width: isSmall ? 8 : 16, height: isSmall ? 8 : 16, objectFit: 'contain', opacity: isStamped ? 1 : 0.25 }} alt="sello" />
                  : <IconComp size={isSmall ? 8 : 16} color={isStamped ? '#fff' : 'rgba(255,255,255,0.25)'} />}
              </div>
            );
          });
        })()}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
          <div style={{ fontSize: isSmall ? 5 : 9, color: 'rgba(255,255,255,0.3)' }}>Miembro</div>
          <div style={{ fontSize: isSmall ? 7 : 11, color: '#fff', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
        </div>
        {!isSmall && (<div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}><div>{stamps}/10 sellos</div><div style={{ fontSize: 8, marginTop: 2 }}>1 café gratis al completar</div></div>)}
      </div>
    </div>
  );
}

export function MinimalCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: '#F5F0EB', borderRadius: 20, padding: isSmall ? '10px 12px' : '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.4)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {!bgOnly && <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isSmall ? 6 : 16 }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 15, color: '#0A0A0A' }}>{s.businessName || 'Tu Negocio'}</div>
          {!isSmall && <div style={{ fontSize: 9, color: '#9A9490', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>{s.cardName || 'Member Card'}</div>}
        </div>
        <div style={{ width: isSmall ? 16 : 32, height: isSmall ? 16 : 32, borderRadius: 8, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 13, color: '#fff' }}>S</div>
      </div>
      {!hidePoints && <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 22 : 48, color: '#0A0A0A', lineHeight: 1, marginBottom: 4 }}>847</div>}
      {!hidePoints && !isSmall && <div style={{ fontSize: 9, color: '#9A9490', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>puntos</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: hidePoints ? 'absolute' : undefined, bottom: hidePoints ? (isSmall ? 10 : 22) : undefined, left: hidePoints ? (isSmall ? 12 : 24) : undefined, right: hidePoints ? (isSmall ? 12 : 24) : undefined }}>
        <div>
          {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: '#B0ACA8', letterSpacing: '0.08em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
          <div style={{ fontSize: isSmall ? 5 : 8, color: '#C0BCB8' }}>Miembro · Ana García</div>
          {s.showBadge && !isSmall && <div style={{ fontSize: 8, color: pal.primary, fontWeight: 700, marginTop: 2 }}>{s.badgeText}</div>}
        </div>
        <QR size={isSmall ? 20 : 40} color="#0A0A0A" />
      </div>
      </>}
    </div>
  );
}

// ── Custom ─────────────────────────────────────────────────────

export function CustomCard({ s, pal, font, pattern, W = 380, H = 230, noShadow, hidePoints }: CardProps) {
  const isSmall = H <= 80;
  const layout = s.customLayout ?? 'stack';
  const show = {
    biz:      s.customElemBiz,
    cardName: s.customElemCardName,
    points:   hidePoints ? false : s.customElemPoints,
    member:   s.customElemMember,
    qr:       s.customElemQr,
    logo:     s.customElemLogo,
  };
  const bg = pal.bg;
  const qrColor = s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.55)';
  const patternOverlay = pattern.id !== 'none'
    ? <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern.css, backgroundSize: pattern.size || undefined, pointerEvents: 'none', borderRadius: 20 }} />
    : null;

  // ── Centered ──────────────────────────────────────────────────
  if (layout === 'centered') {
    return (
      <div style={{ width: W, height: H, background: bg, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isSmall ? '8px 12px' : '20px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif`, textAlign: 'center' }}>
        {patternOverlay}
        {show.logo && <div style={{ width: isSmall ? 16 : 28, height: isSmall ? 16 : 28, borderRadius: 7, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 11, color: '#fff', marginBottom: isSmall ? 4 : 10, position: 'relative' }}>S</div>}
        {show.biz && <div style={{ fontWeight: 800, fontSize: isSmall ? 8 : 16, color: pal.primary, letterSpacing: '-0.01em', marginBottom: 2, position: 'relative' }}>{s.businessName || 'Tu Negocio'}</div>}
        {show.cardName && <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: isSmall ? 4 : 14, position: 'relative' }}>{s.cardName || 'Member Card'}</div>}
        {show.points && !isSmall && <div style={{ fontWeight: 800, fontSize: 46, color: '#fff', lineHeight: 1, position: 'relative' }}>847</div>}
        {show.points && !isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14, position: 'relative' }}>puntos</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          {show.member && <div style={{ fontSize: isSmall ? 6 : 10, color: 'rgba(255,255,255,0.5)', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>}
          {show.qr && <QR size={isSmall ? 18 : 32} color={qrColor} />}
        </div>
      </div>
    );
  }

  // ── Split accent ──────────────────────────────────────────────
  if (layout === 'split') {
    return (
      <div style={{ width: W, height: H, borderRadius: 20, overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', display: 'flex', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
        <div style={{ flex: '0 0 40%', background: pal.primary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isSmall ? '8px' : '20px 16px', gap: isSmall ? 2 : 6 }}>
          {show.logo && <div style={{ width: isSmall ? 14 : 26, height: isSmall ? 14 : 26, borderRadius: 6, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 6 : 10, color: '#fff' }}>S</div>}
          {show.points && <div style={{ fontWeight: 800, fontSize: isSmall ? 20 : 44, color: '#fff', lineHeight: 1, textAlign: 'center' }}>847</div>}
          {show.points && <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>pts</div>}
        </div>
        <div style={{ flex: 1, background: '#0D0B09', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: isSmall ? '8px 10px' : '20px 20px', position: 'relative' }}>
          {patternOverlay}
          <div style={{ position: 'relative' }}>
            {show.biz && <div style={{ fontWeight: 800, fontSize: isSmall ? 7 : 14, color: '#fff', marginBottom: 2 }}>{s.businessName || 'Tu Negocio'}</div>}
            {show.cardName && <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
            {show.member ? (
              <div>
                <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.3)' }}>Miembro</div>
                <div style={{ fontSize: isSmall ? 6 : 12, color: '#fff', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
              </div>
            ) : <div />}
            {show.qr && <QR size={isSmall ? 18 : 38} color={qrColor} />}
          </div>
        </div>
      </div>
    );
  }

  // ── Stack (default) ────────────────────────────────────────────
  return (
    <div style={{ width: W, height: H, background: bg, borderRadius: 20, padding: isSmall ? '10px 12px' : '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif`, display: 'flex', flexDirection: 'column' }}>
      {patternOverlay}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isSmall ? 4 : 16, position: 'relative' }}>
        <div>
          {show.biz && <div style={{ fontWeight: 800, fontSize: isSmall ? 8 : 15, color: pal.primary, letterSpacing: '0.02em', marginBottom: 2 }}>{s.businessName || 'Tu Negocio'}</div>}
          {show.cardName && <div style={{ fontSize: isSmall ? 5 : 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>}
        </div>
        {show.logo && <div style={{ width: isSmall ? 18 : 34, height: isSmall ? 18 : 34, borderRadius: 9, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 8 : 14, color: '#fff', flexShrink: 0 }}>S</div>}
      </div>
      {show.points && !isSmall && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontWeight: 800, fontSize: 48, color: '#fff', lineHeight: 1 }}>847</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>puntos acumulados</div>
        </div>
      )}
      {!show.points && !isSmall && <div style={{ flex: 1 }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', marginTop: 'auto' }}>
        {show.member ? (
          <div>
            <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 12, fontWeight: 500, color: '#fff', marginTop: 2, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
        ) : <div />}
        {show.qr && <QR size={isSmall ? 22 : 42} color={qrColor} />}
      </div>
    </div>
  );
}

// ── Night ──────────────────────────────────────────────────────

export function NightCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : `0 32px 80px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.04)`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Dot matrix */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${pal.primary}18 1px, transparent 1px)`, backgroundSize: '18px 18px', pointerEvents: 'none' }} />
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: isSmall ? 2 : 3, background: pal.primary, borderRadius: '20px 0 0 20px' }} />
      {!bgOnly && <div style={{ position: 'absolute', left: isSmall ? 10 : 22, top: isSmall ? 10 : 22, right: isSmall ? 10 : 22, bottom: isSmall ? 10 : 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 14, color: '#fff', letterSpacing: '-0.01em' }}>{s.businessName || 'Tu Negocio'}</div>
            {!isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 3 }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ width: isSmall ? 16 : 28, height: isSmall ? 16 : 28, borderRadius: 7, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 11, color: '#fff' }}>S</div>
        </div>
        {/* Center — points / stamps */}
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 62, color: pal.primary, lineHeight: 0.9, letterSpacing: '-0.04em' }}>847</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 6 }}>puntos acumulados</div>
          </div>
        )}
        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.2)' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 12, fontWeight: 600, color: '#fff', marginTop: 1, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 40} color={s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.35)'} />
        </div>
      </div>}
    </div>
  );
}

// ── Gold ───────────────────────────────────────────────────────

export function GoldCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  const gold = '#C9A84C';
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : `0 32px 80px rgba(0,0,0,0.8), inset 0 0 0 1px ${gold}25`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Diamond bg pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(45deg, ${gold}07 0px, ${gold}07 1px, transparent 1px, transparent 18px), repeating-linear-gradient(-45deg, ${gold}07 0px, ${gold}07 1px, transparent 1px, transparent 18px)`, pointerEvents: 'none' }} />
      {/* Top gold line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isSmall ? 1 : 2, background: `linear-gradient(90deg, transparent, ${gold}60, ${gold}, ${gold}60, transparent)` }} />
      {/* Bottom gold line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: isSmall ? 1 : 2, background: `linear-gradient(90deg, transparent, ${gold}60, ${gold}, ${gold}60, transparent)` }} />
      {/* Content */}
      {!bgOnly && <div style={{ position: 'absolute', inset: isSmall ? 10 : 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: isSmall ? 5 : 7, color: gold, letterSpacing: '0.32em', textTransform: 'uppercase', fontWeight: 600, marginBottom: isSmall ? 2 : 4 }}>Sellio Loyalty</div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 16, color: '#fff', letterSpacing: '0.04em' }}>{s.businessName || 'Tu Negocio'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ width: isSmall ? 18 : 32, height: isSmall ? 18 : 32, borderRadius: 8, background: `linear-gradient(135deg,${gold},${gold}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 8 : 13, color: '#0E0C08' }}>S</div>
            {s.showBadge && !isSmall && <div style={{ fontSize: 8, color: gold, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.badgeText}</div>}
          </div>
        </div>
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 52, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.03em' }}>847</div>
            <div style={{ fontSize: 7, color: gold, letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 5, fontWeight: 600 }}>puntos de oro</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: isSmall ? 5 : 7, color: `${gold}70`, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Titular</div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: `${gold}60`, letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 7 : 12, color: '#fff', fontFamily: `'${font.body}', sans-serif`, marginTop: 2 }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 42} color={s.qrStyle === 'colored' ? pal.primary : `${gold}80`} />
        </div>
      </div>}
    </div>
  );
}

// ── Glass ──────────────────────────────────────────────────────

export function GlassCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.7)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${pal.primary}30 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${pal.primary}18 0%, transparent 65%)`, pointerEvents: 'none' }} />
      {/* Glass panel */}
      <div style={{ position: 'absolute', inset: isSmall ? 6 : 14, borderRadius: isSmall ? 12 : 16, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)', display: bgOnly ? undefined : 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: isSmall ? '8px 10px' : '18px 20px' }}>
        {!bgOnly && <>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 15, color: '#fff', letterSpacing: '-0.01em' }}>{s.businessName || 'Tu Negocio'}</div>
            {!isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ width: isSmall ? 18 : 30, height: isSmall ? 18 : 30, borderRadius: 8, background: `${pal.primary}CC`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 8 : 12, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>S</div>
        </div>
        {/* Center */}
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 54, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.04em', textShadow: `0 0 40px ${pal.primary}60` }}>847</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6 }}>puntos acumulados</div>
          </div>
        )}
        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.35)' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 12, fontWeight: 600, color: '#fff', marginTop: 1, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 40} color={s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.6)'} />
        </div>
        </>}
      </div>
    </div>
  );
}

// ── Marble ─────────────────────────────────────────────────────

export function MarbleCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : `0 32px 80px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Marble base */}
      <div style={{ position: 'absolute', inset: 0, background: pal.bg }} />
      {/* Marble veins — layered radial gradients */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 200% 80% at 20% 30%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 160% 100% at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 55%), radial-gradient(ellipse 80% 160% at 50% 10%, ${pal.primary}12 0%, transparent 50%), radial-gradient(ellipse 120% 60% at 10% 80%, ${pal.primary}08 0%, transparent 40%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(128deg, transparent 0px, transparent 28px, rgba(255,255,255,0.012) 28px, rgba(255,255,255,0.012) 29px, transparent 29px, transparent 58px)`, pointerEvents: 'none' }} />
      {/* Content */}
      {!bgOnly && <div style={{ position: 'absolute', inset: isSmall ? 10 : 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 16, color: '#fff', letterSpacing: '0.02em' }}>{s.businessName || 'Tu Negocio'}</div>
            {!isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 3 }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div style={{ width: isSmall ? 18 : 30, height: isSmall ? 18 : 30, borderRadius: 8, background: `linear-gradient(135deg,${pal.primary}DD,${pal.primary}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 12, color: '#fff' }}>S</div>
            {s.showBadge && !isSmall && <div style={{ fontSize: 8, color: pal.primary, fontWeight: 700, letterSpacing: '0.1em' }}>{s.badgeText}</div>}
          </div>
        </div>
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 58, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.04em' }}>847</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ height: 1, width: 20, background: `${pal.primary}60` }} />
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>puntos acumulados</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: isSmall ? 5 : 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Titular</div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 7 : 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 40} color={s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.45)'} />
        </div>
      </div>}
    </div>
  );
}

// ── Neon ───────────────────────────────────────────────────────

export function NeonCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  const glow = pal.primary;
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : `0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px ${glow}40, 0 0 30px ${glow}15`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Scan lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)`, pointerEvents: 'none', zIndex: 1 }} />
      {/* Neon border glow */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, boxShadow: `inset 0 0 0 1px ${glow}50, inset 0 0 20px ${glow}08`, pointerEvents: 'none', zIndex: 2 }} />
      {/* Corner accent */}
      <div style={{ position: 'absolute', top: isSmall ? 6 : 14, left: isSmall ? 6 : 14, width: isSmall ? 10 : 18, height: isSmall ? 10 : 18, borderTop: `2px solid ${glow}`, borderLeft: `2px solid ${glow}`, borderRadius: '4px 0 0 0', boxShadow: `0 0 6px ${glow}`, pointerEvents: 'none', zIndex: 3 }} />
      <div style={{ position: 'absolute', bottom: isSmall ? 6 : 14, right: isSmall ? 6 : 14, width: isSmall ? 10 : 18, height: isSmall ? 10 : 18, borderBottom: `2px solid ${glow}`, borderRight: `2px solid ${glow}`, borderRadius: '0 0 4px 0', boxShadow: `0 0 6px ${glow}`, pointerEvents: 'none', zIndex: 3 }} />
      {/* Content */}
      {!bgOnly && <div style={{ position: 'absolute', inset: isSmall ? 12 : 24, zIndex: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: isSmall ? 8 : 15, color: glow, letterSpacing: '0.06em', textShadow: `0 0 8px ${glow}, 0 0 20px ${glow}60` }}>{s.businessName || 'Tu Negocio'}</div>
            {!isSmall && <div style={{ fontSize: 7, color: `${glow}70`, letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 3, textShadow: `0 0 5px ${glow}50` }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ width: isSmall ? 18 : 28, height: isSmall ? 18 : 28, borderRadius: 6, background: `${glow}20`, border: `1px solid ${glow}70`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 11, color: glow, boxShadow: `0 0 8px ${glow}50` }}>S</div>
        </div>
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 58, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.04em', textShadow: `0 0 12px ${glow}80, 0 0 40px ${glow}40` }}>847</div>
            <div style={{ fontSize: 7, color: `${glow}80`, letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 6, textShadow: `0 0 5px ${glow}` }}>puntos acumulados</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: `${glow}50`, letterSpacing: '0.12em', marginBottom: 2, textShadow: `0 0 4px ${glow}40` }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 5 : 7, color: `${glow}50`, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 18 : 38} color={s.qrStyle === 'colored' ? glow : `${glow}80`} />
        </div>
      </div>}
    </div>
  );
}

// ── Paper ──────────────────────────────────────────────────────

export function PaperCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: '#FAFAF8', borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.35)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isSmall ? 3 : 5, background: pal.primary }} />
      {/* Ruled lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 27px, rgba(0,0,0,0.04) 27px, rgba(0,0,0,0.04) 28px)`, pointerEvents: 'none' }} />
      {/* Paper texture dots */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)`, backgroundSize: '24px 24px', pointerEvents: 'none' }} />
      {/* Content */}
      {!bgOnly && <div style={{ position: 'absolute', inset: 0, padding: isSmall ? '10px 12px' : '22px 24px', paddingTop: isSmall ? 12 : 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 16, color: '#0A0A0A', letterSpacing: '-0.02em' }}>{s.businessName || 'Tu Negocio'}</div>
            {!isSmall && <div style={{ fontSize: 8, color: '#9A9490', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 3 }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ width: isSmall ? 18 : 30, height: isSmall ? 18 : 30, borderRadius: 8, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 12, color: '#fff' }}>S</div>
            {s.showBadge && !isSmall && <div style={{ fontSize: 8, color: pal.primary, fontWeight: 700 }}>{s.badgeText}</div>}
          </div>
        </div>
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 64, color: '#0A0A0A', lineHeight: 0.85, letterSpacing: '-0.05em' }}>847</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ height: 2, width: 24, background: pal.primary, borderRadius: 2 }} />
              <div style={{ fontSize: 8, color: '#9A9490', letterSpacing: '0.2em', textTransform: 'uppercase' }}>puntos acumulados</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: isSmall ? 5 : 8, color: '#C0BCB8', letterSpacing: '0.08em' }}>Miembro · Ana García</div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: '#C0BCB8', marginTop: 2, letterSpacing: '0.06em' }}>№ {formatMemberNumber(memberNumber)}</div>}
          </div>
          <QR size={isSmall ? 20 : 40} color="#0A0A0A" />
        </div>
      </div>}
    </div>
  );
}

// ── Carbon ─────────────────────────────────────────────────────

export function CarbonCard({ s, pal, font, W = 380, H = 230, noShadow, hidePoints, bgOnly, memberNumber }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: pal.bg, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : `0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {/* Carbon fiber pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px)`, backgroundSize: '8px 8px', pointerEvents: 'none' }} />
      {/* Left gradient accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: isSmall ? 3 : 5, background: `linear-gradient(180deg, ${pal.primary}EE 0%, ${pal.primary} 50%, ${pal.primary}CC 100%)`, boxShadow: `2px 0 12px ${pal.primary}50` }} />
      {/* Content */}
      {!bgOnly && <div style={{ position: 'absolute', top: isSmall ? 10 : 22, right: isSmall ? 10 : 22, bottom: isSmall ? 10 : 22, left: isSmall ? 14 : 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: isSmall ? 8 : 15, color: '#fff', letterSpacing: '0.04em' }}>{s.businessName || 'Tu Negocio'}</div>
            {!isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 3 }}>{s.cardName || 'Member Card'}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div style={{ width: isSmall ? 18 : 30, height: isSmall ? 18 : 30, borderRadius: 7, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 12, color: '#fff', boxShadow: `0 2px 8px ${pal.primary}50` }}>S</div>
            {s.showBadge && !isSmall && <div style={{ fontSize: 7, color: pal.primary, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.badgeText}</div>}
          </div>
        </div>
        {!isSmall && !hidePoints && (
          <div>
            <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 900, fontSize: 58, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.04em' }}>847</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <div style={{ width: 16, height: 2, background: pal.primary, borderRadius: 2, boxShadow: `0 0 4px ${pal.primary}` }} />
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>puntos acumulados</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {s.showMemberNum && !isSmall && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', marginBottom: 2 }}>№ {formatMemberNumber(memberNumber)}</div>}
            <div style={{ fontSize: isSmall ? 5 : 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 12, fontWeight: 600, color: '#fff', marginTop: 2, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 40} color={s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.4)'} />
        </div>
      </div>}
    </div>
  );
}

// ── Canvas (free-form / Modo Libre) ────────────────────────────

export interface CanvasElem {
  id: string;
  type: 'text' | 'points' | 'qr' | 'logo';
  x: number;   // percentage 0–100 of card width
  y: number;   // percentage 0–100 of card height
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  visible: boolean;
  content?: string;
}

export function defaultCanvasElems(s: BuilderState, pal: { primary: string }): CanvasElem[] {
  return [
    { id: 'biz',      type: 'text',   x: 6,  y: 9,  fontSize: 15, color: pal.primary, fontWeight: 800, visible: true, content: s.businessName || 'Tu Negocio' },
    { id: 'cardname', type: 'text',   x: 6,  y: 20, fontSize: 8,  color: 'rgba(255,255,255,0.35)', fontWeight: 400, visible: true, content: s.cardName || 'Member Card' },
    { id: 'points',   type: 'points', x: 6,  y: 42, fontSize: 52, color: '#fff',       fontWeight: 900, visible: true },
    { id: 'member',   type: 'text',   x: 6,  y: 82, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, visible: true, content: 'Ana García' },
    { id: 'qr',       type: 'qr',     x: 80, y: 70, fontSize: 44, color: 'rgba(255,255,255,0.55)', fontWeight: 400, visible: true },
    { id: 'logo',     type: 'logo',   x: 88, y: 6,  fontSize: 32, color: pal.primary,  fontWeight: 800, visible: true },
  ];
}

export function CanvasCard({ s, pal, font, pattern, W = 380, H = 230, noShadow, hidePoints }: CardProps & { canvasElems?: CanvasElem[] }) {
  const isSmall = H <= 80;
  const bg = pal.bg;
  const elems = defaultCanvasElems(s, pal);
  const scale = W / 380;

  return (
    <div style={{ width: W, height: H, background: bg, borderRadius: 20, position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', flexShrink: 0 }}>
      {pattern.id !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern.css, backgroundSize: pattern.size || undefined, pointerEvents: 'none', borderRadius: 20 }} />
      )}
      {elems.map(el => {
        if (!el.visible) return null;
        if (isSmall && (el.type === 'points')) return null;
        const left = `${el.x}%`;
        const top = `${el.y}%`;
        const style: React.CSSProperties = { position: 'absolute', left, top, transform: 'translateY(-50%)' };

        if (el.type === 'logo') {
          const sz = (el.fontSize ?? 32) * scale;
          return (
            <div key={el.id} style={{ ...style, transform: undefined, width: sz, height: sz, borderRadius: sz * 0.28, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: sz * 0.42, color: '#fff' }}>S</div>
          );
        }
        if (el.type === 'qr') {
          const sz = (el.fontSize ?? 44) * scale;
          return <div key={el.id} style={{ ...style, transform: undefined }}><QR size={sz} color={s.qrStyle === 'colored' ? pal.primary : (el.color ?? 'rgba(255,255,255,0.55)')} /></div>;
        }
        if (el.type === 'points') {
          if (hidePoints) return null;
          return (
            <div key={el.id} style={{ ...style, fontFamily: `'${font.display}', sans-serif`, fontWeight: el.fontWeight ?? 900, fontSize: (el.fontSize ?? 52) * scale, color: el.color ?? '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>847</div>
          );
        }
        return (
          <div key={el.id} style={{ ...style, fontFamily: `'${font.display}', sans-serif`, fontWeight: el.fontWeight ?? 400, fontSize: (el.fontSize ?? 13) * scale, color: el.color ?? '#fff', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{el.content}</div>
        );
      })}
    </div>
  );
}

export const CARD_RENDERERS: Record<TemplateId, React.ComponentType<CardProps>> = {
  classic: ClassicCard,
  bold: BoldCard,
  split: SplitCard,
  luxury: LuxuryCard,
  stamp: StampCard,
  minimal: MinimalCard,
  night: NightCard,
  gold: GoldCard,
  glass: GlassCard,
  marble: MarbleCard,
  neon: NeonCard,
  paper: PaperCard,
  carbon: CarbonCard,
  canvas: CanvasCard,
  custom: CustomCard,
};

// ── FreeLayoutOverlay — renders free-positioned elements on top of any template ──

export function FreeLayoutOverlay({
  s, pal, font, W = 380,
  elemsOverride,
}: CardProps & { elemsOverride?: FreeLayoutElem[] }) {
  const scale = W / 380;
  const elems = elemsOverride ?? (s.freeElems.length > 0 ? s.freeElems : defaultFreeElems(pal));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {elems.filter(el => el.visible).map(el => {
        const left = el.x * scale;
        const top = el.y * scale;
        const base: React.CSSProperties = { position: 'absolute', left, top };

        if (el.id === 'logo') {
          const sz = el.fontSize * scale;
          return (
            <div key={el.id} style={{ ...base, width: sz, height: sz, borderRadius: sz * 0.28, background: el.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: sz * 0.42, color: '#fff', flexShrink: 0 }}>
              {(s.businessName || 'S').charAt(0).toUpperCase()}
            </div>
          );
        }
        if (el.id === 'qr') {
          return <div key={el.id} style={base}><QR size={el.fontSize * scale} color={el.color} /></div>;
        }
        if (el.id === 'points') {
          if (s.cardType === 'stamps') {
            // Mini stamp grid
            const filled = 5;
            const cellSz = Math.round(el.fontSize * scale * 0.38);
            const IconComp = STAMP_ICONS_EXTENDED.find(x => x.id === s.stampIcon)?.icon ?? Check;
            return (
              <div key={el.id} style={{ ...base, display: 'flex', flexDirection: 'column', gap: cellSz * 0.3 }}>
                {[0, 1].map(row => (
                  <div key={row} style={{ display: 'flex', gap: cellSz * 0.3 }}>
                    {Array.from({ length: 4 }, (_, col) => {
                      const idx = row * 4 + col;
                      const isFilled = idx < filled;
                      const shapeStyle = stampShapeStyle(s.stampShape, isFilled, el.color, cellSz);
                      return (
                        <div key={col} style={shapeStyle}>
                          <IconComp size={Math.round(cellSz * 0.55)} color={isFilled ? '#fff' : 'rgba(255,255,255,0.25)'} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          }
          if (s.pointsStyle === 'bar') {
            const barW = el.fontSize * scale * 2.4;
            const barH = el.fontSize * scale * 0.28;
            return (
              <div key={el.id} style={{ ...base, width: barW }}>
                <div style={{ fontSize: el.fontSize * scale * 0.38, fontFamily: `'${font.display}',sans-serif`, color: el.color, fontWeight: 700, marginBottom: barH * 0.5, lineHeight: 1 }}>847 pts</div>
                <div style={{ width: barW, height: barH, borderRadius: barH, background: 'rgba(255,255,255,0.12)' }}>
                  <div style={{ width: '62%', height: '100%', borderRadius: barH, background: el.color }} />
                </div>
              </div>
            );
          }
          if (s.pointsStyle === 'stars') {
            return (
              <div key={el.id} style={{ ...base, display: 'flex', gap: el.fontSize * scale * 0.12 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{ fontSize: el.fontSize * scale * 0.55, color: i < 4 ? el.color : 'rgba(255,255,255,0.2)', lineHeight: 1 }}>★</span>
                ))}
              </div>
            );
          }
          // default: number
          return (
            <div key={el.id} style={{ ...base }}>
              <div style={{ fontFamily: `'${font.display}',sans-serif`, fontWeight: el.fontWeight, fontSize: el.fontSize * scale, color: el.color, lineHeight: 1, letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>847</div>
              <div style={{ fontSize: el.fontSize * scale * 0.22, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>puntos</div>
            </div>
          );
        }
        const text = el.id === 'biz' ? (s.businessName || 'Tu Negocio')
          : el.id === 'cardname' ? (s.cardName || 'Member Card')
          : 'Ana García';
        const ff = el.id === 'member' ? `'${font.body}',sans-serif` : `'${font.display}',sans-serif`;
        return (
          <div key={el.id} style={{ ...base, fontFamily: ff, fontWeight: el.fontWeight, fontSize: el.fontSize * scale, color: el.color, whiteSpace: 'nowrap', lineHeight: 1.2 }}>{text}</div>
        );
      })}
    </div>
  );
}

// ── CardFromDesign — renders any card from stored design JSON ──

interface CardFromDesignProps {
  design: Record<string, unknown>;
  primaryColor?: string;
  W?: number;
  H?: number;
  noShadow?: boolean;
  memberNumber?: number;
}

export function CardFromDesign({ design, primaryColor = '#E8341A', W = 380, H = 230, noShadow, memberNumber }: CardFromDesignProps) {
  const template = (design.template as TemplateId) ?? 'classic';
  const paletteId = (design.palette as string) ?? 'coral';
  const customGradient = (design.customGradient as CustomGradient | null) ?? null;
  const fontId = (design.font as string) ?? 'syne';
  const patternId = (design.pattern as string) ?? 'none';
  const customFontUrl = (design.customFontUrl as string) ?? undefined;
  const customFontFamily = (design.customFontFamily as string) ?? undefined;

  const font: FontOption = customFontFamily
    ? { id: 'custom', display: customFontFamily, body: customFontFamily, name: 'Fuente personalizada', tier: 'elite' }
    : (FONTS.find((f) => f.id === fontId) ?? FONTS[0]!);
  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0]!;

  const resolvedPalettes = BASE_PALETTES.map((p) =>
    p.id === 'coral'
      ? { ...p, primary: primaryColor, bg: `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${primaryColor} 100%)` }
      : p,
  );
  const gradientStyleId = (design.gradientStyle as GradientStyleId) ?? 'diagonal';
  const customGradDarkColor = (design.customGradDark as string) ?? undefined;
  const customPrimaryColor = (design.customPrimary as string) ?? undefined;
  let pal: { primary: string; bg: string };
  if (customGradient) {
    const dark = customGradDarkColor ?? '#080808';
    pal = { primary: customGradient.primary, bg: buildGradientBg(customGradient.primary, dark, customGradient.bg, gradientStyleId) };
  } else if (customPrimaryColor) {
    const baseBg = `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${customPrimaryColor} 100%)`;
    pal = { primary: customPrimaryColor, bg: buildGradientBg(customPrimaryColor, '#0E0604', baseBg, gradientStyleId) };
  } else {
    const palette = resolvedPalettes.find((p) => p.id === paletteId) ?? resolvedPalettes[0]!;
    pal = { primary: palette.primary, bg: buildGradientBg(palette.primary, palette.dark, palette.bg, gradientStyleId) };
  }

  const s: BuilderState = {
    cardType: (design.cardType as CardType) ?? 'stamps',
    template,
    palette: paletteId,
    customGradient,
    customPrimary: (design.customPrimary as string) ?? undefined,
    font: fontId,
    customFontUrl,
    customFontFamily,
    businessName: (design.businessName as string) ?? 'Tu Negocio',
    cardName: (design.cardName as string) ?? 'Member Card',
    pattern: patternId,
    pointsStyle: (design.pointsStyle as PointsStyleId) ?? 'number',
    showBadge: (design.showBadge as boolean) ?? false,
    badgeText: (design.badgeText as string) ?? 'Gold Member',
    showMemberNum: (design.showMemberNum as boolean) ?? false,
    qrStyle: (design.qrStyle as BuilderState['qrStyle']) ?? 'simple',
    stampIcon: (design.stampIcon as StampIconId) ?? 'check',
    customStampUrl: (design.customStampUrl as string) ?? undefined,
    stampShape: (design.stampShape as StampShapeId) ?? 'square',
    gradientStyle: (design.gradientStyle as GradientStyleId) ?? 'diagonal',
    customGradDark: (design.customGradDark as string) ?? undefined,
    freeLayout: (design.freeLayout as boolean) ?? false,
    freeElems: Array.isArray(design.freeElems) ? (design.freeElems as FreeLayoutElem[]) : [],
    customLayout: (design.customLayout as CustomLayoutId) ?? 'stack',
    customElemBiz:      (design.customElemBiz      as boolean) ?? true,
    customElemCardName: (design.customElemCardName as boolean) ?? true,
    customElemPoints:   (design.customElemPoints   as boolean) ?? true,
    customElemMember:   (design.customElemMember   as boolean) ?? true,
    customElemQr:       (design.customElemQr       as boolean) ?? true,
    customElemLogo:     (design.customElemLogo     as boolean) ?? true,
    specialEffect: (design.specialEffect as BuilderState['specialEffect']) ?? 'none',
  };

  const CardComp = CARD_RENDERERS[template] ?? ClassicCard;
  const isFree = s.freeLayout && (s.freeElems.length > 0);
  return (
    <>
      {customFontUrl && <link rel="stylesheet" href={customFontUrl} />}
      <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0, ...effectWrapperStyle(s.specialEffect, pal.primary) }}>
        {isFree ? (
          <div style={{ position: 'relative', width: W, height: H }}>
            <CardComp s={s} pal={pal} font={font} pattern={pattern} W={W} H={H} noShadow={noShadow} bgOnly memberNumber={memberNumber} />
            <FreeLayoutOverlay s={s} pal={pal} font={font} pattern={pattern} W={W} H={H} />
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <CardComp s={s} pal={pal} font={font} pattern={pattern} W={W} H={H} noShadow={noShadow} memberNumber={memberNumber} />
            <SpecialEffectOverlay effect={s.specialEffect} primary={pal.primary} />
          </div>
        )}
      </div>
    </>
  );
}
