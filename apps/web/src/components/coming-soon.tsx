import { Wrench } from 'lucide-react';

interface ComingSoonProps {
  feature?: string;
}

export function ComingSoon({ feature }: ComingSoonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'rgba(232,52,26,0.1)',
          border: '1px solid rgba(232,52,26,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Wrench size={28} color="#E8341A" strokeWidth={1.5} />
      </div>
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 22,
          marginBottom: 10,
          letterSpacing: '-0.02em',
          color: '#F5F0EB',
        }}
      >
        {feature ? `${feature}` : 'Próximamente'}
      </h2>
      <p style={{ fontSize: 14, color: '#6B6560', maxWidth: 300, lineHeight: 1.7 }}>
        Estamos trabajando en ello. Pronto estará en funcionamiento.
      </p>
    </div>
  );
}
