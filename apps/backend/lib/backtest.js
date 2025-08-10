function seriesCAGR(series, periodsPerYear = 252) {
  if (series.length < 2) return 0;
  const total = series[series.length - 1] / series[0];
  const years = (series.length - 1) / periodsPerYear;
  return Math.pow(total, 1 / years) - 1;
}

function dailyReturns(series) {
  const r = [];
  for (let i = 1; i < series.length; i++) r.push((series[i] - series[i - 1]) / series[i - 1]);
  return r;
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

function sharpe(returns, rf = 0) {
  const ex = returns.map((r) => r - rf / 252);
  const mean = ex.reduce((a, b) => a + b, 0) / Math.max(1, ex.length);
  const variance = ex.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, ex.length);
  const vol = Math.sqrt(variance) * Math.sqrt(252);
  return vol === 0 ? 0 : (mean * 252) / vol;
}

function buyAndHold(prices, txCostBps = 0, slippageBps = 0) {
  // Assume invest 1 unit at start
  const costs = (txCostBps + slippageBps) / 10000;
  const effectiveStart = prices[0] * (1 + costs);
  const series = prices.map((p) => (p / effectiveStart));
  const r = dailyReturns(series);
  return { cagr: seriesCAGR(series), sharpe: sharpe(r), maxDrawdown: maxDrawdown(series), series };
}

function periodicRebalance(pricesMatrix, weights, freq = 20, txCostBps = 0, slippageBps = 0) {
  // pricesMatrix: [time][asset]
  const n = weights.length;
  const costs = (txCostBps + slippageBps) / 10000;
  let holdings = weights.map((w, i) => (w / pricesMatrix[0][i]));
  let portfolioSeries = [1];
  let lastRebal = 0;
  for (let t = 1; t < pricesMatrix.length; t++) {
    const values = holdings.map((q, i) => q * pricesMatrix[t][i]);
    const port = values.reduce((a, b) => a + b, 0);
    portfolioSeries.push(port);
    if ((t - lastRebal) >= freq) {
      // Rebalance to target
      const targetValues = weights.map((w) => w * port);
      const targetQty = targetValues.map((tv, i) => tv / pricesMatrix[t][i]);
      // Apply linear transaction costs on turnover
      const turnover = targetQty.reduce((sum, tq, i) => sum + Math.abs(tq - holdings[i]) * pricesMatrix[t][i], 0);
      const fee = turnover * costs;
      const newPort = port - fee;
      holdings = targetValues.map((tv, i) => (tv / pricesMatrix[t][i]) * (newPort / port));
      lastRebal = t;
    }
  }
  const series = portfolioSeries.map((v) => v / portfolioSeries[0]);
  const r = dailyReturns(series);
  return { cagr: seriesCAGR(series), sharpe: sharpe(r), maxDrawdown: maxDrawdown(series), series };
}

function smaCross(prices, shortWin = 20, longWin = 50, txCostBps = 0, slippageBps = 0) {
  const costs = (txCostBps + slippageBps) / 10000;
  const ma = (idx, win) => {
    if (idx + 1 < win) return null;
    let s = 0; for (let i = idx - win + 1; i <= idx; i++) s += prices[i];
    return s / win;
  };
  let invested = false;
  let units = 0;
  let cash = 1; // start with 1 unit of capital
  const series = [1];
  for (let t = 1; t < prices.length; t++) {
    const s = ma(t, shortWin);
    const l = ma(t, longWin);
    if (s != null && l != null) {
      if (!invested && s > l) {
        // buy
        const price = prices[t] * (1 + costs);
        units = cash / price;
        cash = 0;
        invested = true;
      } else if (invested && s < l) {
        // sell
        cash = units * prices[t] * (1 - costs);
        units = 0;
        invested = false;
      }
    }
    const port = invested ? units * prices[t] : cash;
    series.push(port);
  }
  const norm = series.map((v) => v / series[0]);
  const r = dailyReturns(norm);
  return { cagr: seriesCAGR(norm), sharpe: sharpe(r), maxDrawdown: maxDrawdown(norm), series: norm };
}

module.exports = { buyAndHold, periodicRebalance, smaCross };
