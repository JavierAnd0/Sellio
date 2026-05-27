import type { Metadata } from 'next';
import { createAdminClient } from '@sellio/db/admin';

export const metadata: Metadata = { title: 'Métricas — Sellio' };

function fmt(n: number | null | undefined, decimals = 0) {
  if (n == null) return '—';
  return n.toLocaleString('es-CO', { maximumFractionDigits: decimals });
}

function fmtCop(cents: number | null | undefined) {
  if (cents == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cents);
}

export default async function MetricsPage() {
  const db = createAdminClient();

  const [kpisResult, recentPayments, recentNps] = await Promise.all([
    db.rpc('get_m3_kpis'),
    db
      .from('invoices')
      .select('id, org_id, amount_cents, currency, status, paid_at, organizations(name)')
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(10),
    db
      .from('nps_responses')
      .select('id, score, comment, responded_at, organizations(name)')
      .order('responded_at', { ascending: false })
      .limit(5),
  ]);

  const kpis = kpisResult.data?.[0];

  const npsColor =
    kpis?.nps_score == null
      ? 'text-muted'
      : kpis.nps_score >= 50
        ? 'text-green-400'
        : kpis.nps_score >= 20
          ? 'text-yellow-400'
          : 'text-red-400';

  const scoreColor = (score: number) =>
    score >= 9 ? 'text-green-400' : score >= 7 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-fg p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">
            Solo visible para el fundador
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Métricas M3
          </h1>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <KpiCard label="MRR (COP)" value={fmtCop(kpis?.mrr_cop)} sub="últimos 30 días" />
          <KpiCard
            label="Comercios pagando"
            value={fmt(kpis?.paying_orgs)}
            sub={`de ${fmt(kpis?.total_orgs)} totales`}
            highlight={Number(kpis?.paying_orgs) >= 10}
          />
          <KpiCard
            label="Plan Elite"
            value={fmt(kpis?.elite_orgs)}
            sub="organizaciones"
            highlight={Number(kpis?.elite_orgs) >= 1}
          />
          <KpiCard
            label="Churn 30d"
            value={kpis?.churn_rate_30d != null ? `${kpis.churn_rate_30d}%` : '—'}
            sub="orgs canceladas / activas"
            warn={Number(kpis?.churn_rate_30d) > 15}
          />
          <KpiCard
            label="NPS"
            value={kpis?.nps_score != null ? String(kpis.nps_score) : '—'}
            sub={`${fmt(kpis?.nps_count)} respuestas`}
            valueClass={npsColor}
            highlight={Number(kpis?.nps_score) >= 20 && Number(kpis?.nps_count) >= 5}
          />
          <KpiCard
            label="Onboarding"
            value={kpis?.avg_onboarding_mins != null ? `${fmt(kpis.avg_onboarding_mins, 0)} min` : '—'}
            sub="promedio hasta 1ra tarjeta"
            highlight={Number(kpis?.avg_onboarding_mins) < 60}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Recent payments */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">
              Últimos pagos
            </h2>
            <div className="rounded-2xl border border-border/40 bg-surface overflow-hidden">
              {recentPayments.data?.length ? (
                <table className="w-full text-sm">
                  <tbody>
                    {recentPayments.data.map((inv) => {
                      const org = inv.organizations as { name: string } | null;
                      return (
                        <tr key={inv.id} className="border-b border-border/30 last:border-0">
                          <td className="px-4 py-3 font-medium text-fg truncate max-w-[120px]">
                            {org?.name ?? inv.org_id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#E8341A]">
                            {fmtCop(inv.amount_cents)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted text-xs">
                            {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('es-CO') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-6 text-sm text-muted">Sin pagos aún.</p>
              )}
            </div>
          </section>

          {/* Recent NPS */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">
              Últimas respuestas NPS
            </h2>
            <div className="rounded-2xl border border-border/40 bg-surface overflow-hidden">
              {recentNps.data?.length ? (
                <table className="w-full text-sm">
                  <tbody>
                    {recentNps.data.map((r) => {
                      const org = r.organizations as { name: string } | null;
                      return (
                        <tr key={r.id} className="border-b border-border/30 last:border-0">
                          <td className="px-4 py-3 font-medium text-fg truncate max-w-[120px]">
                            {org?.name ?? '—'}
                          </td>
                          <td className={`px-4 py-3 text-center font-black text-lg ${scoreColor(r.score)}`}>
                            {r.score}
                          </td>
                          <td className="px-4 py-3 text-muted text-xs truncate max-w-[140px]">
                            {r.comment ?? ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-6 text-sm text-muted">Sin respuestas NPS aún.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  highlight,
  warn,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  warn?: boolean;
  valueClass?: string;
}) {
  const valClass =
    valueClass ??
    (highlight ? 'text-green-400' : warn ? 'text-red-400' : 'text-fg');

  return (
    <div className="rounded-2xl border border-border/40 bg-surface p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">{label}</p>
      <p className={`font-display text-4xl font-extrabold tracking-tighter leading-none mb-1 ${valClass}`}>
        {value}
      </p>
      {sub && <p className="text-[12px] text-muted font-medium">{sub}</p>}
    </div>
  );
}
