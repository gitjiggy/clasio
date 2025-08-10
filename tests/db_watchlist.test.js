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

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

test('POST /watchlist persists to DB', async () => {
  const unique = `test-${Date.now()}@example.com`;
  const user = await prisma.users.create({ data: { email: unique, hashed_password: 'x' } });
  const resp = await post('/watchlist', { userId: user.id, name: 'Tech', symbols: ['AAPL', 'MSFT'] });
  assert.equal(resp.status, 200);
  const wl = await prisma.watchlists.findFirst({ where: { id: resp.body.id } });
  assert.ok(wl);
  const items = await prisma.watchlist_items.findMany({ where: { watchlist_id: wl.id } });
  assert.equal(items.length, 2);
});
