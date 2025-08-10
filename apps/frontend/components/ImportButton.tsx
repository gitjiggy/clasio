'use client';
import React from 'react';

export default function ImportButton() {
  const [status, setStatus] = React.useState<string>('');
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const onClick = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setStatus('Importing...');
    try {
      const r = await fetch(`${backend}/portfolio/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: 'Fidelity Import' })
      });
      if (r.ok) setStatus('Import requested'); else setStatus('Failed');
    } catch {
      setStatus('Failed');
    }
  };
  return (
    <div className="space-y-2">
      <button type="button" className="px-3 py-2 rounded bg-brand-700" onClick={onClick}>Import Now</button>
      {status && <div className="text-xs text-white/70" role="status">{status}</div>}
    </div>
  );
}
