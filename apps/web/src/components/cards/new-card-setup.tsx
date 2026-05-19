'use client';

import { type FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight, Hash, Stamp } from 'lucide-react';

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

type CardType = 'stamps' | 'points';

export function NewCardSetup({ orgName, primaryColor }: NewCardSetupProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [cardType, setCardType] = useState<CardType | null>(null);
  const [cardName, setCardName] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [stampCount, setStampCount] = useState(10);
  const [pointsPerCheckin, setPointsPerCheckin] = useState(10);
  const [pointsForReward, setPointsForReward] = useState(100);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardType) return;
    setError(null);
    setFieldErrors({});

    const resolvedPointsPerCheckin = cardType === 'stamps' ? 1 : pointsPerCheckin;
    const resolvedPointsForReward = cardType === 'stamps' ? stampCount : pointsForReward;

    const fd = new FormData();
    fd.set('name', cardName);
    fd.set('description', description);
    fd.set('pointsPerCheckin', String(resolvedPointsPerCheckin));
    fd.set('pointsForReward', String(resolvedPointsForReward));
    fd.set('rewardDescription', rewardDescription);
    fd.set('design', JSON.stringify({
      cardType,
      businessName: orgName,
      cardName,
      template: 'classic',
      palette: 'coral',
      font: 'syne',
      pattern: 'none',
      pointsStyle: cardType === 'stamps' ? 'stamps' : 'number',
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

  // ── Step 1: choose card type ──────────────────────────────────
  if (!cardType) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', background: '#0D0B09', color: '#F5F0EB', height: '100vh', fontFamily: 'Space Grotesk, sans-serif' }}>
        {/* Top bar */}
        <div style={{ height: 48, background: '#111009', borderBottom: '1px solid rgba(245,240,235,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
          <Link href="/app/cards" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6560', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#F5F0EB'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#6B6560'; }}>
            <ChevronLeft size={14} /> Salir
          </Link>
          <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#fff' }}>S</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15 }}>Sellio<span style={{ color: primaryColor }}>.</span></span>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
          <span style={{ fontSize: 12, color: '#6B6560' }}>Nueva tarjeta · Paso 1 de 2</span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F5F0EB', marginBottom: 8, letterSpacing: '-0.02em' }}>
              ¿Cómo funciona tu tarjeta?
            </h1>
            <p style={{ fontSize: 14, color: '#6B6560', lineHeight: 1.6, marginBottom: 36 }}>
              Esta decisión es permanente. Define cómo tus clientes acumulan beneficios.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Sellos */}
              <button
                type="button"
                onClick={() => setCardType('stamps')}
                style={{
                  background: '#111009',
                  border: '1.5px solid rgba(245,240,235,0.1)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = primaryColor;
                  (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,240,235,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.background = '#111009';
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${primaryColor}18`, border: `1px solid ${primaryColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stamp size={22} color={primaryColor} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F5F0EB', marginBottom: 6 }}>Sellos</div>
                  <div style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6 }}>
                    El cliente acumula <strong style={{ color: '#F5F0EB' }}>1 sello por visita</strong> hasta completar la tarjeta.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                  {[1,1,1,1,1,0,0,0,0,0].map((f, i) => (
                    <div key={i} style={{ width: 18, height: 18, borderRadius: 5, background: f ? primaryColor : 'rgba(245,240,235,0.08)', border: f ? 'none' : '1px solid rgba(245,240,235,0.12)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: primaryColor, fontWeight: 600 }}>Ideal para cafeterías, restaurantes →</div>
              </button>

              {/* Puntos */}
              <button
                type="button"
                onClick={() => setCardType('points')}
                style={{
                  background: '#111009',
                  border: '1.5px solid rgba(245,240,235,0.1)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#A78BFA';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(167,139,250,0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,240,235,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.background = '#111009';
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Hash size={22} color="#A78BFA" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F5F0EB', marginBottom: 6 }}>Puntos</div>
                  <div style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6 }}>
                    El cliente acumula <strong style={{ color: '#F5F0EB' }}>puntos por compra</strong> y los canjea por recompensas.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#A78BFA' }}>247</span>
                  <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.5)', fontWeight: 600 }}>/ 500 pts</span>
                </div>
                <div style={{ fontSize: 11, color: '#A78BFA', fontWeight: 600 }}>Ideal para tiendas, spas, academias →</div>
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#3A3530', textAlign: 'center', marginTop: 24 }}>
              Esta elección no se puede cambiar después de crear la tarjeta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: configure card ────────────────────────────────────
  const isStamps = cardType === 'stamps';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#0D0B09', color: '#F5F0EB', height: '100vh', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 48, background: '#111009', borderBottom: '1px solid rgba(245,240,235,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setCardType(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B6560', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F5F0EB'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#6B6560'; }}
        >
          <ChevronLeft size={14} /> Volver
        </button>
        <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#fff' }}>S</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15 }}>Sellio<span style={{ color: primaryColor }}>.</span></span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(245,240,235,0.12)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: '2px 8px', borderRadius: 5, background: isStamps ? `${primaryColor}20` : 'rgba(167,139,250,0.12)', border: `1px solid ${isStamps ? `${primaryColor}40` : 'rgba(167,139,250,0.25)'}`, fontSize: 10, fontWeight: 700, color: isStamps ? primaryColor : '#A78BFA', letterSpacing: '0.06em' }}>
            {isStamps ? 'SELLOS' : 'PUNTOS'}
          </div>
          <span style={{ fontSize: 12, color: '#6B6560' }}>Paso 2 de 2</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F5F0EB', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Configura tu tarjeta de {isStamps ? 'sellos' : 'puntos'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B6560', lineHeight: 1.6 }}>
              Define cómo funciona el programa. Podrás personalizar el diseño en el siguiente paso.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Nombre */}
            <div>
              <label style={LABEL}>Nombre de la tarjeta *</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={isStamps ? 'ej: "Tarjeta Café", "Sello Fidelidad"' : 'ej: "Club VIP", "Tarjeta Puntos"'}
                maxLength={60}
                required
                style={{ ...FIELD, borderColor: fieldErrors.name ? '#F87171' : 'rgba(245,240,235,0.12)' }}
              />
              {fieldErrors.name && <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.name}</span>}
            </div>

            {/* Recompensa */}
            <div>
              <label style={LABEL}>Recompensa *</label>
              <input
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                placeholder={isStamps ? 'ej: "1 café gratis", "Postre de regalo"' : 'ej: "10% de descuento", "$5.000 de regalo"'}
                maxLength={100}
                required
                style={{ ...FIELD, borderColor: fieldErrors.rewardDescription ? '#F87171' : 'rgba(245,240,235,0.12)' }}
              />
              {fieldErrors.rewardDescription
                ? <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.rewardDescription}</span>
                : <span style={HINT}>Qué recibe el cliente al completar {isStamps ? 'los sellos' : 'los puntos'}</span>
              }
            </div>

            {isStamps ? (
              /* Stamps mode: only stamp count */
              <div>
                <label style={LABEL}>Número de sellos *</label>
                <input
                  type="number"
                  value={stampCount}
                  onChange={(e) => setStampCount(Math.max(2, Math.min(20, Number(e.target.value) || 10)))}
                  min={2}
                  max={20}
                  required
                  style={{ ...FIELD, borderColor: fieldErrors.pointsForReward ? '#F87171' : 'rgba(245,240,235,0.12)' }}
                />
                {fieldErrors.pointsForReward
                  ? <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.pointsForReward}</span>
                  : <span style={HINT}>El cliente necesita completar esta cantidad de sellos (máx. 20)</span>
                }
              </div>
            ) : (
              /* Points mode: per-visit + threshold */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={LABEL}>Puntos por visita *</label>
                  <input
                    type="number"
                    value={pointsPerCheckin}
                    onChange={(e) => setPointsPerCheckin(Math.max(1, Number(e.target.value) || 1))}
                    min={1}
                    required
                    style={{ ...FIELD, borderColor: fieldErrors.pointsPerCheckin ? '#F87171' : 'rgba(245,240,235,0.12)' }}
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
                    style={{ ...FIELD, borderColor: fieldErrors.pointsForReward ? '#F87171' : 'rgba(245,240,235,0.12)' }}
                  />
                  {fieldErrors.pointsForReward && <span style={{ ...HINT, color: '#F87171' }}>{fieldErrors.pointsForReward}</span>}
                </div>
              </div>
            )}

            {/* Live logic preview */}
            <div style={{ background: '#111009', border: '1px solid rgba(245,240,235,0.07)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#6B6560', lineHeight: 1.8 }}>
              {isStamps ? (
                <>
                  <span style={{ color: '#F5F0EB', fontWeight: 600 }}>Lógica:</span>{' '}
                  cada visita = <span style={{ color: primaryColor, fontWeight: 700 }}>1 sello</span>.
                  Al completar <span style={{ color: primaryColor, fontWeight: 700 }}>{stampCount} sellos</span>, el cliente gana{' '}
                  <span style={{ color: '#F5F0EB', fontWeight: 600 }}>{rewardDescription || '(tu recompensa)'}</span>.
                </>
              ) : (
                <>
                  <span style={{ color: '#F5F0EB', fontWeight: 600 }}>Lógica:</span>{' '}
                  cada visita suma <span style={{ color: '#A78BFA', fontWeight: 700 }}>{pointsPerCheckin} {pointsPerCheckin === 1 ? 'punto' : 'puntos'}</span>.
                  Al llegar a <span style={{ color: '#A78BFA', fontWeight: 700 }}>{pointsForReward}</span>, el cliente gana{' '}
                  <span style={{ color: '#F5F0EB', fontWeight: 600 }}>{rewardDescription || '(tu recompensa)'}</span>.
                </>
              )}
            </div>

            {/* Descripción opcional */}
            <div>
              <label style={LABEL}>Descripción <span style={{ color: '#4A4540', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='ej: "Acumula en cada compra mayor a $10.000"'
                maxLength={200}
                style={FIELD}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F87171' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isPending ? '#6B6560' : isStamps ? primaryColor : '#A78BFA',
                color: '#fff', border: 'none', borderRadius: 10, padding: '14px 24px',
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15,
                cursor: isPending ? 'not-allowed' : 'pointer', transition: 'background 0.15s', marginTop: 4,
              }}
            >
              {isPending ? 'Creando...' : 'Crear y diseñar'}
              {!isPending && <ArrowRight size={16} />}
            </button>

            <p style={{ fontSize: 11, color: '#4A4540', textAlign: 'center' }}>
              Podrás personalizar el diseño completo en el siguiente paso
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
