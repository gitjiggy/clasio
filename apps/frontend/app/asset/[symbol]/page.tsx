type Quote = { symbol: string; price: number; ohlc: { open: number; high: number; low: number; close: number }; volume: number; ts: string };

async function getQuote(symbol: string): Promise<Quote | null> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  try {
    const resp = await fetch(`${backend}/asset/${symbol}/quote`, { next: { revalidate: 5 } });
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

export default async function AssetPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const q = await getQuote(symbol);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{symbol}</h1>
      {q ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4"><div className="text-sm">Price</div><div className="text-xl font-semibold">{q.price.toFixed(2)}</div></div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4"><div className="text-sm">Open</div><div className="text-xl font-semibold">{q.ohlc.open.toFixed(2)}</div></div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4"><div className="text-sm">High</div><div className="text-xl font-semibold">{q.ohlc.high.toFixed(2)}</div></div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4"><div className="text-sm">Low</div><div className="text-xl font-semibold">{q.ohlc.low.toFixed(2)}</div></div>
        </div>
      ) : (
        <div className="text-white/60">Failed to load quote.</div>
      )}
    </div>
  );
}
