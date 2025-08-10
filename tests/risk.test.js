const { test } = require('node:test');
const assert = require('node:assert');
const { dailyReturns, sharpeRatio, sortinoRatio, maxDrawdown, var95, expectedShortfall95 } = require('../apps/backend/lib/risk');

test('risk metrics compute expected shapes', () => {
  const series = [100, 101, 102, 101, 103, 104, 103, 105];
  const rets = dailyReturns(series);
  assert.equal(rets.length, series.length - 1);
  assert.ok(Number.isFinite(sharpeRatio(rets)));
  assert.ok(Number.isFinite(sortinoRatio(rets)));
  assert.ok(maxDrawdown(series) >= 0);
  assert.ok(var95(rets) >= 0);
  assert.ok(expectedShortfall95(rets) >= 0);
});
