'use client';
import React from 'react';

export default function BacktestPage() {
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const run = async () => {
    setLoading(true);
    const resp = await fetch(`${backend}/backtest/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prices: [100,101,102,101,103,104,103,105] }) });
    setResult(await resp.json());
    setLoading(false);
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Backtest Lab</h1>
      <button onClick={run} className="px-3 py-2 rounded bg-brand-700 hover:bg-brand-500">{loading ? 'Running…' : 'Run Backtest'}</button>
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded border border-white/10 p-3">CAGR: {result.cagr}</div>
          <div className="rounded border border-white/10 p-3">Vol: {result.volatility}</div>
          <div className="rounded border border-white/10 p-3">Sharpe: {result.sharpe}</div>
          <div className="rounded border border-white/10 p-3">Max DD: {result.maxDrawdown}</div>
        </div>
      )}
    </div>
  );
}
