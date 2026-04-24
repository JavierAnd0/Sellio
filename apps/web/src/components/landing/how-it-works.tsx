const STEPS = [
  {
    n: '01',
    title: 'Crea tu tarjeta',
    desc: 'Personaliza colores, tipografía y logo de tu negocio. Tu tarjeta lista en menos de 5 minutos.',
    highlight: false,
  },
  {
    n: '02',
    title: 'Comparte con tus clientes',
    desc: 'Genera un QR único. Tus clientes escanean y se unen a tu programa de lealtad al instante.',
    highlight: true,
  },
  {
    n: '03',
    title: 'Valida y premia',
    desc: 'Usa el dashboard de Sellio para validar visitas y sumar puntos. Sin hardware adicional.',
    highlight: false,
  },
];

const STEP_RADIUS = [
  'rounded-2xl md:rounded-r-none md:rounded-l-2xl',
  'rounded-2xl md:rounded-none',
  'rounded-2xl md:rounded-l-none md:rounded-r-2xl',
];

export default function LandingHowItWorks() {
  return (
    <section
      id="como"
      className="py-24 lg:py-[120px] px-4 sm:px-8 lg:px-[60px] bg-bg border-t border-border/8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start md:items-end justify-between mb-14 lg:mb-20 flex-col md:flex-row gap-4 md:gap-8">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-coral uppercase font-semibold mb-3">
              Cómo funciona
            </div>
            <h2
              className="font-display font-black text-fg tracking-tighter leading-[1.05]"
              style={{ fontSize: 'clamp(36px, 4.5vw, 52px)' }}
            >
              Simple por diseño.
            </h2>
          </div>
          <p className="text-[15px] text-muted md:max-w-[280px] leading-relaxed md:text-right">
            De cero a tu primer cliente fidelizado en menos de 10 minutos.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0.5">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`relative overflow-hidden p-8 md:p-10 lg:p-12 ${STEP_RADIUS[i]} ${
                step.highlight ? 'bg-coral' : 'bg-surface'
              }`}
            >
              {/* Ghost number */}
              <div
                className="absolute right-6 top-4 font-display font-black leading-none select-none pointer-events-none"
                style={{
                  fontSize: 80,
                  color: step.highlight
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgb(var(--fg) / 0.05)',
                }}
              >
                {step.n}
              </div>

              <div
                className={`font-display font-black text-[13px] tracking-[0.1em] mb-5 relative ${
                  step.highlight ? 'text-white/60' : 'text-coral'
                }`}
              >
                {step.n}
              </div>

              <h3
                className={`font-display font-black text-[22px] lg:text-[26px] tracking-tight leading-snug mb-4 relative ${
                  step.highlight ? 'text-white' : 'text-fg'
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-[14px] leading-relaxed relative ${
                  step.highlight ? 'text-white/75' : 'text-muted'
                }`}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
