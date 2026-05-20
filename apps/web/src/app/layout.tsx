import type { Metadata, Viewport } from 'next';
import {
  Syne, Space_Grotesk, Outfit, Nunito,
  Playfair_Display, DM_Sans, Cormorant_Garamond, Lato,
  Plus_Jakarta_Sans, Bebas_Neue, Inter, Josefin_Sans, Source_Serif_4,
  Raleway, Montserrat, Poppins, Cinzel, Fraunces,
} from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import './globals.css';

// ── Display fonts ──────────────────────────────────────────────
const syne = Syne({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-outfit', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-nunito', display: 'swap' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-playfair', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-dm-sans', display: 'swap' });
const cormorantGaramond = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-lato', display: 'swap' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-inter', display: 'swap' });
const josefinSans = Josefin_Sans({ subsets: ['latin'], weight: ['300', '400', '600', '700'], variable: '--font-josefin', display: 'swap' });
const sourceSerif4 = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-source-serif', display: 'swap' });
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-raleway', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-montserrat', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '700', '800'], variable: '--font-poppins', display: 'swap' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-cinzel', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '700', '900'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    syne.variable, spaceGrotesk.variable, outfit.variable, nunito.variable,
    playfairDisplay.variable, dmSans.variable, cormorantGaramond.variable, lato.variable,
    plusJakartaSans.variable, bebasNeue.variable, inter.variable, josefinSans.variable,
    sourceSerif4.variable, raleway.variable, montserrat.variable, poppins.variable,
    cinzel.variable, fraunces.variable,
  ].join(' ');

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Inline script runs before paint — prevents theme flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sellio-theme');if(t==='dark'||t==='light'){document.documentElement.classList.add(t)}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={fontVars}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
