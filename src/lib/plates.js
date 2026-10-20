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
// Bar types for the menu. The weights are typical: bars differ by maker, so the label says "typical".
export const BAR_TYPES = {
  lb: [
    { w: 45, label: 'Olympic bar' }, { w: 35, label: "Women's bar" }, { w: 15, label: 'Technique bar' },
    { w: 25, label: 'EZ curl bar' }, { w: 55, label: 'Trap (hex) bar' }, { w: 65, label: 'Safety squat bar' },
  ],
  kg: [
    { w: 20, label: 'Olympic bar' }, { w: 15, label: "Women's bar" }, { w: 7, label: 'Technique bar' },
    { w: 10, label: 'EZ curl bar' }, { w: 25, label: 'Trap (hex) bar' }, { w: 30, label: 'Safety squat bar' },
  ],
};
export const MAX_PAIRS = 50;
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

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// Same search with a limit on how many of each plate fit on one side (the pairs you own).
// items: [{ u (hundredths), cap }] with finite caps. Fewest plates wins; on a tie the heavier plates win.
function boundedSides(items, want) {
  const eff = items.map((i) => ({ u: i.u, cap: Math.min(i.cap, Math.floor(want / i.u) + 1) })).filter((i) => i.cap > 0).sort((a, b) => a.u - b.u);
  if (!eff.length) return { lower: { sum: 0, list: [] }, upper: null };
  const g = eff.map((i) => i.u).reduce(gcd);
  const total = eff.reduce((a, i) => a + i.cap * i.u, 0) / g;
  let cur = new Int32Array(total + 1).fill(-1);
  cur[0] = 0;
  const choice = [];
  for (const it of eff) {
    const step = it.u / g;
    const next = new Int32Array(total + 1).fill(-1);
    const pick = new Int16Array(total + 1);
    for (let s = 0; s <= total; s++) {
      if (cur[s] < 0) continue;
      for (let k = 0; k <= it.cap && s + k * step <= total; k++) {
        const t = s + k * step, n = cur[s] + k;
        if (next[t] < 0 || n < next[t] || (n === next[t] && k > pick[t])) { next[t] = n; pick[t] = k; }
      }
    }
    cur = next;
    choice.push(pick);
  }
  const build = (s) => {
    const list = [];
    let left = s;
    for (let i = eff.length - 1; i >= 0; i--) {
      const k = choice[i][left];
      if (k > 0) list.push({ w: fromHundredths(eff[i].u), n: k });
      left -= k * (eff[i].u / g);
    }
    return { sum: fromHundredths(s * g), list };
  };
  const w = want / g;
  let lo = Math.min(Math.floor(w), total);
  while (lo > 0 && cur[lo] < 0) lo--;
  let hi = Math.ceil(w);
  while (hi <= total && cur[hi] < 0) hi++;
  return { lower: build(lo), upper: hi <= total ? build(hi) : null };
}

// Closest loads at or under, and at or over, a per-side weight.
// limits (optional): { [plateWeight]: most plates of that size on one side }. A missing plate has no limit.
// upper is null when the plates you own cannot reach the weight.
export function nearestSides(sideWeight, plates, limits = {}) {
  const ph = [...new Set(plates.map(toHundredths))].filter((u) => u > 0);
  const want = Math.max(0, toHundredths(sideWeight));
  if (!ph.length) return { lower: { sum: 0, list: [] }, upper: { sum: 0, list: [] } };
  const capOf = (u) => { const c = limits[fromHundredths(u)]; return Number.isFinite(c) && c >= 0 ? Math.floor(c) : Infinity; };
  if (ph.some((u) => capOf(u) !== Infinity)) return boundedSides(ph.map((u) => ({ u, cap: capOf(u) })), want);
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
export function solve({ target, bar, collar = 0, plates, limits = {} }) {
  if (!(target > 0)) return { status: 'empty' };
  const collarPair = collar * 2;
  const base = fromHundredths(toHundredths(bar) + toHundredths(collarPair));
  const sideWanted = (toHundredths(target) - toHundredths(base)) / 200;
  if (sideWanted <= 0) {
    return { status: toHundredths(target) === toHundredths(base) ? 'bar' : 'below', base, target, total: base, side: 0, list: [] };
  }
  const { lower, upper } = nearestSides(sideWanted, plates, limits);
  const lowTotal = loadedTotal(bar, collarPair, lower.sum);
  const upTotal = upper ? loadedTotal(bar, collarPair, upper.sum) : null;
  const dLow = Math.abs(toHundredths(target) - toHundredths(lowTotal));
  const dUp = upper ? Math.abs(toHundredths(upTotal) - toHundredths(target)) : Infinity;
  const exact = dLow === 0 || dUp === 0;
  const pickUpper = !exact && dUp < dLow;
  const pick = pickUpper ? upper : lower;
  const total = pickUpper ? upTotal : lowTotal;
  const side = pick.sum;
  const status = exact ? 'exact' : 'closest';
  return {
    status, base, target, total, side, list: pick.list,
    lower: { total: lowTotal, side: lower.sum, list: lower.list },
    upper: upper ? { total: upTotal, side: upper.sum, list: upper.list } : null,
    plateCount: pick.list.reduce((a, p) => a + p.n, 0),
  };
}

// Warm-up ramp. step > 0 rounds each set to a practical jump (5 lb or 2.5 kg) before the plates are chosen.
export function warmups({ target, bar, collar = 0, plates, limits = {}, percents = [40, 60, 80, 100], step = 0 }) {
  return percents.map((pct) => {
    const raw = (target * pct) / 100;
    const want = step > 0 ? Math.round(raw / step) * step : Math.round(raw * 100) / 100;
    const r = solve({ target: want, bar, collar, plates, limits });
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
export function exactHint({ target, bar, collar = 0, plates, limits = {}, all }) {
  const h = improveHint({ target, bar, collar, plates, limits, all });
  return h && h.exact ? h.plate : null;
}

// Find the smallest switched-off plate that gets closer to the target (or exact). Returns { plate, total, exact } or null.
export function improveHint({ target, bar, collar = 0, plates, limits = {}, all }) {
  const base = solve({ target, bar, collar, plates, limits });
  if (base.status !== 'closest') return null;
  const gap = Math.abs(toHundredths(base.total) - toHundredths(target));
  let better = null;
  for (const p of [...all].sort((a, b) => a - b)) {
    if (plates.includes(p)) continue;
    const s = solve({ target, bar, collar, plates: [...plates, p], limits });
    if (s.status === 'exact') return { plate: p, total: s.total, exact: true };
    if (!better && Math.abs(toHundredths(s.total) - toHundredths(target)) < gap) better = { plate: p, total: s.total, exact: false };
  }
  return better;
}

// Reverse mode: add up a loaded bar. counts: [{ w, n }] plates on ONE side. collar: weight of one collar.
export function countLoaded({ bar, collar = 0, counts }) {
  const list = counts.filter((c) => c.n > 0 && c.w > 0).sort((a, b) => b.w - a.w).map((c) => ({ w: c.w, n: Math.floor(c.n) }));
  const side = fromHundredths(list.reduce((a, c) => a + toHundredths(c.w) * c.n, 0));
  const total = loadedTotal(bar, collar * 2, side);
  return { side, total, list, plateCount: list.reduce((a, c) => a + c.n, 0) };
}

// Plain text for the Copy button when counting a loaded bar.
export function countText(c, unit, bar) {
  return c.list.length ? `${fmt(c.total)} ${unit}: ${describe(c.list)} per side (${fmt(bar)} ${unit} bar)` : `${fmt(c.total)} ${unit}: the empty bar`;
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

// Share link query: ?w=225&u=lb&bar=45&p=45,25,10,5,2.5 (l = plate limits as weight:count, c = weight of one collar, only when collars are on).
export function toQuery({ target, unit, bar, plates, collar = 0, limits = {} }) {
  let q = `w=${fmt(target)}&u=${unit}&bar=${fmt(bar)}&p=${plates.map(fmt).join(',')}`;
  if (collar > 0) q += `&c=${fmt(collar)}`;
  const l = plates.filter((w) => Number.isFinite(limits[w])).map((w) => `${fmt(w)}:${limits[w]}`);
  if (l.length) q += `&l=${l.join(',')}`;
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
  const bar = num(q.get('bar'), 0.01); if (bar !== null) out.bar = bar;
  const c = num(q.get('c'), 0.01); if (c !== null) out.collar = c;
  if (q.has('p') && unit) {
    out.plates = q.get('p').split(',').map(Number).filter((n) => PLATES[unit].includes(n));
    out.plates = [...new Set(out.plates)];
    if (q.has('l')) {
      const lim = {};
      for (const part of q.get('l').split(',')) {
        const [w, n] = part.split(':').map(Number);
        if (PLATES[unit].includes(w) && Number.isInteger(n) && n >= 0 && n <= MAX_PAIRS) lim[w] = n;
      }
      if (Object.keys(lim).length) out.limits = lim;
    }
  }
  return out;
}
