'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparePage() {
  const [symbols, setSymbols] = React.useState('AAPL,MSFT,VOO');
  const [series, setSeries] = React.useState<Record<string, { t: number; v: number }[]>>({});
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

  const fetchData = async () => {
    const list = symbols.split(',').map((s) => s.trim()).filter(Boolean);
    const params = new URLSearchParams({ symbols: list.join(',') });
    const r = await fetch(`${backend}/compare/returns?${params.toString()}`);
    const j = await r.json();
    setSeries(j.series || {});
  };

  const chartData = React.useMemo(() => {
    // Merge into array by t
    const entries = Object.entries(series);
    const length = entries[0]?.[1]?.length || 0;
    const data: any[] = [];
    for (let i = 0; i < length; i++) {
      const point: any = { t: i };
      for (const [sym, arr] of entries) point[sym] = arr[i]?.v;
      data.push(point);
    }
    return data;
  }, [series]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Compare</h1>
      <div className="flex gap-2">
        <input value={symbols} onChange={(e) => setSymbols(e.target.value)} className="flex-1 px-3 py-2 rounded bg-white/10" />
        <button onClick={fetchData} className="px-3 py-2 rounded bg-brand-700">Fetch</button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="t" hide />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            {Object.keys(series).map((sym) => (
              <Line key={sym} type="monotone" dataKey={sym} stroke="#60a5fa" dot={false} strokeWidth={1.5} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
