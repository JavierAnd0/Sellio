import LandingNav from '@/components/landing/nav';
import LandingHero from '@/components/landing/hero';
import LandingLogoBar from '@/components/landing/logo-bar';
import LandingHowItWorks from '@/components/landing/how-it-works';
import LandingFeatures from '@/components/landing/features';
import LandingPricing from '@/components/landing/pricing';
import LandingCTA from '@/components/landing/cta';
import LandingFooter from '@/components/landing/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sellio — Loyalty Cards para tu negocio',
  description:
    'Crea tarjetas de lealtad digitales en minutos — sin código, sin complicaciones. Fideliza a tus clientes con Sellio.',
  openGraph: {
    title: 'Sellio — Loyalty Cards para tu negocio',
    description:
      'Crea tarjetas de lealtad digitales en minutos — sin código, sin complicaciones.',
  },
};

export default function HomePage() {
  return (
    <main>
      <LandingNav />
      <LandingHero />
      <LandingLogoBar />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
