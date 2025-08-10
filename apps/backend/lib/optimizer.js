function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

function projectToSimplexWithUpperBounds(weights, upperBound) {
  // Project to { w >= 0, w <= ub, sum w = 1 }
  const n = weights.length;
  const ub = Array.isArray(upperBound) ? upperBound : Array(n).fill(upperBound ?? 1);
  // Initialize with clipping to [0, ub]
  let w = weights.map((v, i) => clamp(v, 0, ub[i]));
  let sum = w.reduce((a, b) => a + b, 0);
  // If sum == 1, done; else shift uniformly while respecting bounds
  // Use iterative water-filling
  const maxIter = 100;
  for (let iter = 0; iter < maxIter && Math.abs(sum - 1) > 1e-10; iter++) {
    const delta = (1 - sum) / n;
    let newSum = 0;
    let active = 0;
    const next = new Array(n);
    for (let i = 0; i < n; i++) {
      const v = clamp(w[i] + delta, 0, ub[i]);
      next[i] = v;
      newSum += v;
      if (v > 0 && v < ub[i]) active++;
    }
    w = next;
    sum = newSum;
    if (active === 0) break;
  }
  // Final normalization if still off due to bounds
  if (sum !== 0) w = w.map((v) => v / sum);
  return w;
}

function invertSymmetric(matrix, ridge = 1e-8) {
  const n = matrix.length;
  // Add ridge on diagonal for stability
  const a = matrix.map((row, i) => row.map((v, j) => (i === j ? v + ridge : v)));
  // Gaussian elimination to invert; not optimal but fine for small n
  const I = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let i = 0; i < n; i++) {
    // pivot
    let pivot = a[i][i];
    if (Math.abs(pivot) < 1e-12) {
      // find a row to swap
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(a[k][i]) > Math.abs(pivot)) {
          [a[i], a[k]] = [a[k], a[i]];
          [I[i], I[k]] = [I[k], I[i]];
          break;
        }
      }
      pivot = a[i][i];
      if (Math.abs(pivot) < 1e-12) throw new Error('Matrix not invertible');
    }
    // scale row
    const invPivot = 1 / pivot;
    for (let j = 0; j < n; j++) { a[i][j] *= invPivot; I[i][j] *= invPivot; }
    // eliminate others
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = a[k][i];
      for (let j = 0; j < n; j++) { a[k][j] -= factor * a[i][j]; I[k][j] -= factor * I[i][j]; }
    }
  }
  return I;
}

function matVecMul(A, x) { return A.map((row) => row.reduce((s, v, i) => s + v * x[i], 0)); }
function dot(a, b) { return a.reduce((s, v, i) => s + v * b[i], 0); }

function markowitzWeights(expectedReturns, covariance, options = {}) {
  const n = expectedReturns.length;
  const cap = options.maxWeight ?? 1;
  const ridge = options.l2 ?? 1e-6;
  // w* ∝ Σ^{-1} μ
  const inv = invertSymmetric(covariance, ridge);
  const raw = matVecMul(inv, expectedReturns);
  // Non-negative and cap constraints, sum to 1
  const nonneg = raw.map((v) => Math.max(0, v));
  const sum = nonneg.reduce((a, b) => a + b, 0) || 1;
  const normalized = nonneg.map((v) => v / sum);
  return projectToSimplexWithUpperBounds(normalized, cap);
}

function riskParityWeights(covariance, options = {}) {
  const n = covariance.length;
  let w = Array(n).fill(1 / n);
  // Iterative scheme: equalize marginal risk contributions
  const maxIter = options.maxIter ?? 200;
  const tol = options.tol ?? 1e-8;
  for (let iter = 0; iter < maxIter; iter++) {
    const Cw = matVecMul(covariance, w);
    const totalVar = dot(w, Cw);
    const mrc = Cw.map((v, i) => v * w[i]);
    const avg = totalVar / n;
    let maxDiff = 0;
    for (let i = 0; i < n; i++) {
      const grad = mrc[i] - avg;
      w[i] = Math.max(0, w[i] - 0.1 * grad);
      maxDiff = Math.max(maxDiff, Math.abs(grad));
    }
    // Normalize
    const s = w.reduce((a, b) => a + b, 0) || 1;
    w = w.map((v) => v / s);
    if (maxDiff < tol) break;
  }
  const cap = options.maxWeight ?? 1;
  return projectToSimplexWithUpperBounds(w, cap);
}

module.exports = { markowitzWeights, riskParityWeights, projectToSimplexWithUpperBounds };
