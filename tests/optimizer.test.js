const { test } = require('node:test');
const assert = require('node:assert');
const { markowitzWeights, riskParityWeights } = require('../apps/backend/lib/optimizer');

test('markowitz returns feasible weights', () => {
  const mu = [0.1, 0.08, 0.06];
  const cov = [ [0.04, 0.01, 0.0], [0.01, 0.03, 0.0], [0.0, 0.0, 0.02] ];
  const w = markowitzWeights(mu, cov, { maxWeight: 0.7 });
  const sum = w.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-8);
  assert.ok(w.every((x) => x >= -1e-12 && x <= 0.7 + 1e-12));
});

test('risk parity returns feasible weights', () => {
  const cov = [ [0.04, 0.01, 0.0], [0.01, 0.03, 0.0], [0.0, 0.0, 0.02] ];
  const w = riskParityWeights(cov, { maxWeight: 0.7, maxIter: 500 });
  const sum = w.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-6);
  assert.ok(w.every((x) => x >= -1e-8 && x <= 0.7 + 1e-8));
});
