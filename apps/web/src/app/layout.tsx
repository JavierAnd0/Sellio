import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Syne } from 'next/font/google';

import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sellio',
    template: '%s · Sellio',
  },
  description: 'Loyalty cards digitales para tu negocio. Sin código. Sin complicaciones.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Sellio',
    description: 'Loyalty cards digitales para tu negocio.',
    url: '/',
    siteName: 'Sellio',
    locale: 'es_CO',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#F5F0EB' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${syne.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
}
