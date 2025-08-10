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
  // Ensure a fresh audit chain for deterministic validation
  await prisma.audit_log.deleteMany();
});

after(async () => { server.close(); await prisma.$disconnect(); });

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

function login(email, password) { return new Promise((resolve, reject) => { const payload = JSON.stringify({ email, password }); const req = http.request({ hostname: '127.0.0.1', port, path: '/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => { let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => resolve(JSON.parse(data))); }); req.on('error', reject); req.write(payload); req.end(); }); }
function verify(tmp) { return new Promise((resolve, reject) => { const payload = JSON.stringify({ code: '123456', tmp }); const req = http.request({ hostname: '127.0.0.1', port, path: '/auth/2fa/verify', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => { let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => resolve(JSON.parse(data).token)); }); req.on('error', reject); req.write(payload); req.end(); }); }

function getRaw(path, token) { return new Promise((resolve, reject) => { const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, (res) => { let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data })); }); req.on('error', reject); req.end(); }); }

function getJson(path, token) { return new Promise((resolve, reject) => { const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, (res) => { let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : {} })); }); req.on('error', reject); req.end(); }); }

test('admin POST /admin/feature-flags requires admin', async () => {
  const resp = await post('/admin/feature-flags', { featureX: true });
  assert.equal(resp.status, 403);
});

test('admin POST /admin/feature-flags works with admin token and audit validate ok', async () => {
  const tmp = await login('admin@example.com', 'admin');
  const token = await verify(tmp.tmp);
  const r = await post('/admin/feature-flags', { featureX: true }, token);
  assert.equal(r.status, 200);
  const val = await getJson('/admin/audit/validate', token);
  assert.equal(val.status, 200);
  assert.equal(val.body.ok, true);
});

test('GET /metrics returns text/plain', async () => {
  const r = await getRaw('/metrics');
  assert.equal(r.status, 200);
  assert.ok(/^text\/plain/.test(r.headers['content-type']));
  assert.match(r.body, /http_requests_total/);
});
