import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function login(email: string, password: string) {
  const r = await fetch(`${backend}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!r.ok) return null;
  return r.json();
}

async function verify(tmp: string, code: string) {
  const r = await fetch(`${backend}/auth/2fa/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tmp, code }) });
  if (!r.ok) return null;
  return r.json();
}

async function fetchMe(token: string) {
  const r = await fetch(`${backend}/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
}

const handler = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        code: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const tmp = await login(credentials.email, credentials.password);
        if (!tmp?.tmp) return null;
        const v = await verify(tmp.tmp, credentials.code || '123456');
        if (!v?.token) return null;
        const me = await fetchMe(v.token);
        if (!me) return null;
        return { id: me.id, email: me.email, role: me.role, token: v.token } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.backendToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).role = token.role;
      (session as any).backendToken = token.backendToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
