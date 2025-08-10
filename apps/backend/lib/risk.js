function dailyReturns(series) {
  const ret = [];
  for (let i = 1; i < series.length; i++) ret.push((series[i] - series[i - 1]) / series[i - 1]);
  return ret;
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(v);
}

function sharpeRatio(returns, rf = 0) {
  const excess = returns.map((r) => r - rf / 252);
  const m = mean(excess) * 252;
  const s = stddev(excess) * Math.sqrt(252);
  return s === 0 ? 0 : m / s;
}

function sortinoRatio(returns, rf = 0) {
  const excess = returns.map((r) => r - rf / 252);
  const downside = excess.filter((r) => r < 0);
  const m = mean(excess) * 252;
  const ds = stddev(downside) * Math.sqrt(252);
  return ds === 0 ? 0 : m / ds;
}

function maxDrawdown(series) {
  let peak = series[0];
  let maxDd = 0;
  for (const p of series) {
    if (p > peak) peak = p;
    const dd = (p - peak) / peak;
    if (dd < maxDd) maxDd = dd;
  }
  return Math.abs(maxDd);
}

function var95(returns) {
  if (!returns.length) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const idx = Math.floor(0.05 * sorted.length);
  return Math.abs(sorted[idx] || 0);
}

function expectedShortfall95(returns) {
  if (!returns.length) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const cutoff = Math.floor(0.05 * sorted.length) || 1;
  const tail = sorted.slice(0, cutoff);
  return Math.abs(mean(tail));
}

function betaVsBenchmark(returns, benchReturns) {
  if (!returns.length || returns.length !== benchReturns.length) return 0;
  const mX = mean(benchReturns);
  const mY = mean(returns);
  let cov = 0, varX = 0;
  for (let i = 0; i < returns.length; i++) {
    cov += (benchReturns[i] - mX) * (returns[i] - mY);
    varX += (benchReturns[i] - mX) * (benchReturns[i] - mX);
  }
  cov /= Math.max(1, returns.length - 1);
  varX /= Math.max(1, benchReturns.length - 1);
  return varX === 0 ? 0 : cov / varX;
}

module.exports = { dailyReturns, mean, stddev, sharpeRatio, sortinoRatio, maxDrawdown, var95, expectedShortfall95, betaVsBenchmark };
