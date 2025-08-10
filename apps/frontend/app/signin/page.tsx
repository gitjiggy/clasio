'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('demo');
  const [tmp, setTmp] = React.useState<string | null>(null);
  const [code, setCode] = React.useState('123456');
  const router = useRouter();
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const login = async () => {
    const r = await fetch(`${backend}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const j = await r.json();
    if (j.tmp) setTmp(j.tmp);
  };
  const verify = async () => {
    if (!tmp) return;
    const r = await fetch(`${backend}/auth/2fa/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, tmp }) });
    const j = await r.json();
    if (j.token) {
      localStorage.setItem('token', j.token);
      router.push('/');
    }
  };
  const loginNextAuth = async () => {
    const res = await signIn('credentials', { redirect: false, email, password, code });
    if (!res?.error) router.push('/');
  };
  return (
    <div className="space-y-4 max-w-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10" />
      <input placeholder="2FA Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10" />
      <div className="flex gap-2">
        <button onClick={login} className="px-3 py-2 rounded bg-brand-700">Login</button>
        <button onClick={verify} className="px-3 py-2 rounded bg-brand-700">Verify</button>
        <button onClick={loginNextAuth} className="px-3 py-2 rounded bg-brand-700">Sign in (NextAuth)</button>
      </div>
      {tmp && <div className="text-xs text-white/60">Tmp token present; enter code then Verify.</div>}
    </div>
  );
}
