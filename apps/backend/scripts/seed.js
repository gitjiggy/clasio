const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hash(pw) { return crypto.createHash('sha256').update(String(pw)).digest('hex'); }

async function run() {
  const demo = await prisma.users.upsert({
    where: { email: 'demo@example.com' },
    update: { hashed_password: hash('demo'), role: 'user', twofa_secret: 'JBSWY3DPEHPK3PXP' },
    create: { email: 'demo@example.com', hashed_password: hash('demo'), role: 'user', twofa_secret: 'JBSWY3DPEHPK3PXP' },
  });
  const admin = await prisma.users.upsert({
    where: { email: 'admin@example.com' },
    update: { hashed_password: hash('admin'), role: 'admin', twofa_secret: 'KRSXG5A=' },
    create: { email: 'admin@example.com', hashed_password: hash('admin'), role: 'admin', twofa_secret: 'KRSXG5A=' },
  });

  const existing = await prisma.portfolios.findFirst({ where: { user_id: demo.id } });
  const portfolio = existing || (await prisma.portfolios.create({ data: { user_id: demo.id, name: 'Demo Portfolio', is_default: true } }));

  const holdingsData = [
    { symbol: 'AAPL', qty: '50', avg_cost: '150' },
    { symbol: 'MSFT', qty: '30', avg_cost: '300' },
    { symbol: 'VOO', qty: '20', avg_cost: '350' },
    { symbol: 'AGG', qty: '40', avg_cost: '100' },
  ];
  const count = await prisma.holdings.count({ where: { portfolio_id: portfolio.id } });
  if (count === 0) {
    for (const h of holdingsData) await prisma.holdings.create({ data: { portfolio_id: portfolio.id, symbol: h.symbol, qty: h.qty, avg_cost: h.avg_cost, source: 'seed' } });
  }

  await prisma.content_blocks.upsert({ where: { key: 'disclosures' }, update: { markdown: 'Not investment advice.' }, create: { key: 'disclosures', markdown: 'Not investment advice.' } });
  await prisma.feature_flags.upsert({ where: { key: 'betaFeatures' }, update: { value_json: JSON.stringify({ enabled: true }) }, create: { key: 'betaFeatures', value_json: JSON.stringify({ enabled: true }) } });

  console.log('Seed complete.');
}

run().finally(() => prisma.$disconnect());
