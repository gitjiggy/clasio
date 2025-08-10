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

test('SSE /sse/quotes emits events', async () => {
  const result = await new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: '/sse/quotes?symbols=AAPL,MSFT', method: 'GET' }, (res) => {
      let received = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        received += chunk;
        if (received.includes('\n\n')) {
          try {
            const line = received.split('\n\n')[0];
            const jsonLine = line.replace(/^data: /, '');
            const payload = JSON.parse(jsonLine);
            req.destroy();
            resolve(payload);
          } catch (e) {
            reject(e);
          }
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
  assert.equal(result.type, 'quotes');
  assert.ok(Array.isArray(result.data));
  assert.ok(result.data.length >= 2);
});
