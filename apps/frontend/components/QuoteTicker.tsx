'use client';
import React from 'react';

interface Quote { symbol: string; price: number; ts: string }

export default function QuoteTicker({ symbols }: { symbols: string[] }) {
  const [quotes, setQuotes] = React.useState<Record<string, Quote>>({});
  React.useEffect(() => {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const url = new URL('/sse/quotes', backend);
    url.searchParams.set('symbols', symbols.join(','));
    const es = new EventSource(url.toString());
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload?.type === 'quotes') {
          const map: Record<string, Quote> = { ...quotes };
          for (const q of payload.data as Quote[]) map[q.symbol] = q;
          setQuotes((prev) => ({ ...prev, ...map }));
        }
      } catch {}
    };
    return () => es.close();
  }, [symbols.join(',')]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {symbols.map((s) => (
        <div key={s} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-sm text-white/60">{s}</div>
          <div className="text-xl font-semibold">{quotes[s]?.price?.toFixed?.(2) ?? '…'}</div>
          <div className="text-xs text-white/40">{quotes[s]?.ts ? new Date(quotes[s]!.ts).toLocaleTimeString() : 'waiting'}</div>
        </div>
      ))}
    </div>
  );
}
