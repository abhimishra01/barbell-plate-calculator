// Plate loading logic. Pure functions, no DOM. All math runs in hundredths so 1.25 and 2.5 stay exact.
export const PLATES = {
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
// Plate sets the person can pick in one tap. The first set in each unit is the default.
export const PRESETS = {
  lb: [
    { id: 'gym', label: 'Commercial gym', plates: [45, 25, 10, 5, 2.5] },
    { id: 'home', label: 'Home set', plates: [45, 35, 25, 10, 5, 2.5] },
    { id: 'all', label: 'All plates', plates: [...PLATES.lb] },
  ],
  kg: [
    { id: 'comp', label: 'Competition', plates: [...PLATES.kg] },
    { id: 'gym', label: 'Gym (no 1.25)', plates: [25, 20, 15, 10, 5, 2.5] },
    { id: 'home', label: 'Home set', plates: [20, 10, 5, 2.5, 1.25] },
  ],
};
// Plates that start switched on. Few US gyms own 1.25 lb plates or 35 lb plates.
export const DEFAULT_PLATES = {
  lb: [...PRESETS.lb[0].plates],
  kg: [...PRESETS.kg[0].plates],
};
// Preset bar weights. The bar id in the UI is the weight as a string, or 'custom'.
export const BARS = { lb: [45, 35], kg: [20, 15] };
// Smallest practical jump for the target field and for rounding warm-ups.
export const STEP = { lb: 5, kg: 2.5 };
export const MAX_TARGET = 4999;

export const toHundredths = (w) => Math.round(w * 100);
export const fromHundredths = (h) => h / 100;
export const fmt = (n) => String(+Number(n).toFixed(2));

// Smallest set of plates that adds up to every reachable sum from 0 to limit (unbounded plates, fewest plates).
function buildTable(plateHundredths, limit) {
  const coins = [...plateHundredths].sort((a, b) => b - a);
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
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([u, n]) => ({ w: fromHundredths(u), n }));
}

// Closest loads at or under, and at or over, a per-side weight.
export function nearestSides(sideWeight, plates) {
  const ph = [...new Set(plates.map(toHundredths))].filter((u) => u > 0);
  const want = Math.max(0, toHundredths(sideWeight));
  if (!ph.length) return { lower: { sum: 0, list: [] }, upper: { sum: 0, list: [] } };
  const limit = want + Math.max(...ph);
  const table = buildTable(ph, limit);
  // Every multiple of the largest plate is reachable, so both searches end inside [0, limit].
  let lo = want;
  while (lo > 0 && table.count[lo] < 0) lo--;
  let hi = want;
  while (table.count[hi] < 0) hi++;
  return {
    lower: { sum: fromHundredths(lo), list: listFor(table, lo) },
    upper: { sum: fromHundredths(hi), list: listFor(table, hi) },
  };
}

const loadedTotal = (bar, collarPair, side) => fromHundredths(toHundredths(bar) + toHundredths(collarPair) + 2 * toHundredths(side));

// target: total weight wanted. bar: bar weight. collar: weight of ONE collar (0 for none). plates: enabled plate weights.
export function solve({ target, bar, collar = 0, plates }) {
  if (!(target > 0)) return { status: 'empty' };
  const collarPair = collar * 2;
  const base = fromHundredths(toHundredths(bar) + toHundredths(collarPair));
  const sideWanted = (toHundredths(target) - toHundredths(base)) / 200;
  if (sideWanted <= 0) {
    return { status: toHundredths(target) === toHundredths(base) ? 'bar' : 'below', base, target, total: base, side: 0, list: [] };
  }
  const { lower, upper } = nearestSides(sideWanted, plates);
  const lowTotal = loadedTotal(bar, collarPair, lower.sum);
  const upTotal = loadedTotal(bar, collarPair, upper.sum);
  const dLow = Math.abs(toHundredths(target) - toHundredths(lowTotal));
  const dUp = Math.abs(toHundredths(upTotal) - toHundredths(target));
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

// Warm-up ramp. step > 0 rounds each set to a practical jump (5 lb or 2.5 kg) before the plates are chosen.
export function warmups({ target, bar, collar = 0, plates, percents = [40, 60, 80, 100], step = 0 }) {
  return percents.map((pct) => {
    const raw = (target * pct) / 100;
    const want = step > 0 ? Math.round(raw / step) * step : Math.round(raw * 100) / 100;
    const r = solve({ target: want, bar, collar, plates });
    return { pct, want, ...r };
  });
}

export function convertWeight(w, from, to) {
  if (from === to) return w;
  return from === 'lb' ? w * 0.45359237 : w / 0.45359237;
}

// Convert a target to the other unit and round it to that unit's step. An empty target stays empty.
export function convertTarget(w, from, to) {
  if (!(w > 0) || from === to) return w;
  return Math.max(STEP[to], Math.round(convertWeight(w, from, to) / STEP[to]) * STEP[to]);
}

// Read a typed number. Accepts "62,5" (decimal comma) and "1,225" (thousands comma). Returns NaN if not a number.
export function parseNumber(text) {
  let t = String(text).trim();
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
  else t = t.replace(',', '.');
  if (!/^\d*\.?\d*$/.test(t) || t === '' || t === '.') return NaN;
  return Number(t);
}

// "45 x 2, 10 x 1" for one side.
export function describe(list) {
  return list.map((p) => `${fmt(p.w)} x ${p.n}`).join(', ');
}

// When the target is not exact, find the smallest switched-off plate that would make it exact. Returns its weight or null.
export function exactHint({ target, bar, collar = 0, plates, all }) {
  if (solve({ target, bar, collar, plates }).status !== 'closest') return null;
  for (const p of [...all].sort((a, b) => a - b)) {
    if (plates.includes(p)) continue;
    if (solve({ target, bar, collar, plates: [...plates, p] }).status === 'exact') return p;
  }
  return null;
}

// Plain text for the Copy button. r is the result of solve().
export function resultText(r, unit, bar) {
  if (r.status === 'bar') return `${fmt(r.total)} ${unit}: the empty bar`;
  if (r.status !== 'exact' && r.status !== 'closest') return '';
  const body = `${fmt(r.total)} ${unit}: ${describe(r.list)} per side (${fmt(bar)} ${unit} bar)`;
  return r.status === 'exact' ? body : `${fmt(r.target)} ${unit} is not possible with these plates. Closest: ${body}`;
}

// Read a list of warm-up percents such as "40, 60, 80". Returns null if nothing usable. Keeps at most 5, sorted, from 5 to 95.
export function parsePercents(text) {
  const nums = String(text).split(/[\s,;]+/).filter(Boolean).map((t) => Number(t.replace('%', '')));
  if (!nums.length || nums.some((n) => !Number.isFinite(n) || n < 5 || n > 95)) return null;
  return [...new Set(nums.map((n) => Math.round(n)))].sort((a, b) => a - b).slice(0, 5);
}

// Share link query: ?w=225&u=lb&bar=45&p=45,25,10,5,2.5 (c = weight of one collar, only when collars are on).
export function toQuery({ target, unit, bar, plates, collar = 0 }) {
  let q = `w=${fmt(target)}&u=${unit}&bar=${fmt(bar)}&p=${plates.map(fmt).join(',')}`;
  if (collar > 0) q += `&c=${fmt(collar)}`;
  return q;
}

// Read a share link query. Returns only the fields that are valid.
export function fromQuery(text) {
  const q = new URLSearchParams(String(text).replace(/^\?/, ''));
  const out = {};
  const num = (v, min) => { const n = parseNumber(v ?? ''); return Number.isFinite(n) && n >= min && n <= MAX_TARGET ? n : null; };
  const unit = q.get('u') === 'kg' ? 'kg' : q.get('u') === 'lb' ? 'lb' : null;
  if (unit) out.unit = unit;
  const w = num(q.get('w'), 0.01); if (w !== null) out.target = w;
  const bar = num(q.get('bar'), 0); if (bar !== null) out.bar = bar;
  const c = num(q.get('c'), 0.01); if (c !== null) out.collar = c;
  if (q.has('p') && unit) {
    out.plates = q.get('p').split(',').map(Number).filter((n) => PLATES[unit].includes(n));
    out.plates = [...new Set(out.plates)];
  }
  return out;
}
