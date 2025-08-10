const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../apps/backend/server');
const WebSocket = require('ws');

const server = createServer();
let port;

before(async () => {
  await new Promise((resolve) => { server.listen(0, () => { port = server.address().port; resolve(); }); });
});

after(async () => { server.close(); });

test('WebSocket /ws/quotes emits quotes payload', async () => {
  const data = await new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/quotes?symbols=AAPL,MSFT`);
    ws.on('message', (msg) => {
      try {
        const payload = JSON.parse(String(msg));
        resolve(payload);
        ws.close();
      } catch (e) { reject(e); }
    });
    ws.on('error', reject);
  });
  assert.equal(data.type, 'quotes');
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length >= 2);
});
