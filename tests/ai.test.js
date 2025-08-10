const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('../apps/backend/server');

const server = createServer();
let port;

before(async () => {
  await new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
});

after(async () => {
  server.close();
});

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

test('POST /ai/optimize returns normalized weights and rationale', async () => {
  const resp = await post('/ai/optimize', { symbols: ['AAPL', 'MSFT', 'VOO'], maxWeight: 0.6 });
  assert.equal(resp.status, 200);
  const weights = resp.body.weights;
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-6);
  assert.ok(resp.body.rationale);
});
