import QuoteTicker from '../components/QuoteTicker';
import { KpiTile } from '../components/KpiTile';
import ImportButton from '../components/ImportButton';

async function getSummary() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  try {
    const r = await fetch(`${backend}/portfolio/summary`, { next: { revalidate: 5 } });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

async function getFactors() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  try {
    const r = await fetch(`${backend}/portfolio/factors`, { next: { revalidate: 10 } });
    if (!r.ok) return [] as { sector: string; weight: number }[];
    const j = await r.json();
    return j.exposure as { sector: string; weight: number }[];
  } catch { return []; }
}

async function getChanges() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  try {
    const r = await fetch(`${backend}/portfolio/changes`, { next: { revalidate: 5 } });
    if (!r.ok) return [] as { symbol: string; changePct: number }[];
    const j = await r.json();
    return j.changes as { symbol: string; changePct: number }[];
  } catch { return []; }
}

export default async function Page() {
  const [summary, factors, changes] = await Promise.all([getSummary(), getFactors(), getChanges()]);
  const kpis = [
    { label: 'Total Value', value: summary ? `$${(summary.totalValue).toLocaleString()}` : '$1,000,000' },
    { label: "Today's P/L", value: summary ? `${summary.pnlToday >= 0 ? '+' : ''}$${summary.pnlToday.toLocaleString()}` : '+$1,200' },
    { label: 'YTD', value: summary ? `${(summary.ytd * 100).toFixed(1)}%` : '8.4%' },
    { label: 'Sharpe', value: summary ? `${summary.risk.sharpe}` : '1.25' },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Portfolio Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <KpiTile key={k.label} label={k.label} value={k.value} />
        ))}
      </div>
      <section>
        <div className="mb-2 text-sm text-white/70">Live Watchlist</div>
        <QuoteTicker symbols={["AAPL", "MSFT", "VOO", "AGG"]} />
      </section>
      <section>
        <div className="mb-2 text-sm text-white/70">Factor Exposure (Sector)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {factors.map((f) => (
            <div key={f.sector} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm text-white/60">{f.sector}</div>
              <div className="text-xl font-semibold">{(f.weight * 100).toFixed(1)}%</div>
            </div>
          ))}
          {factors.length === 0 && <div className="text-xs text-white/60">No exposure data</div>}
        </div>
      </section>
      <section>
        <div className="mb-2 text-sm text-white/70">What changed today</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {changes.slice(0,4).map((c) => (
            <div key={c.symbol} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm text-white/60">{c.symbol}</div>
              <div className={`text-xl font-semibold ${c.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(c.changePct * 100).toFixed(1)}%</div>
            </div>
          ))}
          {changes.length === 0 && <div className="text-xs text-white/60">No changes</div>}
        </div>
      </section>
      <section className="space-y-2">
        <div className="text-sm text-white/70">Import from Fidelity (mock)</div>
        <ImportButton />
      </section>
    </div>
  );
}
