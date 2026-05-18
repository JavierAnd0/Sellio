import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0D0B09',
        color: '#F5F0EB',
        fontFamily: 'Space Grotesk, sans-serif',
        padding: '32px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 24, opacity: 0.6 }}>404</div>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: '#E8341A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 22,
          color: '#fff',
          marginBottom: 28,
        }}
      >
        S
      </div>
      <h1
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 28,
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}
      >
        Página no encontrada
      </h1>
      <p style={{ fontSize: 15, color: '#6B6560', maxWidth: 320, lineHeight: 1.6, marginBottom: 36 }}>
        La página que buscas no existe o fue movida. Vuelve al inicio.
      </p>
      <Link
        href="/app/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#E8341A',
          color: '#fff',
          borderRadius: 10,
          padding: '12px 24px',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        Ir al inicio →
      </Link>
    </div>
  );
}
