'use client';

const FEATURES = [
  { icon: '✦', title: 'Editor visual', desc: 'Arrastra, suelta y personaliza. Colores, tipografías y logos — todo sin código.' },
  { icon: '⬡', title: 'QR inteligente', desc: 'Cada tarjeta genera un QR único con seguridad HMAC. Anti-fraude desde el día 1.' },
  { icon: '◈', title: 'Impresión física', desc: 'Descarga tu tarjeta en formato estándar (85×54mm). Lista para imprimir en casa o imprenta.' },
  { icon: '◉', title: 'Analytics real', desc: 'Entiende cuándo vienen, cuánto gastan y qué los hace volver.' },
  { icon: '⬟', title: 'Multi-sucursal', desc: 'Gestiona varias ubicaciones desde un solo dashboard. Perfecto para cadenas.' },
  { icon: '◇', title: 'API + Webhooks', desc: 'Conecta Sellio con tu POS o e-commerce. Documentación clara, SDKs listos.' },
];

const FEAT_RADIUS = [
  'rounded-2xl lg:rounded-br-none lg:rounded-bl-none lg:rounded-tr-none lg:rounded-tl-2xl',
  'rounded-2xl lg:rounded-none',
  'rounded-2xl lg:rounded-bl-none lg:rounded-br-none lg:rounded-tl-none lg:rounded-tr-2xl',
  'rounded-2xl lg:rounded-tr-none lg:rounded-tl-none lg:rounded-br-none lg:rounded-bl-2xl',
  'rounded-2xl lg:rounded-none',
  'rounded-2xl lg:rounded-tl-none lg:rounded-tr-none lg:rounded-bl-none lg:rounded-br-2xl',
];

export default function LandingFeatures() {
  return (
    <section
      id="funcionalidades"
      className="py-24 lg:py-[120px] px-4 sm:px-8 lg:px-[60px] bg-bg border-t border-border/8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 lg:mb-20">
          <div className="text-[10px] tracking-[0.2em] text-coral uppercase font-semibold mb-3">
            Funcionalidades
          </div>
          <h2
            className="font-display font-black text-fg tracking-tighter leading-[1.05]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 52px)' }}
          >
            Todo lo que<br />necesitas.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-0.5">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className={`p-8 lg:p-10 transition-colors duration-200 cursor-default bg-surface hover:bg-surface-2 ${FEAT_RADIUS[i]}`}
            >
              <div className="font-display text-2xl text-coral mb-5">{feat.icon}</div>
              <h3 className="font-display font-black text-[18px] text-fg tracking-tight mb-3">
                {feat.title}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
