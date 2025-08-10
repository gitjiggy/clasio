'use client';
import React from 'react';
import { useSession } from 'next-auth/react';

export default function SecuritySettings() {
  const { data: session } = useSession();
  const [secret, setSecret] = React.useState<string>('');
  const [otpauth, setOtpauth] = React.useState<string>('');
  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState('');
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

  const getToken = () => {
    const fromSession = (session as any)?.backendToken as string | undefined;
    if (fromSession) return fromSession;
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  };

  const setup = async () => {
    setStatus('');
    const token = getToken();
    if (!token) { setStatus('Not signed in'); return; }
    const r = await fetch(`${backend}/auth/2fa/setup`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) { setStatus('Setup failed'); return; }
    const j = await r.json();
    setSecret(j.secret);
    setOtpauth(j.otpauth);
  };

  const confirm = async () => {
    setStatus('');
    const token = getToken();
    if (!token) { setStatus('Not signed in'); return; }
    const r = await fetch(`${backend}/auth/2fa/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ code }) });
    if (!r.ok) { setStatus('Invalid code'); return; }
    setStatus('2FA enabled');
  };

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Security</h1>
      <div className="rounded border border-white/10 p-4 space-y-3">
        <div className="text-sm text-white/70">Two-Factor Authentication (TOTP)</div>
        <button onClick={setup} className="px-3 py-2 rounded bg-brand-700">Generate Secret</button>
        {secret && (
          <div className="space-y-2">
            <div className="text-xs text-white/60">Secret: {secret}</div>
            <div className="text-xs text-white/60 break-all">URI: {otpauth}</div>
            <input placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10" />
            <button onClick={confirm} className="px-3 py-2 rounded bg-brand-700">Confirm</button>
          </div>
        )}
        {status && <div className="text-xs text-white/70" role="status">{status}</div>}
      </div>
    </div>
  );
}
