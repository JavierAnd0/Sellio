'use client';
import type { LucideIcon } from 'lucide-react';
import {
  Check, Star, Heart, Gift,
  Coffee, Croissant, CupSoda, IceCream, Cake, Bean, Milk, Cookie,
  Utensils, Pizza, ChefHat, Sandwich, Beef, Fish, Salad, Soup,
  Scissors, Sparkles, Flower, Droplets, Wind, Smile, Moon, Sun,
  ShoppingBag, Tag, Shirt, Glasses, Watch, Gem, Footprints, Crown,
  Dumbbell, Bike, Trophy, Zap, Music, Headphones, Gamepad2, Camera,
  Car, Plane, Home, Leaf, Globe, Rocket, Shield, Flame,
  Image as ImageIcon
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────

export type Tier = 'free' | 'basic' | 'elite';
export type TemplateId = 'classic' | 'bold' | 'split' | 'luxury' | 'stamp' | 'minimal' | 'custom';
export type CustomLayoutId = 'stack' | 'centered' | 'split';
export type PointsStyleId = 'number' | 'bar' | 'stamps' | 'stars';
export type TabId = 'templates' | 'background' | 'colors' | 'typography' | 'elements';
export type StampIconId =
  | 'check' | 'star' | 'heart' | 'gift'
  | 'coffee' | 'croissant' | 'cup-soda' | 'ice-cream'
  | 'utensils' | 'pizza' | 'chef-hat' | 'sandwich'
  | 'scissors' | 'sparkles' | 'flower' | 'droplets'
  | 'shopping-bag' | 'tag' | 'shirt' | 'glasses'
  | 'custom';

export interface Palette { id: string; primary: string; bg: string; name: string }
export interface CustomGradient { id: string; primary: string; bg: string; name: string }
export interface FontOption { id: string; display: string; body: string; name: string; tier: Tier }
export interface BuilderState {
  template: TemplateId;
  palette: string;
  customGradient: CustomGradient | null;
  customPrimary?: string;
  font: string;
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
  // ── Custom template controls ──────────────────────────────────
  customLayout: CustomLayoutId;
  customElemBiz: boolean;
  customElemCardName: boolean;
  customElemPoints: boolean;
  customElemMember: boolean;
  customElemQr: boolean;
  customElemLogo: boolean;
}

// ── Data ──────────────────────────────────────────────────────

export const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, elite: 2 };
export const canUse = (tier: Tier, required: string) =>
  TIER_ORDER[tier] >= TIER_ORDER[required as Tier];

export const BASE_PALETTES: Palette[] = [
  { id: 'coral',   primary: '#E8341A', bg: 'linear-gradient(135deg,#1A0806 0%,#3A1006 55%,#E8341A 100%)', name: 'Coral' },
  { id: 'indigo',  primary: '#5B3FE8', bg: 'linear-gradient(135deg,#09061A 0%,#1A0D4A 55%,#5B3FE8 100%)', name: 'Índigo' },
  { id: 'emerald', primary: '#1A8C5B', bg: 'linear-gradient(135deg,#021208 0%,#083220 55%,#1A8C5B 100%)', name: 'Esmeralda' },
  { id: 'amber',   primary: '#C17D3C', bg: 'linear-gradient(135deg,#100B04 0%,#2E1E08 55%,#C17D3C 100%)', name: 'Ámbar' },
  { id: 'violet',  primary: '#9B3FE8', bg: 'linear-gradient(135deg,#0A0618 0%,#22084A 55%,#9B3FE8 100%)', name: 'Violeta' },
  { id: 'teal',    primary: '#00A8A0', bg: 'linear-gradient(135deg,#021010 0%,#083030 55%,#00A8A0 100%)', name: 'Teal' },
];


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
  { id: 'playfair',   display: 'Playfair Display',  body: 'DM Sans',          name: 'Playfair + DM Sans',         tier: 'basic' },
  { id: 'cormorant',  display: 'Cormorant Garamond', body: 'Lato',            name: 'Cormorant + Lato',           tier: 'basic' },
  { id: 'cabinet',    display: 'Plus Jakarta Sans',   body: 'Space Grotesk',   name: 'Jakarta + Grotesk',          tier: 'basic' },
  { id: 'bebas',      display: 'Bebas Neue',         body: 'Inter',           name: 'Bebas Neue + Inter',         tier: 'basic' },
  { id: 'josefin',    display: 'Josefin Sans',       body: 'Source Serif 4',  name: 'Josefin + Source Serif',     tier: 'elite' },
  { id: 'mono',       display: 'Space Grotesk',      body: 'Space Grotesk',   name: 'Monoespaciado',              tier: 'elite' },
];

export const TEMPLATES: Array<{ id: TemplateId; name: string; tier: Tier }> = [
  { id: 'classic', name: 'Classic',       tier: 'free'  },
  { id: 'bold',    name: 'Bold',          tier: 'basic' },
  { id: 'split',   name: 'Split',         tier: 'basic' },
  { id: 'luxury',  name: 'Luxury',        tier: 'elite' },
  { id: 'stamp',   name: 'Stamp',         tier: 'basic' },
  { id: 'minimal', name: 'Minimal',       tier: 'basic' },
  { id: 'custom',  name: 'Personalizada', tier: 'free'  },
];

export const BADGE_OPTIONS = ['Gold Member', 'Silver Member', 'Bronze Member', 'VIP', 'Founding Member', 'Loyal Customer'];
export const POINTS_STYLES: Array<{ id: PointsStyleId; label: string; tier: Tier }> = [
  { id: 'number', label: 'Número',    tier: 'free' },
  { id: 'bar',    label: 'Barra',     tier: 'basic' },
  { id: 'stamps', label: 'Sellos',    tier: 'basic' },
  { id: 'stars',  label: 'Estrellas', tier: 'elite' },
];

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
export const STAMP_ICONS_EXTENDED: Array<{ id: StampIconId | string; label: string; icon: LucideIcon; tier: Tier; category: string }> = [
  // Generic
  { id: 'check', label: 'Check', icon: Check, tier: 'free', category: 'Genéricos' },
  { id: 'star', label: 'Estrella', icon: Star, tier: 'basic', category: 'Genéricos' },
  { id: 'heart', label: 'Corazón', icon: Heart, tier: 'basic', category: 'Genéricos' },
  { id: 'gift', label: 'Regalo', icon: Gift, tier: 'basic', category: 'Genéricos' },
  { id: 'crown', label: 'Corona', icon: Crown, tier: 'basic', category: 'Genéricos' },
  { id: 'gem', label: 'Gema', icon: Gem, tier: 'basic', category: 'Genéricos' },
  { id: 'shield', label: 'Escudo', icon: Shield, tier: 'basic', category: 'Genéricos' },
  { id: 'flame', label: 'Fuego', icon: Flame, tier: 'basic', category: 'Genéricos' },
  { id: 'zap', label: 'Rayo', icon: Zap, tier: 'basic', category: 'Genéricos' },
  // Café
  { id: 'coffee', label: 'Café', icon: Coffee, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'croissant', label: 'Croissant', icon: Croissant, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'cup-soda', label: 'Bebida', icon: CupSoda, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'ice-cream', label: 'Helado', icon: IceCream, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'cake', label: 'Pastel', icon: Cake, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'bean', label: 'Grano', icon: Bean, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'milk', label: 'Leche', icon: Milk, tier: 'basic', category: 'Cafetería & Snacks' },
  { id: 'cookie', label: 'Galleta', icon: Cookie, tier: 'basic', category: 'Cafetería & Snacks' },
  // Restaurante
  { id: 'utensils', label: 'Cubiertos', icon: Utensils, tier: 'basic', category: 'Restaurante' },
  { id: 'pizza', label: 'Pizza', icon: Pizza, tier: 'basic', category: 'Restaurante' },
  { id: 'chef-hat', label: 'Chef', icon: ChefHat, tier: 'basic', category: 'Restaurante' },
  { id: 'sandwich', label: 'Sándwich', icon: Sandwich, tier: 'basic', category: 'Restaurante' },
  { id: 'beef', label: 'Carne', icon: Beef, tier: 'basic', category: 'Restaurante' },
  { id: 'fish', label: 'Pescado', icon: Fish, tier: 'basic', category: 'Restaurante' },
  { id: 'salad', label: 'Ensalada', icon: Salad, tier: 'basic', category: 'Restaurante' },
  { id: 'soup', label: 'Sopa', icon: Soup, tier: 'basic', category: 'Restaurante' },
  // Belleza
  { id: 'scissors', label: 'Tijeras', icon: Scissors, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'sparkles', label: 'Brillos', icon: Sparkles, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'flower', label: 'Flor', icon: Flower, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'droplets', label: 'Gotas', icon: Droplets, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'wind', label: 'Viento', icon: Wind, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'smile', label: 'Sonrisa', icon: Smile, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'moon', label: 'Luna', icon: Moon, tier: 'basic', category: 'Belleza & Salud' },
  { id: 'sun', label: 'Sol', icon: Sun, tier: 'basic', category: 'Belleza & Salud' },
  // Retail
  { id: 'shopping-bag', label: 'Bolsa', icon: ShoppingBag, tier: 'basic', category: 'Retail & Moda' },
  { id: 'tag', label: 'Etiqueta', icon: Tag, tier: 'basic', category: 'Retail & Moda' },
  { id: 'shirt', label: 'Ropa', icon: Shirt, tier: 'basic', category: 'Retail & Moda' },
  { id: 'glasses', label: 'Lentes', icon: Glasses, tier: 'basic', category: 'Retail & Moda' },
  { id: 'watch', label: 'Reloj', icon: Watch, tier: 'basic', category: 'Retail & Moda' },
  { id: 'footprints', label: 'Zapatillas', icon: Footprints, tier: 'basic', category: 'Retail & Moda' },
  // Otros
  { id: 'dumbbell', label: 'Pesas', icon: Dumbbell, tier: 'basic', category: 'Otros' },
  { id: 'bike', label: 'Bicicleta', icon: Bike, tier: 'basic', category: 'Otros' },
  { id: 'trophy', label: 'Trofeo', icon: Trophy, tier: 'basic', category: 'Otros' },
  { id: 'music', label: 'Música', icon: Music, tier: 'basic', category: 'Otros' },
  { id: 'headphones', label: 'Auriculares', icon: Headphones, tier: 'basic', category: 'Otros' },
  { id: 'gamepad2', label: 'Videojuegos', icon: Gamepad2, tier: 'basic', category: 'Otros' },
  { id: 'camera', label: 'Cámara', icon: Camera, tier: 'basic', category: 'Otros' },
  { id: 'car', label: 'Auto', icon: Car, tier: 'basic', category: 'Otros' },
  { id: 'plane', label: 'Avión', icon: Plane, tier: 'basic', category: 'Otros' },
  { id: 'home', label: 'Casa', icon: Home, tier: 'basic', category: 'Otros' },
  { id: 'leaf', label: 'Hoja', icon: Leaf, tier: 'basic', category: 'Otros' },
  { id: 'globe', label: 'Globo', icon: Globe, tier: 'basic', category: 'Otros' },
  { id: 'rocket', label: 'Cohete', icon: Rocket, tier: 'basic', category: 'Otros' },
  // Personalizado
  { id: 'custom', label: 'Subir Imagen', icon: ImageIcon, tier: 'elite', category: 'Personalizado' },
];

// Hoisted constant — avoids allocating a new array on every card render
const STAMP_SLOTS = Array.from({ length: 10 }, (_, i) => i);

export const DEFAULT_BUILDER: BuilderState = {
  template: 'classic',
  palette: 'coral',
  customGradient: null,
  font: 'syne',
  businessName: 'Tu Negocio',
  cardName: 'Tarjeta de Fidelidad',
  pattern: 'none',
  pointsStyle: 'number',
  showBadge: false,
  badgeText: 'Gold Member',
  showMemberNum: false,
  qrStyle: 'simple',
  stampIcon: 'check',
  customLayout: 'stack',
  customElemBiz: true,
  customElemCardName: true,
  customElemPoints: true,
  customElemMember: true,
  customElemQr: true,
  customElemLogo: true,
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
}

// ── Classic ───────────────────────────────────────────────────

export function ClassicCard({ s, pal, font, pattern, W = 380, H = 230, noShadow }: CardProps) {
  return (
    <div style={{ width: W, height: H, background: s.customGradient?.bg ?? pal.bg, borderRadius: 20, padding: '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', transition: 'all 0.3s', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      {pattern.id !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: pattern.css, backgroundSize: pattern.size || undefined, pointerEvents: 'none', borderRadius: 20 }} />
      )}
      <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', border: `1px solid ${pal.primary}20`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: -80, top: -80, width: 260, height: 260, borderRadius: '50%', border: `1px solid ${pal.primary}10`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: H <= 80 ? 8 : 22, position: 'relative' }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 8 : 15, color: pal.primary, letterSpacing: '0.03em', marginBottom: 3 }}>{s.businessName || 'Tu Negocio'}</div>
          <div style={{ fontSize: H <= 80 ? 5 : 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ width: H <= 80 ? 18 : 34, height: H <= 80 ? 18 : 34, borderRadius: 9, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: H <= 80 ? 8 : 14, color: '#fff' }}>S</div>
          {s.showBadge && H > 80 && (<div style={{ background: `${pal.primary}25`, border: `1px solid ${pal.primary}40`, borderRadius: 100, padding: '2px 8px', fontSize: 8, color: pal.primary, fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{s.badgeText}</div>)}
        </div>
      </div>
      {H > 80 && (
        <div style={{ position: 'relative', marginBottom: 20 }}>
          {s.pointsStyle === 'number' && (<><div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1 }}>847</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>puntos acumulados</div></>)}
          {s.pointsStyle === 'bar' && (<><div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: 32, color: '#fff', lineHeight: 1 }}>847 pts</div><div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}><div style={{ height: '100%', width: '68%', background: pal.primary, borderRadius: 2 }} /></div></>)}
          {s.pointsStyle === 'stamps' && (()=>{
            const IconComp = FLAT_STAMP_ICONS.find(x => x.id === s.stampIcon)?.icon || Check;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          {s.showMemberNum && H > 80 && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 2 }}>№ 00847291</div>}
          <div style={{ fontSize: H <= 80 ? 5 : 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Miembro</div>
          <div style={{ fontSize: H <= 80 ? 7 : 12, fontWeight: 500, color: '#fff', marginTop: 2, fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
        </div>
        <QR size={H <= 80 ? 22 : 42} color={s.qrStyle === 'colored' ? pal.primary : 'rgba(255,255,255,0.55)'} />
      </div>
    </div>
  );
}

export function BoldCard({ s, pal, font, W = 380, H = 230, noShadow }: CardProps) {
  return (
    <div style={{ width: W, height: H, background: '#0A0A0A', borderRadius: 20, padding: '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', border: `1px solid ${pal.primary}30`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ position: 'absolute', left: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${pal.primary}15 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: H <= 80 ? 6 : 16, position: 'relative' }}>
        <div style={{ width: H <= 80 ? 18 : 36, height: H <= 80 ? 18 : 36, borderRadius: 9, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: H <= 80 ? 8 : 15, color: '#fff' }}>S</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 6 : 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>
          {s.showBadge && H > 80 && <div style={{ fontSize: 9, color: pal.primary, fontWeight: 700 }}>{s.badgeText}</div>}
        </div>
      </div>
      <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 22 : 52, color: pal.primary, lineHeight: 1, marginBottom: 4 }}>847</div>
      {H > 80 && <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: 16, color: 'rgba(255,255,255,0.15)', marginBottom: 20 }}>puntos</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: H <= 80 ? 7 : 14, color: '#fff' }}>{s.businessName || 'Tu Negocio'}</div>
          {H > 80 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>}
        </div>
        <QR size={H <= 80 ? 22 : 42} color={pal.primary} />
      </div>
    </div>
  );
}

export function SplitCard({ s, pal, font, W = 380, H = 230, noShadow }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, borderRadius: 20, overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.6)', display: 'flex', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ flex: '0 0 44%', background: pal.primary, padding: isSmall ? '10px 8px' : '22px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ width: isSmall ? 14 : 32, height: isSmall ? 14 : 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 13, color: '#fff' }}>S</div>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 16 : 36, color: '#fff', lineHeight: 1 }}>847</div>
          <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>puntos</div>
        </div>
      </div>
      <div style={{ flex: 1, background: '#0D0B09', padding: isSmall ? '10px 8px' : '22px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 7 : 13, color: '#fff', marginBottom: 2 }}>{s.businessName || 'Tu Negocio'}</div>
          <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.cardName || 'Member Card'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: isSmall ? 5 : 8, color: 'rgba(255,255,255,0.3)' }}>Miembro</div>
            <div style={{ fontSize: isSmall ? 7 : 12, color: '#fff', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
          </div>
          <QR size={isSmall ? 20 : 40} color="rgba(255,255,255,0.5)" />
        </div>
      </div>
    </div>
  );
}

export function LuxuryCard({ s, pal, font, W = 380, H = 230, noShadow }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: 'linear-gradient(135deg,#0C0A08,#1A1510)', borderRadius: 20, padding: isSmall ? '10px 12px' : '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? `inset 0 0 0 1px ${pal.primary}30` : `0 32px 80px rgba(0,0,0,0.7), inset 0 0 0 1px ${pal.primary}30`, flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(45deg, ${pal.primary}06 0px, ${pal.primary}06 1px, transparent 1px, transparent 12px)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isSmall ? 6 : 18, position: 'relative' }}>
        <div>
          {!isSmall && <div style={{ fontSize: 8, color: pal.primary, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5 }}>Sellio Loyalty</div>}
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 700, fontSize: isSmall ? 8 : 16, color: '#fff' }}>{s.businessName || 'Tu Negocio'}</div>
        </div>
        {s.showBadge && !isSmall && (<div style={{ background: `linear-gradient(135deg,${pal.primary},${pal.primary}AA)`, borderRadius: 100, padding: '3px 10px', fontSize: 8, color: '#fff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.badgeText}</div>)}
      </div>
      <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 24 : 48, color: '#fff', lineHeight: 1, marginBottom: 4, position: 'relative' }}>847</div>
      {!isSmall && <div style={{ fontSize: 8, color: `${pal.primary}99`, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24, position: 'relative' }}>puntos de lealtad</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          {!isSmall && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>TITULAR</div>}
          <div style={{ fontSize: isSmall ? 7 : 12, color: '#fff', fontFamily: `'${font.body}', sans-serif`, marginTop: isSmall ? 0 : 2 }}>Ana García</div>
        </div>
        <QR size={isSmall ? 20 : 44} color={pal.primary} />
      </div>
    </div>
  );
}

export function StampCard({ s, pal, font, W = 380, H = 230, noShadow }: CardProps) {
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
          const IconComp = FLAT_STAMP_ICONS.find(x => x.id === s.stampIcon)?.icon || Check;
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
          <div style={{ fontSize: isSmall ? 5 : 9, color: 'rgba(255,255,255,0.3)' }}>Miembro</div>
          <div style={{ fontSize: isSmall ? 7 : 11, color: '#fff', fontFamily: `'${font.body}', sans-serif` }}>Ana García</div>
        </div>
        {!isSmall && (<div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}><div>{stamps}/10 sellos</div><div style={{ fontSize: 8, marginTop: 2 }}>1 café gratis al completar</div></div>)}
      </div>
    </div>
  );
}

export function MinimalCard({ s, pal, font, W = 380, H = 230, noShadow }: CardProps) {
  const isSmall = H <= 80;
  return (
    <div style={{ width: W, height: H, background: '#F5F0EB', borderRadius: 20, padding: isSmall ? '10px 12px' : '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: noShadow ? 'none' : '0 32px 80px rgba(0,0,0,0.4)', flexShrink: 0, fontFamily: `'${font.display}', sans-serif` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isSmall ? 6 : 16 }}>
        <div>
          <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 8 : 15, color: '#0A0A0A' }}>{s.businessName || 'Tu Negocio'}</div>
          {!isSmall && <div style={{ fontSize: 9, color: '#9A9490', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>{s.cardName || 'Member Card'}</div>}
        </div>
        <div style={{ width: isSmall ? 16 : 32, height: isSmall ? 16 : 32, borderRadius: 8, background: pal.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: isSmall ? 7 : 13, color: '#fff' }}>S</div>
      </div>
      <div style={{ fontFamily: `'${font.display}', sans-serif`, fontWeight: 800, fontSize: isSmall ? 22 : 48, color: '#0A0A0A', lineHeight: 1, marginBottom: 4 }}>847</div>
      {!isSmall && <div style={{ fontSize: 9, color: '#9A9490', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>puntos</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: isSmall ? 5 : 8, color: '#C0BCB8' }}>Miembro · Ana García</div>
          {s.showBadge && !isSmall && <div style={{ fontSize: 8, color: pal.primary, fontWeight: 700, marginTop: 2 }}>{s.badgeText}</div>}
        </div>
        <QR size={isSmall ? 20 : 40} color="#0A0A0A" />
      </div>
    </div>
  );
}

// ── Custom ─────────────────────────────────────────────────────

export function CustomCard({ s, pal, font, pattern, W = 380, H = 230, noShadow }: CardProps) {
  const isSmall = H <= 80;
  const layout = s.customLayout ?? 'stack';
  const show = {
    biz:      s.customElemBiz,
    cardName: s.customElemCardName,
    points:   s.customElemPoints,
    member:   s.customElemMember,
    qr:       s.customElemQr,
    logo:     s.customElemLogo,
  };
  const bg = s.customGradient?.bg ?? (s.customPrimary
    ? `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${s.customPrimary} 100%)`
    : pal.bg);
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

export const CARD_RENDERERS: Record<TemplateId, React.ComponentType<CardProps>> = {
  classic: ClassicCard,
  bold: BoldCard,
  split: SplitCard,
  luxury: LuxuryCard,
  stamp: StampCard,
  minimal: MinimalCard,
  custom: CustomCard,
};

// ── CardFromDesign — renders any card from stored design JSON ──

interface CardFromDesignProps {
  design: Record<string, unknown>;
  primaryColor?: string;
  W?: number;
  H?: number;
  noShadow?: boolean;
}

export function CardFromDesign({ design, primaryColor = '#E8341A', W = 380, H = 230, noShadow }: CardFromDesignProps) {
  const template = (design.template as TemplateId) ?? 'classic';
  const paletteId = (design.palette as string) ?? 'coral';
  const customGradient = (design.customGradient as CustomGradient | null) ?? null;
  const fontId = (design.font as string) ?? 'syne';
  const patternId = (design.pattern as string) ?? 'none';

  const font = FONTS.find((f) => f.id === fontId) ?? FONTS[0]!;
  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0]!;

  const resolvedPalettes = BASE_PALETTES.map((p) =>
    p.id === 'coral'
      ? { ...p, primary: primaryColor, bg: `linear-gradient(135deg,#1A0806 0%,#3A1006 55%,${primaryColor} 100%)` }
      : p,
  );
  const pal: { primary: string; bg: string } =
    customGradient ?? resolvedPalettes.find((p) => p.id === paletteId) ?? resolvedPalettes[0]!;

  const s: BuilderState = {
    template,
    palette: paletteId,
    customGradient,
    customPrimary: (design.customPrimary as string) ?? undefined,
    font: fontId,
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
    customLayout: (design.customLayout as CustomLayoutId) ?? 'stack',
    customElemBiz:      (design.customElemBiz      as boolean) ?? true,
    customElemCardName: (design.customElemCardName as boolean) ?? true,
    customElemPoints:   (design.customElemPoints   as boolean) ?? true,
    customElemMember:   (design.customElemMember   as boolean) ?? true,
    customElemQr:       (design.customElemQr       as boolean) ?? true,
    customElemLogo:     (design.customElemLogo     as boolean) ?? true,
  };

  const CardComp = CARD_RENDERERS[template] ?? ClassicCard;
  return <CardComp s={s} pal={pal} font={font} pattern={pattern} W={W} H={H} noShadow={noShadow} />;
}
