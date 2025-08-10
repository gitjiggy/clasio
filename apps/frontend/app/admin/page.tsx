'use client';
import React from 'react';
import { AuthContext } from '../../components/AuthProvider';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { user: legacyUser, token } = React.useContext(AuthContext);
  const { data: session, status } = useSession();
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const [flags, setFlags] = React.useState<any>({});
  const [disclosures, setDisclosures] = React.useState('');
  const [audit, setAudit] = React.useState<any[]>([]);

  const isAdmin = (session as any)?.role === 'admin' || legacyUser?.role === 'admin';
  const authToken = ((session as any)?.backendToken as string) || token || '';

  const fetchAll = async () => {
    const [f, c] = await Promise.all([
      fetch(`${backend}/admin/feature-flags`).then((r) => r.json()),
      fetch(`${backend}/admin/content-blocks`).then((r) => r.json()),
    ]);
    setFlags(f);
    setDisclosures(c.disclosures || '');
    if (authToken && isAdmin) {
      const a = await fetch(`${backend}/admin/audit`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (a.ok) setAudit(await a.json());
    } else {
      setAudit([]);
    }
  };

  React.useEffect(() => { fetchAll(); }, [authToken, isAdmin]);

  const saveFlags = async () => {
    if (!authToken || !isAdmin) return;
    await fetch(`${backend}/admin/feature-flags`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify(flags) });
    await fetchAll();
  };

  const saveDisclosure = async () => {
    if (!authToken || !isAdmin) return;
    await fetch(`${backend}/admin/content-blocks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ disclosures }) });
    await fetchAll();
  };

  if (status !== 'loading' && !isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="text-sm text-white/70">You do not have permission to access this page. Please sign in as an administrator.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <section className="space-y-2">
        <div className="text-sm text-white/70">Feature Flags (JSON value per key)</div>
        <div className="space-y-2">
          {Object.entries(flags).map(([k, v]) => (
            <div key={k} className="flex gap-2 items-center">
              <div className="w-32 text-white/60 text-sm">{k}</div>
              <input className="flex-1 px-2 py-1 rounded bg-white/10" value={typeof v === 'string' ? v : JSON.stringify(v)} onChange={(e) => setFlags({ ...flags, [k]: e.target.value })} disabled={!isAdmin} />
            </div>
          ))}
          <button onClick={saveFlags} className="px-3 py-2 rounded bg-brand-700 disabled:opacity-50" disabled={!authToken || !isAdmin}>Save Flags</button>
        </div>
      </section>
      <section className="space-y-2">
        <div className="text-sm text-white/70">Disclosures</div>
        <textarea className="w-full h-32 px-2 py-1 rounded bg-white/10" value={disclosures} onChange={(e) => setDisclosures(e.target.value)} disabled={!isAdmin} />
        <button onClick={saveDisclosure} className="px-3 py-2 rounded bg-brand-700 disabled:opacity-50" disabled={!authToken || !isAdmin}>Save Disclosures</button>
      </section>
      <section>
        <div className="text-sm text-white/70 mb-2">Audit Log</div>
        <div className="rounded border border-white/10 divide-y divide-white/10">
          {audit.map((a) => (
            <div key={a.id} className="p-2 text-xs text-white/70">{a.ts} - {a.action} - {a.entity} - {a.entity_id}</div>
          ))}
          {audit.length === 0 && <div className="p-2 text-xs text-white/50">No audit entries (or insufficient privileges)</div>}
        </div>
      </section>
    </div>
  );
}
