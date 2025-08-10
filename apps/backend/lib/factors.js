const sectorMap = {
  AAPL: 'Technology', MSFT: 'Technology', VOO: 'Broad Market', AGG: 'Bonds',
  VTI: 'Broad Market', VEA: 'International', VWO: 'Emerging', QQQ: 'Technology',
};

function sectorFor(symbol) { return sectorMap[symbol] || 'Other'; }

function computeSectorExposure(positions) {
  // positions: [{ symbol, qty, price }]
  const values = positions.map((p) => ({ ...p, value: (Number(p.qty) || 0) * (Number(p.price) || 0) }));
  const total = values.reduce((a, b) => a + b.value, 0) || 1;
  const bySector = new Map();
  for (const p of values) {
    const sector = sectorFor(p.symbol);
    bySector.set(sector, (bySector.get(sector) || 0) + p.value);
  }
  return Array.from(bySector.entries()).map(([sector, v]) => ({ sector, weight: v / total }));
}

module.exports = { computeSectorExposure, sectorFor };
