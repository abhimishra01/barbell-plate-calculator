// Plate loading logic. Pure functions, no DOM. All math runs in hundredths so 1.25 and 2.5 stay exact.
export const PLATES = {
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
export const BARS = {
  lb: [{ id: '45', w: 45, label: '45 lb' }, { id: '35', w: 35, label: '35 lb' }],
  kg: [{ id: '20', w: 20, label: '20 kg' }, { id: '15', w: 15, label: '15 kg' }],
};

export const toUnits = (w) => Math.round(w * 100);
export const fromUnits = (u) => u / 100;
export const fmt = (n) => String(+Number(n).toFixed(2));

// Smallest set of plates that adds up to every reachable sum from 0 to limit (unbounded plates, fewest plates).
function buildTable(plateUnits, limit) {
  const coins = [...plateUnits].sort((a, b) => b - a);
  const count = new Int32Array(limit + 1).fill(-1);
  const last = new Int32Array(limit + 1);
  count[0] = 0;
  for (let s = 1; s <= limit; s++) {
    for (const c of coins) {
      if (c > s || count[s - c] < 0) continue;
      const n = count[s - c] + 1;
      if (count[s] < 0 || n < count[s]) { count[s] = n; last[s] = c; } // larger plate wins ties
    }
  }
  return { count, last };
}

function listFor(table, sum) {
  const map = new Map();
  let s = sum;
  while (s > 0) { const c = table.last[s]; map.set(c, (map.get(c) || 0) + 1); s -= c; }
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([u, n]) => ({ w: fromUnits(u), n }));
}

// Closest loads at or under, and at or over, a per-side weight.
export function nearestSides(sideWeight, plates) {
  const pu = [...new Set(plates.map(toUnits))].filter((u) => u > 0);
  const want = Math.max(0, toUnits(sideWeight));
  if (!pu.length) return { lower: { sum: 0, list: [] }, upper: { sum: 0, list: [] } };
  const limit = want + Math.max(...pu);
  const table = buildTable(pu, limit);
  let lo = Math.min(want, limit);
  while (lo > 0 && table.count[lo] < 0) lo--;
  let hi = want;
  while (hi <= limit && table.count[hi] < 0) hi++;
  const up = hi <= limit ? hi : lo;
  return {
    lower: { sum: fromUnits(lo), list: listFor(table, lo) },
    upper: { sum: fromUnits(up), list: listFor(table, up) },
  };
}

const loadedTotal = (bar, collarPair, side) => fromUnits(toUnits(bar) + toUnits(collarPair) + 2 * toUnits(side));

// target: total weight wanted. bar: bar weight. collar: weight of ONE collar (0 for none). plates: enabled plate weights.
export function solve({ target, bar, collar = 0, plates }) {
  const collarPair = collar * 2;
  const base = fromUnits(toUnits(bar) + toUnits(collarPair));
  const sideWanted = (toUnits(target) - toUnits(base)) / 200;
  if (!(target > 0)) return { status: 'empty' };
  if (sideWanted <= 0) {
    return { status: toUnits(target) === toUnits(base) ? 'bar' : 'below', base, target, total: base, side: 0, list: [] };
  }
  const { lower, upper } = nearestSides(sideWanted, plates);
  const lowTotal = loadedTotal(bar, collarPair, lower.sum);
  const upTotal = loadedTotal(bar, collarPair, upper.sum);
  const dLow = Math.abs(toUnits(target) - toUnits(lowTotal));
  const dUp = Math.abs(toUnits(upTotal) - toUnits(target));
  const exact = dLow === 0 || dUp === 0;
  const pickUpper = !exact && dUp < dLow;
  const pick = pickUpper ? upper : lower;
  const total = pickUpper ? upTotal : lowTotal;
  const side = pick.sum;
  const status = exact ? 'exact' : 'closest';
  return {
    status, base, target, total, side, list: pick.list,
    lower: { total: lowTotal, side: lower.sum, list: lower.list },
    upper: { total: upTotal, side: upper.sum, list: upper.list },
    plateCount: pick.list.reduce((a, p) => a + p.n, 0),
  };
}

export function warmups({ target, bar, collar = 0, plates, percents = [40, 60, 80, 100] }) {
  return percents.map((pct) => {
    const want = Math.round((target * pct) / 100 * 100) / 100;
    const r = solve({ target: want, bar, collar, plates });
    return { pct, want, ...r };
  });
}

export function convertWeight(w, from, to) {
  if (from === to) return w;
  return from === 'lb' ? w * 0.45359237 : w / 0.45359237;
}

export function describe(list) {
  return list.map((p) => `${fmt(p.w)} x ${p.n}`).join(', ');
}
