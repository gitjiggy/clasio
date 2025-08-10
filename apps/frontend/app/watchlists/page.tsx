'use client';
import React from 'react';
import { AuthContext } from '../../components/AuthProvider';

export default function WatchlistsPage() {
  const { token } = React.useContext(AuthContext);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const [name, setName] = React.useState('My Watchlist');
  const [symbols, setSymbols] = React.useState('AAPL,MSFT');
  const [result, setResult] = React.useState<any>(null);

  const create = async () => {
    const body = { name, symbols: symbols.split(',').map((s) => s.trim()).filter(Boolean) };
    const r = await fetch(`${backend}/watchlist`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
    setResult(await r.json());
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-semibold">Watchlists</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10" />
      <input value={symbols} onChange={(e) => setSymbols(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10" />
      <button onClick={create} className="px-3 py-2 rounded bg-brand-700">Create</button>
      {result && <div className="text-sm text-white/70">Created: {result.id}</div>}
    </div>
  );
}
