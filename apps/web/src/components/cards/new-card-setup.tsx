'use client';

import { type FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight } from 'lucide-react';

import { createCardAction } from '@/actions/cards/card.actions';

interface NewCardSetupProps {
  orgName: string;
  primaryColor: string;
}

const FIELD: React.CSSProperties = {
  width: '100%',
  background: '#1A1712',
  border: '1px solid rgba(245,240,235,0.12)',
  borderRadius: 9,
  padding: '11px 14px',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 14,
  color: '#F5F0EB',
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#6B6560',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

const HINT: React.CSSProperties = {
  fontSize: 11,
  color: '#4A4540',
  marginTop: 5,
};

export function NewCardSetup({ orgName, primaryColor }: NewCardSetupProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [cardName, setCardName] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [pointsPerCheckin, setPointsPerCheckin] = useState(1);
  const [pointsForReward, setPointsForReward] = useState(10);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const fd = new FormData();
    fd.set('name', cardName);
    fd.set('description', description);
    fd.set('pointsPerCheckin', String(pointsPerCheckin));
    fd.set('pointsForReward', String(pointsForReward));
    fd.set('rewardDescription', rewardDescription);
    fd.set('design', JSON.stringify({
      businessName: orgName,
      cardName,
      template: 'classic',
      palette: 'coral',
      font: 'syne',
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
    }));

    startTransition(async () => {
      const result = await createCardAction(fd);
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
        return;
      }
      router.push(`/app/cards/${result.cardId}/builder`);
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#0D0B09',
      color: '#F5F0EB',
      height: '100vh',
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      {/* Top bar — idéntica al builder */}
      <div style={{ height: 48, background: '#111009', borderBottom: '1px solid rgba(245,240,235,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
        <Link
          href="/app/cards"
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6560', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#F5F0EB'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#6B6560'; }}
        >
          <ChevronLeft size={14} /> Salir
        </Link>
        <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#fff' }}>S</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15 }}>Sellio<span style={{ color: primaryColor }}>.</span></span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
        <span style={{ fontSize: 12, color: '#6B6560' }}>Nueva tarjeta</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F5F0EB', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Configura tu tarjeta
            </h1>
            <p style={{ fontSize: 14, color: '#6B6560', lineHeight: 1.6 }}>
              Primero define cómo funciona el programa. Luego diseñas el aspecto visual.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Nombre */}
            <div>
              <label style={LABEL}>Nombre de la tarjeta *</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder='ej: "Tarjeta VIP", "Sello Café"'
                maxLength={60}
                required
                style={{
                  ...FIELD,
                  borderColor: fieldErrors.name ? '#F87171' : 'rgba(245,240,235,0.12)',
                }}
              />
              {fieldErrors.name && <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.name}</span>}
            </div>

            {/* Recompensa */}
            <div>
              <label style={LABEL}>Recompensa *</label>
              <input
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                placeholder='ej: "1 café gratis", "10% de descuento"'
                maxLength={100}
                required
                style={{
                  ...FIELD,
                  borderColor: fieldErrors.rewardDescription ? '#F87171' : 'rgba(245,240,235,0.12)',
                }}
              />
              {fieldErrors.rewardDescription
                ? <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.rewardDescription}</span>
                : <span style={HINT}>Qué recibe el cliente al completar los puntos</span>
              }
            </div>

            {/* Puntos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LABEL}>Puntos por visita *</label>
                <input
                  type="number"
                  value={pointsPerCheckin}
                  onChange={(e) => setPointsPerCheckin(Math.max(1, Number(e.target.value) || 1))}
                  min={1}
                  required
                  style={{
                    ...FIELD,
                    borderColor: fieldErrors.pointsPerCheckin ? '#F87171' : 'rgba(245,240,235,0.12)',
                  }}
                />
                {fieldErrors.pointsPerCheckin && <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.pointsPerCheckin}</span>}
              </div>
              <div>
                <label style={LABEL}>Puntos para recompensa *</label>
                <input
                  type="number"
                  value={pointsForReward}
                  onChange={(e) => setPointsForReward(Math.max(1, Number(e.target.value) || 1))}
                  min={1}
                  required
                  style={{
                    ...FIELD,
                    borderColor: fieldErrors.pointsForReward ? '#F87171' : 'rgba(245,240,235,0.12)',
                  }}
                />
                {fieldErrors.pointsForReward && <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.pointsForReward}</span>}
              </div>
            </div>

            {/* Resumen visual */}
            <div style={{ background: '#111009', border: '1px solid rgba(245,240,235,0.07)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#6B6560', lineHeight: 1.8 }}>
              <span style={{ color: '#F5F0EB', fontWeight: 600 }}>Lógica:</span>{' '}
              cada visita suma <span style={{ color: primaryColor, fontWeight: 700 }}>{pointsPerCheckin} {pointsPerCheckin === 1 ? 'punto' : 'puntos'}</span>.
              Al llegar a <span style={{ color: primaryColor, fontWeight: 700 }}>{pointsForReward}</span>,
              el cliente gana{' '}
              <span style={{ color: '#F5F0EB', fontWeight: 600 }}>
                {rewardDescription || '(tu recompensa)'}
              </span>.
            </div>

            {/* Descripción opcional */}
            <div>
              <label style={LABEL}>Descripción <span style={{ color: '#4A4540', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='ej: "Acumula puntos en cada compra"'
                maxLength={200}
                style={FIELD}
              />
            </div>

            {/* Error global */}
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F87171' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: isPending ? '#6B6560' : primaryColor,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '14px 24px',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 15,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                marginTop: 4,
              }}
            >
              {isPending ? 'Creando...' : 'Crear y diseñar'}
              {!isPending && <ArrowRight size={16} />}
            </button>

            <p style={{ fontSize: 11, color: '#4A4540', textAlign: 'center' }}>
              Podrás cambiar todo esto después desde el builder
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
