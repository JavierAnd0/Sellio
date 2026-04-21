export interface Palette {
  name: string;
  primary: string;
  bg: string;
}

export const PALETTES: Palette[] = [
  {
    name: 'Coral',
    primary: '#E8341A',
    bg: 'linear-gradient(135deg,#1A0A06 0%,#3D1408 55%,#E8341A 100%)',
  },
  {
    name: 'Índigo',
    primary: '#5B3FE8',
    bg: 'linear-gradient(135deg,#0A0616 0%,#1D0D4A 55%,#5B3FE8 100%)',
  },
  {
    name: 'Esmeralda',
    primary: '#1A8C5B',
    bg: 'linear-gradient(135deg,#021208 0%,#0A3320 55%,#1A8C5B 100%)',
  },
  {
    name: 'Ámbar',
    primary: '#C17D3C',
    bg: 'linear-gradient(135deg,#100B04 0%,#2E1E08 55%,#C17D3C 100%)',
  },
  {
    name: 'Violeta',
    primary: '#9B3FE8',
    bg: 'linear-gradient(135deg,#0A0616 0%,#260A4A 55%,#9B3FE8 100%)',
  },
  {
    name: 'Teal',
    primary: '#1A8C8C',
    bg: 'linear-gradient(135deg,#021212 0%,#0A3333 55%,#1A8C8C 100%)',
  },
];

export const CATEGORIES = [
  { value: 'cafe', label: '☕ Café / Cafetería' },
  { value: 'restaurant', label: '🍽 Restaurante' },
  { value: 'bakery', label: '🥐 Panadería / Pastelería' },
  { value: 'salon', label: '✂️ Salón / Barbería' },
  { value: 'gym', label: '💪 Gimnasio / Spa' },
  { value: 'retail', label: '🛍 Tienda / Retail' },
  { value: 'pharmacy', label: '💊 Farmacia / Salud' },
  { value: 'other', label: '🏪 Otro' },
] as const;
