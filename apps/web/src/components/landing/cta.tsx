import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section className="py-24 lg:py-[120px] px-4 sm:px-8 lg:px-[60px] bg-surface border-t border-border/8">
      <div className="max-w-3xl mx-auto text-center">
        {/* Logo mark */}
        <div className="w-14 h-14 rounded-2xl bg-coral flex items-center justify-center font-display font-black text-2xl text-white mx-auto mb-8">
          S
        </div>

        <h2
          className="font-display font-black text-fg tracking-tighter leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(44px, 5.5vw, 60px)' }}
        >
          Tu primera tarjeta,<br />en 5 minutos.
        </h2>

        <p className="text-[16px] text-muted leading-[1.7] mb-12 max-w-[480px] mx-auto">
          Sin comisiones. Sin tarjeta de crédito. Solo tú, tus clientes y su lealtad.
        </p>

        <Link
          href="/register"
          className="inline-flex items-center gap-3 font-display font-black text-[16px] text-white bg-coral px-11 py-5 rounded-xl tracking-[0.01em] transition-all duration-200 hover:-translate-y-1"
          style={{ boxShadow: '0 8px 40px rgba(232,52,26,0.4)' }}
        >
          Crear cuenta gratis <span className="text-xl">→</span>
        </Link>
      </div>
    </section>
  );
}
