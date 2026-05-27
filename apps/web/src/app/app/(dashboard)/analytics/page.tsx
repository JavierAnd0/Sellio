import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TrendingUp, Users, Zap, Gift, Clock, BarChart2, ShoppingCart, Lock } from 'lucide-react';

import { createClient } from '@sellio/db/server';
import { SupabaseOrganizationRepository } from '@sellio/db/repositories';
import type { OrgPlan } from '@sellio/db';

export const metadata: Metadata = { title: 'Analíticas' };

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function pct(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, highlight = false,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div style={{
      background: '#1A1714',
      borderRadius: 16,
      padding: '20px 22px',
      border: `1px solid ${highlight ? 'rgba(232,52,26,0.25)' : 'rgba(255,255,255,0.06)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5450' }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: highlight ? '#E8341A' : '#F5F0EB', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#5A5450', fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5A5450', marginBottom: 14 }}>
      {children}
    </h2>
  );
}

function BarChart({
  data, color = '#E8341A', height = 90, showLabels = true, sparse = false,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  sparse?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: height + (showLabels ? 18 : 0) }}>
      {data.map((d, i) => {
        const showLabel = showLabels && (!sparse || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1);
        return (
          <div
            key={d.label}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}
          >
            <div
              title={`${d.label}: ${d.value}`}
              style={{
                width: '100%',
                height: `${Math.max(d.value > 0 ? 4 : 0, (d.value / max) * height)}px`,
                background: d.value > 0 ? color : 'rgba(255,255,255,0.04)',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.2s',
              }}
            />
            {showLabels && (
              <span style={{ fontSize: 8, color: showLabel ? '#4A4540' : 'transparent', whiteSpace: 'nowrap' }}>
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SourceBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = total === 0 ? 0 : Math.max(2, (value / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 80, fontSize: 11, color: '#6B6560', fontWeight: 500, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <div style={{ width: 36, fontSize: 11, color: '#F5F0EB', fontWeight: 600, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

// ── Locked view (free / basic) ────────────────────────────────────────────────

function LockedAnalytics() {
  const previews = [
    { label: 'Total miembros', value: '—' },
    { label: 'Nuevos este mes', value: '—' },
    { label: 'Check-ins este mes', value: '—' },
    { label: 'Puntos otorgados', value: '—' },
    { label: 'Canjes completados', value: '—' },
    { label: 'Tasa de actividad', value: '—' },
  ];
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#F5F0EB', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em', margin: 0 }}>
          Analíticas
        </h1>
        <p style={{ color: '#5A5450', fontSize: 14, fontWeight: 500, marginTop: 6 }}>
          Datos en tiempo real de tu programa de lealtad
        </p>
      </div>

      {/* Upgrade banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1C1410 0%, #2A1A10 100%)',
        border: '1px solid rgba(232,52,26,0.3)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: 'rgba(232,52,26,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BarChart2 size={22} color="#E8341A" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0EB', marginBottom: 4 }}>
            Disponible en Plan Elite y Enterprise
          </div>
          <div style={{ fontSize: 13, color: '#7A7470', lineHeight: 1.5 }}>
            Desbloquea analíticas completas: picos de actividad por hora, tendencias de clientes, métricas por tarjeta y más.
          </div>
        </div>
        <div style={{
          background: '#E8341A', color: '#fff', fontSize: 12, fontWeight: 800,
          padding: '10px 20px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Actualizar plan
        </div>
      </div>

      {/* Blurred preview */}
      <div style={{ position: 'relative', userSelect: 'none', pointerEvents: 'none' }}>
        <div style={{ filter: 'blur(6px)', opacity: 0.4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {previews.map((p) => (
              <KpiCard key={p.label} label={p.label} value={p.value} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#1A1714', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', height: 160 }} />
            <div style={{ background: '#1A1714', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', height: 160 }} />
          </div>
        </div>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(15,13,11,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 18px' }}>
            <Lock size={14} color="#6B6560" />
            <span style={{ fontSize: 12, color: '#8A8480', fontWeight: 600 }}>Requiere Plan Elite</span>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle>Qué incluye</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { icon: Users, label: 'Total de clientes y nuevos por mes' },
            { icon: Clock, label: 'Picos de actividad por hora del día' },
            { icon: Zap, label: 'Check-ins y puntos otorgados en tiempo real' },
            { icon: Gift, label: 'Canjes completados y tasa de conversión' },
            { icon: TrendingUp, label: 'Tendencia de miembros en 30 días' },
            { icon: BarChart2, label: 'Estadísticas por tarjeta de lealtad' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#141210', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon size={14} color="#E8341A" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#8A8480', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Enterprise sales section ──────────────────────────────────────────────────

function EnterpriseSection({ isEnterprise }: { isEnterprise: boolean }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <SectionTitle>Integración de ventas</SectionTitle>
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
          background: isEnterprise ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
          color: isEnterprise ? '#C9A84C' : '#5A5450',
          border: `1px solid ${isEnterprise ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 6, padding: '3px 8px', marginBottom: 14,
        }}>
          Enterprise
        </div>
      </div>

      {isEnterprise ? (
        /* Enterprise: show configuration UI */
        <div style={{ background: '#1A1714', borderRadius: 16, border: '1px solid rgba(201,168,76,0.2)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'rgba(201,168,76,0.06)', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingCart size={18} color="#C9A84C" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0EB' }}>Integración POS / Ventas</div>
              <div style={{ fontSize: 12, color: '#7A7470', marginTop: 2 }}>Conecta tu sistema de punto de venta para rastrear ventas reales</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            {/* Pending configuration notice */}
            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px dashed rgba(201,168,76,0.25)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#8A8480', marginBottom: 8 }}>
                Configura tu integración para empezar a registrar datos de ventas
              </div>
              <div style={{ fontSize: 11, color: '#5A5450' }}>
                Webhook URL disponible tras la configuración inicial
              </div>
            </div>

            {/* Metrics preview */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5450', marginBottom: 12 }}>
              Métricas disponibles al integrar
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { label: 'Ticket promedio por visita', desc: 'Valor promedio de compra de clientes leales' },
                { label: 'Revenue por período', desc: 'Ingresos totales atribuibles al programa' },
                { label: 'Productos más canjeados', desc: 'Items con mayor correlación lealtad-compra' },
                { label: 'ROI del programa', desc: 'Costo del programa vs revenue generado' },
                { label: 'Frecuencia de compra', desc: 'Días promedio entre visitas por cliente' },
                { label: 'Cohort de retención', desc: 'Retención de clientes por mes de ingreso' },
              ].map(({ label, desc }) => (
                <div key={label} style={{ background: '#141210', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#D5D0CB', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#5A5450', lineHeight: 1.4 }}>{desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, background: '#C9A84C', color: '#0A0806', fontSize: 13, fontWeight: 800, padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                Configurar integración
              </button>
              <button style={{ flex: 1, background: 'transparent', color: '#8A8480', fontSize: 13, fontWeight: 600, padding: '12px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                Ver documentación
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Elite: show locked enterprise preview */
        <div style={{ background: '#141210', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'rgba(201,168,76,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '1px solid rgba(201,168,76,0.15)',
            }}>
              <ShoppingCart size={20} color="#C9A84C" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#F5F0EB', marginBottom: 6 }}>
                Integración POS y seguimiento de ventas reales
              </div>
              <div style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6, marginBottom: 16 }}>
                Con el plan Enterprise conectas tu sistema de punto de venta para ver el impacto real de tu programa de lealtad en los ingresos — ticket promedio, ROI, frecuencia de compra y cohortes de retención.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Ticket promedio', 'Revenue por período', 'ROI del programa', 'Cohort retención', 'Frecuencia de compra', 'Top productos'].map((f) => (
                  <span key={f} style={{ fontSize: 11, fontWeight: 600, color: '#5A5450', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 10px' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#5A5450' }}>Contacta con el equipo de Sellio para activar Enterprise</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer' }}>
              Contactar ventas →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/login');

  const org = await new SupabaseOrganizationRepository().findByOwner(user.id);
  if (!org) redirect('/app/dashboard');

  // Plan gate
  const plan = org.plan as OrgPlan;
  const hasAnalytics = plan === 'elite' || plan === 'enterprise';
  const isEnterprise = plan === 'enterprise';

  if (!hasAnalytics) {
    return (
      <div style={{ padding: '32px 24px' }}>
        <LockedAnalytics />
      </div>
    );
  }

  // ── Data fetching ───────────────────────────────────────────────────────────

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Fetch org's cards directly
  const { data: cardsRaw } = await db
    .from('cards')
    .select('id, name, points_for_reward, points_per_checkin')
    .eq('org_id', org.id)
    .eq('active', true);

  const orgCards = cardsRaw ?? [];
  const cardIds = orgCards.map((c) => c.id);

  // Parallel data fetch
  const [
    membershipsRes,
    customersCountRes,
    redemptionsRes,
    cohortRes,
  ] = await Promise.all([
    cardIds.length > 0
      ? db.from('memberships').select('id, card_id, joined_at, last_activity_at, points').in('card_id', cardIds)
      : Promise.resolve({ data: [] as Array<{ id: string; card_id: string; joined_at: string; last_activity_at: string | null; points: number }>, error: null }),
    db.from('customers').select('*', { count: 'exact', head: true }).eq('org_id', org.id),
    cardIds.length > 0
      ? db.from('redemptions')
          .select('id, membership_id, redeemed_at, memberships!inner(card_id)')
          .in('memberships.card_id', cardIds)
          .gte('redeemed_at', startOfMonth.toISOString())
      : Promise.resolve({ data: [], error: null }),
    db.rpc('get_cohort_retention', { p_org_id: org.id }),
  ]);

  const memberships = membershipsRes.data ?? [];
  const cohorts = cohortRes.data ?? [];
  const membershipIds = memberships.map((m) => m.id);
  const totalCustomers = customersCountRes.count ?? 0;
  const redemptionsThisMonth = (redemptionsRes.data ?? []).length;

  // Fetch transactions (last 30 days)
  const txRes = membershipIds.length > 0
    ? await db
        .from('point_transactions')
        .select('membership_id, type, source, points, created_at')
        .in('membership_id', membershipIds.slice(0, 500)) // safety limit for large orgs
        .gte('created_at', thirtyDaysAgo.toISOString())
    : { data: [] };

  const txLast30 = txRes.data ?? [];

  // ── Aggregations ────────────────────────────────────────────────────────────

  // This month subset
  const txThisMonth = txLast30.filter((t) => new Date(t.created_at) >= startOfMonth);

  // KPIs
  const totalMembers = memberships.length;
  const newThisMonth = memberships.filter((m) => new Date(m.joined_at) >= startOfMonth).length;
  const checkinsThisMonth = txThisMonth.filter((t) => t.source === 'checkin').length;
  const pointsIssuedThisMonth = txThisMonth.filter((t) => t.type === 'earn').reduce((s, t) => s + t.points, 0);
  const activeMembers = memberships.filter((m) => m.last_activity_at && new Date(m.last_activity_at) >= thirtyDaysAgo).length;
  const activityRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  // New members per day (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0]!;
  });

  const membersByDay = last30Days.map((day) => ({
    label: day.slice(8), // DD
    value: memberships.filter((m) => m.joined_at.startsWith(day)).length,
  }));

  // Transactions per hour (UTC)
  const txByHour = Array.from({ length: 24 }, (_, h) => ({
    label: h % 6 === 0 ? `${h}h` : '',
    value: txLast30.filter((t) => new Date(t.created_at).getUTCHours() === h).length,
  }));

  // Transactions by day of week
  const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const txByDayOfWeek = DAY_LABELS.map((label, i) => ({
    label,
    value: txLast30.filter((t) => new Date(t.created_at).getUTCDay() === i).length,
  }));

  // Source breakdown
  const SOURCE_META: Record<string, { label: string; color: string }> = {
    checkin:  { label: 'Check-in',    color: '#E8341A' },
    manual:   { label: 'Manual',      color: '#C9A84C' },
    referral: { label: 'Referido',    color: '#4CAF82' },
    admin:    { label: 'Admin',       color: '#7B8CDE' },
    import:   { label: 'Importación', color: '#8A8480' },
  };
  const totalTx = txLast30.length;
  const sourceBreakdown = Object.entries(SOURCE_META).map(([key, meta]) => ({
    ...meta,
    value: txLast30.filter((t) => t.source === key).length,
  })).filter((s) => s.value > 0);

  // Per-card stats
  const cardStats = orgCards.map((card) => {
    const cardMemberships = memberships.filter((m) => m.card_id === card.id);
    const cardMembershipIds = new Set(cardMemberships.map((m) => m.id));
    const cardTxMonth = txThisMonth.filter((t) => cardMembershipIds.has(t.membership_id));
    const totalPoints = cardMemberships.reduce((s, m) => s + m.points, 0);
    return {
      name: card.name,
      members: cardMemberships.length,
      totalPoints,
      checkinsMonth: cardTxMonth.filter((t) => t.source === 'checkin').length,
      active: cardMemberships.filter((m) => m.last_activity_at && new Date(m.last_activity_at) >= thirtyDaysAgo).length,
    };
  });

  // Peak hour
  const peakHour = txByHour.reduce((best, h, i) => h.value > txByHour[best]!.value ? i : best, 0);

  // ── Render ──────────────────────────────────────────────────────────────────

  const cardStyle = {
    background: '#1A1714',
    borderRadius: 16,
    padding: '20px 22px',
    border: '1px solid rgba(255,255,255,0.06)',
  } as const;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 64px', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#F5F0EB', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em', margin: 0 }}>
            Analíticas
          </h1>
          {isEnterprise && (
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 6, padding: '3px 8px' }}>
              Enterprise
            </span>
          )}
        </div>
        <p style={{ color: '#5A5450', fontSize: 14, fontWeight: 500, margin: 0 }}>
          {org.name} · últimos 30 días · hora en UTC
        </p>
      </div>

      {/* KPIs */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Resumen</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <KpiCard
            label="Total miembros"
            value={fmt(totalMembers)}
            sub={`${totalCustomers} clientes únicos`}
          />
          <KpiCard
            label="Nuevos este mes"
            value={fmt(newThisMonth)}
            sub={totalMembers > 0 ? `${pct(newThisMonth, totalMembers)} del total` : undefined}
            highlight={newThisMonth > 0}
          />
          <KpiCard
            label="Activos (30 días)"
            value={`${activityRate}%`}
            sub={`${fmt(activeMembers)} de ${fmt(totalMembers)} miembros`}
          />
          <KpiCard
            label="Check-ins este mes"
            value={fmt(checkinsThisMonth)}
            sub="escaneos de QR"
          />
          <KpiCard
            label="Puntos otorgados"
            value={fmt(pointsIssuedThisMonth)}
            sub="este mes"
          />
          <KpiCard
            label="Canjes completados"
            value={fmt(redemptionsThisMonth)}
            sub="este mes"
          />
        </div>
      </div>

      {/* Trends row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* New members per day */}
        <div style={cardStyle}>
          <SectionTitle>Nuevos miembros — últimos 30 días</SectionTitle>
          {totalMembers === 0 ? (
            <div style={{ height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4540', fontSize: 12 }}>Sin datos aún</div>
          ) : (
            <BarChart data={membersByDay} color="#E8341A" height={90} sparse />
          )}
        </div>

        {/* Peak hours */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <SectionTitle>Actividad por hora (UTC)</SectionTitle>
            {txLast30.length > 0 && (
              <span style={{ fontSize: 11, color: '#E8341A', fontWeight: 700, background: 'rgba(232,52,26,0.1)', borderRadius: 6, padding: '3px 8px' }}>
                Pico: {peakHour}h
              </span>
            )}
          </div>
          {txLast30.length === 0 ? (
            <div style={{ height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4540', fontSize: 12 }}>Sin datos aún</div>
          ) : (
            <BarChart data={txByHour} color="#C9A84C" height={90} showLabels />
          )}
        </div>
      </div>

      {/* Patterns row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Day of week */}
        <div style={cardStyle}>
          <SectionTitle>Actividad por día de la semana</SectionTitle>
          {txLast30.length === 0 ? (
            <div style={{ height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4540', fontSize: 12 }}>Sin datos aún</div>
          ) : (
            <BarChart data={txByDayOfWeek} color="#7B8CDE" height={90} />
          )}
        </div>

        {/* Source breakdown */}
        <div style={cardStyle}>
          <SectionTitle>Fuentes de puntos — últimos 30 días</SectionTitle>
          {sourceBreakdown.length === 0 ? (
            <div style={{ height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4540', fontSize: 12 }}>Sin datos aún</div>
          ) : (
            <div style={{ paddingTop: 8 }}>
              {sourceBreakdown.map((s) => (
                <SourceBar key={s.label} label={s.label} value={s.value} total={totalTx} color={s.color} />
              ))}
              <div style={{ fontSize: 11, color: '#4A4540', marginTop: 12 }}>{totalTx} transacciones en 30 días</div>
            </div>
          )}
        </div>
      </div>

      {/* Per-card breakdown */}
      {cardStats.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle>Por tarjeta de lealtad</SectionTitle>
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Tarjeta', 'Miembros', 'Puntos activos', 'Check-ins este mes', 'Activos (30d)'].map((h) => (
                    <th key={h} style={{ padding: '12px 18px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4540', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cardStats.map((row, i) => (
                  <tr
                    key={row.name}
                    style={{ borderBottom: i < cardStats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#E5E0DA' }}>{row.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#8A8480' }}>{fmt(row.members)}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#8A8480' }}>{fmt(row.totalPoints)}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: row.checkinsMonth > 0 ? '#E8341A' : '#8A8480', fontWeight: row.checkinsMonth > 0 ? 700 : 400 }}>
                      {row.checkinsMonth}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#8A8480' }}>
                      {row.members > 0 ? `${row.active} (${pct(row.active, row.members)})` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cohort retention */}
      {cohorts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle>Retención por cohorte</SectionTitle>
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Cohorte', 'Nuevos', 'Mes 1', 'Mes 2', 'Mes 3'].map((h) => (
                    <th key={h} style={{ padding: '12px 18px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4540', textAlign: h === 'Cohorte' ? 'left' : 'center' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((row, i) => {
                  const month = new Date(row.cohort_month).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
                  const retColor = (pct: number) =>
                    pct >= 70 ? '#4CAF82' : pct >= 40 ? '#C9A84C' : pct > 0 ? '#E8341A' : '#3A3530';
                  return (
                    <tr key={row.cohort_month} style={{ borderBottom: i < cohorts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: '#D5D0CB' }}>{month}</td>
                      <td style={{ padding: '12px 18px', textAlign: 'center', color: '#8A8480' }}>{row.new_users}</td>
                      {([row.m1_retention, row.m2_retention, row.m3_retention] as number[]).map((r, ri) => (
                        <td key={ri} style={{ padding: '12px 18px', textAlign: 'center' }}>
                          {row.new_users > 0 ? (
                            <span style={{
                              display: 'inline-block', minWidth: 48,
                              background: `${retColor(r)}20`,
                              color: retColor(r),
                              borderRadius: 6, padding: '3px 8px',
                              fontWeight: 700, fontSize: 11,
                            }}>
                              {r > 0 ? `${r}%` : '—'}
                            </span>
                          ) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enterprise section */}
      <EnterpriseSection isEnterprise={isEnterprise} />
    </div>
  );
}
