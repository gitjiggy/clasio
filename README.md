# Institution-Grade Real-Time Stocks & Portfolio Analyzer

Production-ready monorepo with Next.js frontend and Express + TypeScript backend for real-time securities and portfolio analytics.

## Stack
- Frontend: Next.js (App Router) + TypeScript, TailwindCSS, shadcn/ui, Recharts
- Backend: Node.js + TypeScript (Express), SSE for live quotes
- DB: PostgreSQL + Prisma (field-level encryption at app layer)
- Cache/Queues: Redis
- Auth: next-auth (email/pass + OAuth stub), 2FA (TOTP), RBAC
- Integrations: Polygon.io provider abstraction; Fidelity read-only connector via mock aggregator
- Testing: Jest, Supertest, Playwright, Axe, Lighthouse CI (config), ZAP Baseline (config)
- DevOps: Docker, docker-compose, GitHub Actions CI
- Observability: pino logger, OpenTelemetry stub, Prometheus metrics

## Quickstart

```bash
# 1) Copy envs
cp .env.example .env

# 2) Start infra
docker compose up -d postgres redis

# 3) Install deps (workspaces)
npm install

# 4) Generate Prisma client and push schema
npm run prisma:generate
npm run prisma:push

# 5) Seed demo data
npm run seed

# 6) Run dev (both apps)
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

## Secrets & Encryption
- Uses AES-256-GCM app-level encryption with `ENCRYPTION_MASTER_KEY` for PII and tokens.
- In production, use KMS-managed data keys (`ENCRYPTION_KEY_KMS_ID`). See `SECRETS.md`.

## Tests
- Unit/Integration: `npm test`
- E2E (Playwright): `npm run e2e`
- Lighthouse CI and ZAP run in GitHub Actions. Local runs optional.

## Provider Abstraction
- `PolygonProvider` is default; swap via `DATA_PROVIDER=polygon|alpha|yahoo`.
- Fidelity connector mocked via aggregator stub; fixtures in `apps/backend/fixtures`.

## Limits & Future Work
- Replace mocks with real provider connectors
- Expand factor model (Fama-French) and Black-Litterman inputs
- Harden OAuth flows and consent dashboards
