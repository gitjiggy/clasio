'use client';
import React from 'react';

export type User = { id: string; email: string; role: string } | null;

export const AuthContext = React.createContext<{ user: User; setUser: (u: User) => void; token: string | null; setToken: (t: string | null) => void }>({ user: null, setUser: () => {}, token: null, setToken: () => null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>(null);
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
  }, []);
  React.useEffect(() => {
    if (!token) return;
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backend}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => u && setUser(u))
      .catch(() => {});
  }, [token]);
  return <AuthContext.Provider value={{ user, setUser, token, setToken }}>{children}</AuthContext.Provider>;
}
