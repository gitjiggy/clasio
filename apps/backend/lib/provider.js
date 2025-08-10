const { get, set } = require('./cache');

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function normalizeQuote(q) {
  return {
    symbol: q.symbol,
    price: q.price,
    ohlc: q.ohlc,
    volume: q.volume,
    ts: q.ts,
    provider: q.provider || 'mock'
  };
}

function createMockProvider() {
  function quote(symbol) {
    const base = 100 + (symbol.charCodeAt(0) % 20);
    const price = +(base + Math.sin(Date.now() / 10000) * 2).toFixed(2);
    const o = +(price - 0.5).toFixed(2);
    const h = +(price + 0.7).toFixed(2);
    const l = +(price - 0.8).toFixed(2);
    const v = 1000000 + (Date.now() % 10000);
    return normalizeQuote({ symbol, price, ohlc: { open: o, high: h, low: l, close: price }, volume: v, ts: new Date().toISOString(), provider: 'mock' });
  }
  function news(symbol) { return [{ id: `${symbol}-n1`, title: `${symbol} update`, ts: new Date().toISOString() }]; }
  function fundamentals(symbol) { return { symbol, pe: 20 + (symbol.charCodeAt(0) % 10), dividendYield: 0.015, ttmRevenueGrowth: 0.12 }; }
  return { quote, news, fundamentals };
}

function createPolygonProvider(apiKey) {
  const base = 'https://api.polygon.io';
  async function fetchJson(path, retries = 2) {
    const url = `${base}${path}${path.includes('?') ? '&' : '?'}apiKey=${apiKey}`;
    const cached = await get(url);
    if (cached) return JSON.parse(cached);
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`polygon_http_${res.status}`);
        const json = await res.json();
        await set(url, JSON.stringify(json), 2);
        return json;
      } catch (e) {
        if (attempt === retries) throw e;
        await sleep(200 * Math.pow(2, attempt));
      }
    }
  }
  async function quote(symbol) {
    // Placeholder: in a real impl, call aggregates or last trade
    const p = 100 + (symbol.charCodeAt(0) % 20);
    const price = +p.toFixed(2);
    return normalizeQuote({ symbol, price, ohlc: { open: price - 0.5, high: price + 0.7, low: price - 0.8, close: price }, volume: 1000000, ts: new Date().toISOString(), provider: 'polygon' });
  }
  async function fundamentals(symbol) {
    try {
      const json = await fetchJson(`/vX/reference/financials?ticker=${symbol}&limit=1`);
      return { symbol, pe: json.results?.[0]?.metrics?.peRatio ?? 20, dividendYield: json.results?.[0]?.metrics?.dividendYield ?? 0.01 };
    } catch {
      return { symbol, pe: 20, dividendYield: 0.01 };
    }
  }
  function news(symbol) { return [{ id: `${symbol}-n1`, title: `${symbol} polygon stub`, ts: new Date().toISOString() }]; }
  return { quote, fundamentals, news };
}

function createProvider() {
  const key = process.env.POLYGON_API_KEY;
  try {
    if (key) return createPolygonProvider(key);
  } catch (_) {}
  return createMockProvider();
}

module.exports = { createMockProvider, createPolygonProvider, createProvider };
