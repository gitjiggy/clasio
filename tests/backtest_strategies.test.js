const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('../apps/backend/server');

const server = createServer();
let port;

before(async () => { await new Promise((resolve) => { server.listen(0, () => { port = server.address().port; resolve(); }); }); });
after(async () => { server.close(); });

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

test('buy_and_hold returns valid metrics', async () => {
  const resp = await post('/backtest/strategy', { name: 'buy_and_hold', prices: [100, 105, 110, 108, 115] });
  assert.equal(resp.status, 200);
  assert.ok(typeof resp.body.cagr === 'number');
});

test('periodic_rebalance returns valid metrics', async () => {
  const resp = await post('/backtest/strategy', { name: 'periodic_rebalance', pricesMatrix: [[100,100],[101,99],[102,101],[103,105],[104,107]], weights: [0.6,0.4], freq: 2 });
  assert.equal(resp.status, 200);
  assert.ok(typeof resp.body.sharpe === 'number');
});

test('sma_cross returns valid metrics', async () => {
  const resp = await post('/backtest/strategy', { name: 'sma_cross', prices: [100,101,102,101,103,104,103,105,104,106,108,107], shortWin: 3, longWin: 5 });
  assert.equal(resp.status, 200);
  assert.ok(typeof resp.body.maxDrawdown === 'number');
});
