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

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
      });
    }).on('error', reject);
  });
}

test('GET /health returns ok', async () => {
  const resp = await get('/health');
  assert.equal(resp.status, 200);
  assert.equal(resp.body.ok, true);
});
