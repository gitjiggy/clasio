const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('../apps/backend/server');
const { PrismaClient } = require('@prisma/client');

const server = createServer();
let port;
const prisma = new PrismaClient();

before(async () => {
  await new Promise((resolve) => { server.listen(0, () => { port = server.address().port; resolve(); }); });
});

after(async () => {
  server.close();
  await prisma.$disconnect();
});

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function login(email, password) { return new Promise((resolve, reject) => {
  const payload = JSON.stringify({ email, password });
  const req = http.request({ hostname: '127.0.0.1', port, path: '/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => { let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => resolve(JSON.parse(data))); }); req.on('error', reject); req.write(payload); req.end();
}); }
function verify(tmp) { return new Promise((resolve, reject) => {
  const payload = JSON.stringify({ code: '123456', tmp });
  const req = http.request({ hostname: '127.0.0.1', port, path: '/auth/2fa/verify', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => { let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => resolve(JSON.parse(data).token)); }); req.on('error', reject); req.write(payload); req.end();
}); }

test('portfolio import creates holdings and audit log', async () => {
  const tmp = await login('demo@example.com', 'demo');
  const token = await verify(tmp.tmp);
  const beforeCount = await prisma.audit_log.count();
  const resp = await post('/portfolio/import', { name: 'Fidelity Import', fixtures: [{ symbol: 'AAPL', qty: '2', avg_cost: '150' }] }, token);
  assert.equal(resp.status, 200);
  const portfolio = await prisma.portfolios.findFirst({ where: { id: resp.body.id } });
  assert.ok(portfolio);
  const holdings = await prisma.holdings.findMany({ where: { portfolio_id: portfolio.id } });
  assert.equal(holdings.length, 1);
  const afterCount = await prisma.audit_log.count();
  assert.ok(afterCount > beforeCount);
});
