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

after(async () => { server.close(); await prisma.$disconnect(); });

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('GET /portfolio/:id/factors returns sector exposure', async () => {
  const user = await prisma.users.findFirst({ where: { email: 'demo@example.com' } });
  const pf = await prisma.portfolios.findFirst({ where: { user_id: user.id } });
  const resp = await get(`/portfolio/${pf.id}/factors`);
  assert.equal(resp.status, 200);
  assert.ok(Array.isArray(resp.body.exposure));
});
