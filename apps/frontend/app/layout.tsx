import { AuthProvider } from '../components/AuthProvider';
import SessionClientProvider from '../components/SessionClientProvider';
export const metadata = { title: 'Insti Analyzer', description: 'Not investment advice.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="w-full text-xs text-center bg-yellow-900/40 text-yellow-300 py-1">Not investment advice. Data may be delayed.</div>
        <SessionClientProvider>
          <AuthProvider>
            <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 text-sm text-white/80">
              <a href="/">Dashboard</a>
              <a href="/compare">Compare</a>
              <a href="/backtest">Backtest</a>
              <a href="/watchlists">Watchlists</a>
              <a href="/settings/security">Security</a>
              <a href="/admin">Admin</a>
              <a href="/signin" className="ml-auto">Sign in</a>
            </nav>
            <div className="max-w-6xl mx-auto px-4 py-4">{children}</div>
          </AuthProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
