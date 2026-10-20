import test from 'node:test';
import assert from 'node:assert/strict';
import { solve, warmups, nearestSides, describe, convertWeight, convertTarget, parseNumber, PLATES, DEFAULT_PLATES } from '../src/lib/plates.js';

const L = PLATES.lb, K = PLATES.kg;
const asList = (r) => r.list.map((p) => [p.w, p.n]);

test('225 lb on a 45 lb bar is two 45s per side', () => {
  const r = solve({ target: 225, bar: 45, plates: L });
  assert.equal(r.status, 'exact');
  assert.deepEqual(asList(r), [[45, 2]]);
  assert.equal(r.total, 225);
});
test('135 lb is one 45 per side', () => {
  const r = solve({ target: 135, bar: 45, plates: L });
  assert.deepEqual(asList(r), [[45, 1]]);
});
test('185 lb: 45, 25 per side', () => {
  const r = solve({ target: 185, bar: 45, plates: L });
  assert.deepEqual(asList(r), [[45, 1], [25, 1]]);
});
test('315 lb: three 45s per side', () => {
  assert.deepEqual(asList(solve({ target: 315, bar: 45, plates: L })), [[45, 3]]);
});
test('100 kg on a 20 kg bar: 25, 15 per side', () => {
  const r = solve({ target: 100, bar: 20, plates: K });
  assert.equal(r.status, 'exact');
  assert.deepEqual(asList(r), [[25, 1], [15, 1]]);
});
test('fractional plate: 102.5 kg is 41.25 per side (25 + 15 + 1.25)', () => {
  const r = solve({ target: 102.5, bar: 20, plates: K });
  assert.equal(r.status, 'exact');
  assert.deepEqual(asList(r), [[25, 1], [15, 1], [1.25, 1]]);
});
test('impossible weight returns the closest, with a lower and upper option', () => {
  const r = solve({ target: 226, bar: 45, plates: L });
  assert.equal(r.status, 'closest');
  assert.equal(r.total, 225);
  assert.equal(r.lower.total, 225);
  assert.equal(r.upper.total, 227.5);
});
test('closest picks the upper side when it is nearer', () => {
  const r = solve({ target: 227, bar: 45, plates: L });
  assert.equal(r.total, 227.5);
});
test('a tie goes to the lighter load', () => {
  const r = solve({ target: 226.25, bar: 45, plates: L });
  assert.equal(r.total, 225);
});
test('collars are subtracted', () => {
  const r = solve({ target: 100, bar: 20, collar: 2.5, plates: K });
  assert.equal(r.base, 25);
  assert.equal(r.status, 'exact');
  assert.deepEqual(asList(r), [[25, 1], [10, 1], [2.5, 1]]);
});
test('target equal to the bar is bar only; below the bar is flagged', () => {
  assert.equal(solve({ target: 45, bar: 45, plates: L }).status, 'bar');
  assert.equal(solve({ target: 30, bar: 45, plates: L }).status, 'below');
  assert.equal(solve({ target: 0, bar: 45, plates: L }).status, 'empty');
});
test('limited plates: only 45 and 10 enabled, 155 lb', () => {
  const r = solve({ target: 155, bar: 45, plates: [45, 10] });
  assert.equal(r.status, 'exact');
  assert.deepEqual(asList(r), [[45, 1], [10, 1]]);
});
test('non-greedy set: plates 30 and 20, side 40 uses two 20s', () => {
  const { lower } = nearestSides(40, [30, 20]);
  assert.equal(lower.sum, 40);
  assert.deepEqual(lower.list.map((p) => [p.w, p.n]), [[20, 2]]);
});
test('no plates enabled loads nothing', () => {
  const r = solve({ target: 135, bar: 45, plates: [] });
  assert.equal(r.status, 'closest');
  assert.equal(r.total, 45);
});
test('warm-up table at 40, 60, 80, 100 percent', () => {
  const w = warmups({ target: 225, bar: 45, plates: L });
  assert.deepEqual(w.map((x) => x.pct), [40, 60, 80, 100]);
  assert.equal(w[0].want, 90);
  assert.equal(w[0].total, 90);          // 90 = bar + 22.5 per side = 10 + 10 + 2.5
  assert.equal(w[1].total, 135);
  assert.equal(w[2].total, 180);
  assert.equal(w[3].total, 225);
});
test('describe and conversion', () => {
  assert.equal(describe([{ w: 45, n: 2 }, { w: 2.5, n: 1 }]), '45 x 2, 2.5 x 1');
  assert.ok(Math.abs(convertWeight(225, 'lb', 'kg') - 102.058) < 0.01);
  assert.ok(Math.abs(convertWeight(100, 'kg', 'lb') - 220.462) < 0.01);
});

test('default lb plates leave out 1.25, kg keeps it', () => {
  assert.ok(!DEFAULT_PLATES.lb.includes(1.25));
  assert.ok(DEFAULT_PLATES.kg.includes(1.25));
});
test('with default lb plates the smallest step is 5 lb total', () => {
  const r = solve({ target: 227.5, bar: 45, plates: DEFAULT_PLATES.lb });
  assert.equal(r.status, 'closest');
  assert.equal(r.total, 225);
});
test('35 lb bar and 15 kg bar', () => {
  assert.deepEqual(asList(solve({ target: 155, bar: 35, plates: L })), [[35, 1], [25, 1]]);
  assert.deepEqual(asList(solve({ target: 62.5, bar: 15, plates: K })), [[20, 1], [2.5, 1], [1.25, 1]]);
});
test('kg closest picks the nearer load and offers the other side', () => {
  const r = solve({ target: 61, bar: 20, plates: K });
  assert.equal(r.status, 'closest');
  assert.equal(r.total, 60);
  assert.equal(r.upper.total, 62.5);
});
test('1 lb collars at 225 lb give 224.5 as the closest load', () => {
  const r = solve({ target: 225, bar: 45, collar: 1, plates: L });
  assert.equal(r.status, 'closest');
  assert.equal(r.total, 224.5);
  assert.equal(r.base, 47);
});
test('largest input (4999) works and is exact on a 1.25 lb step', () => {
  const r = solve({ target: 4999, bar: 45, plates: L });
  assert.ok(Math.abs(r.total - 4999) <= 1.25);
});
test('solver matches brute force for several plate sets', () => {
  const sets = [[45, 35, 25, 10, 5, 2.5], [45, 25, 10, 5], [25, 20, 15, 10, 5, 2.5, 1.25], [20, 5, 1.25]];
  for (const plates of sets) {
    const reach = new Set([0]);
    for (let i = 0; i < 8; i++) for (const s of [...reach]) for (const p of plates) reach.add(Math.round((s + p) * 100) / 100);
    for (let side = 0; side <= 60; side += 0.25) {
      const { lower, upper } = nearestSides(side, plates);
      const sums = [...reach].filter((x) => x <= 60 + Math.max(...plates));
      const lo = Math.max(...sums.filter((x) => x <= side));
      const hi = Math.min(...sums.filter((x) => x >= side));
      assert.equal(lower.sum, lo, `lower at ${side} with ${plates}`);
      assert.equal(upper.sum, hi, `upper at ${side} with ${plates}`);
    }
  }
});
test('warm-ups round to a practical step, so 226 lb gives clean sets', () => {
  const w = warmups({ target: 226, bar: 45, plates: DEFAULT_PLATES.lb, step: 5 });
  assert.deepEqual(w.map((x) => x.want), [90, 135, 180, 225]);
  assert.ok(w.every((x) => x.status === 'exact'));
});
test('warm-up below the bar shows as bar only', () => {
  const w = warmups({ target: 60, bar: 45, plates: L, step: 5 });
  assert.equal(w[0].status, 'below');
});
test('unit switch rounds to the new step and keeps an empty target empty', () => {
  assert.equal(convertTarget(135, 'lb', 'kg'), 60);
  assert.equal(convertTarget(60, 'kg', 'lb'), 130);
  assert.equal(convertTarget(0, 'lb', 'kg'), 0);
  assert.equal(convertTarget(225, 'lb', 'lb'), 225);
});
test('parseNumber: decimal comma, thousands comma, junk', () => {
  assert.equal(parseNumber('62,5'), 62.5);
  assert.equal(parseNumber('1,225'), 1225);
  assert.equal(parseNumber('1,225.5'), 1225.5);
  assert.equal(parseNumber('225'), 225);
  assert.ok(Number.isNaN(parseNumber('abc')));
  assert.ok(Number.isNaN(parseNumber('')));
  assert.ok(Number.isNaN(parseNumber('12abc')));
});

import { BAR_TYPES, BARS, improveHint, countLoaded, countText, PRESETS, exactHint, resultText, parsePercents, toQuery, fromQuery } from '../src/lib/plates.js';

test('default lb set is the commercial gym set (no 35 lb plate)', () => {
  assert.deepEqual(DEFAULT_PLATES.lb, [45, 25, 10, 5, 2.5]);
  assert.deepEqual(asList(solve({ target: 300, bar: 45, plates: DEFAULT_PLATES.lb })), [[45, 2], [25, 1], [10, 1], [2.5, 1]]);
  assert.ok(PRESETS.lb.some((p) => p.id === 'home' && p.plates.includes(35)));
});
test('exactHint names the plate that would make the target exact', () => {
  assert.equal(exactHint({ target: 227.5, bar: 45, plates: DEFAULT_PLATES.lb, all: PLATES.lb }), 1.25);
  assert.equal(exactHint({ target: 227, bar: 45, plates: DEFAULT_PLATES.lb, all: PLATES.lb }), null);
  assert.equal(exactHint({ target: 225, bar: 45, plates: DEFAULT_PLATES.lb, all: PLATES.lb }), null);
});
test('resultText for exact, closest and bar', () => {
  assert.equal(resultText(solve({ target: 225, bar: 45, plates: DEFAULT_PLATES.lb }), 'lb', 45), '225 lb: 45 x 2 per side (45 lb bar)');
  assert.match(resultText(solve({ target: 227, bar: 45, plates: DEFAULT_PLATES.lb }), 'lb', 45), /^227 lb is not possible .* Closest: 225 lb: 45 x 2 per side/);
  assert.equal(resultText(solve({ target: 45, bar: 45, plates: DEFAULT_PLATES.lb }), 'lb', 45), '45 lb: the empty bar');
});
test('parsePercents', () => {
  assert.deepEqual(parsePercents('40, 60, 80'), [40, 60, 80]);
  assert.deepEqual(parsePercents('80 50 50%'), [50, 80]);
  assert.equal(parsePercents('0, 50'), null);
  assert.equal(parsePercents('abc'), null);
  assert.equal(parsePercents('10,20,30,40,50,60,70').length, 5);
});
test('share query round trip and bad input', () => {
  const q = toQuery({ target: 225, unit: 'lb', bar: 45, plates: [45, 25, 10, 5, 2.5], collar: 0 });
  assert.equal(q, 'w=225&u=lb&bar=45&p=45,25,10,5,2.5');
  assert.deepEqual(fromQuery(q), { unit: 'lb', target: 225, bar: 45, plates: [45, 25, 10, 5, 2.5] });
  assert.deepEqual(fromQuery('?w=100&u=kg&bar=20&p=25,15,99&c=2.5'), { unit: 'kg', target: 100, bar: 20, collar: 2.5, plates: [25, 15] });
  assert.deepEqual(fromQuery('?w=abc&u=stone&bar=-5&p=45'), {});
  assert.equal(fromQuery('?w=999999').target, undefined);
});

// Round 3
test('plate limits: one pair of 45s forces smaller plates for 315', () => {
  const r = solve({ target: 315, bar: 45, plates: DEFAULT_PLATES.lb, limits: { 45: 1 } });
  assert.equal(r.status, 'exact');
  assert.equal(r.list.find((p) => p.w === 45).n, 1);
  assert.equal(r.side, 135);
  assert.equal(r.total, 315);
});
test('plate limits never exceed what is owned, and totals stay right', () => {
  for (const target of [135, 185, 225, 275, 315, 365, 405, 455, 505]) {
    const limits = { 45: 2, 25: 1, 10: 2, 5: 1, 2.5: 1 };
    const r = solve({ target, bar: 45, plates: DEFAULT_PLATES.lb, limits });
    for (const p of r.list) assert.ok(p.n <= limits[p.w], `${target}: ${p.w} x ${p.n}`);
    const side = r.list.reduce((a, p) => a + p.w * p.n, 0);
    assert.equal(45 + 2 * side, r.total);
  }
});
test('plate limits: weight above what you own gives the heaviest load and no upper card', () => {
  const r = solve({ target: 500, bar: 45, plates: DEFAULT_PLATES.lb, limits: { 45: 1, 25: 0, 10: 0, 5: 0, 2.5: 0 } });
  assert.equal(r.status, 'closest');
  assert.equal(r.total, 135);
  assert.equal(r.upper, null);
});
test('plate limits: a limit of zero removes the plate', () => {
  const r = solve({ target: 135, bar: 45, plates: [45, 25, 10, 5], limits: { 45: 0 } });
  assert.equal(r.status, 'exact');
  assert.ok(!r.list.some((p) => p.w === 45));
  assert.equal(r.total, 135);
});
test('plate limits: all plates limited to zero leaves the empty bar', () => {
  const r = solve({ target: 135, bar: 45, plates: [45], limits: { 45: 0 } });
  assert.equal(r.total, 45);
  assert.equal(r.status, 'closest');
});
test('plate limits: uses fewest plates and keeps closest under and over', () => {
  const r = solve({ target: 227, bar: 45, plates: DEFAULT_PLATES.lb, limits: { 45: 2 } });
  assert.equal(r.lower.total, 225);
  assert.equal(r.upper.total, 230);
  assert.deepEqual(asList(solve({ target: 100, bar: 20, plates: K, limits: { 25: 1, 20: 5 } })), [[25, 1], [15, 1]]);
});
test('limits without any entry behave like no limits', () => {
  assert.deepEqual(solve({ target: 300, bar: 45, plates: DEFAULT_PLATES.lb, limits: {} }), solve({ target: 300, bar: 45, plates: DEFAULT_PLATES.lb }));
});
test('warm-ups respect plate limits', () => {
  const w = warmups({ target: 315, bar: 45, plates: DEFAULT_PLATES.lb, limits: { 45: 1 }, step: 5 });
  for (const x of w) for (const p of x.list || []) if (p.w === 45) assert.ok(p.n <= 1);
});
test('countLoaded adds a loaded bar', () => {
  const c = countLoaded({ bar: 45, counts: [{ w: 10, n: 1 }, { w: 45, n: 2 }] });
  assert.equal(c.side, 100);
  assert.equal(c.total, 245);
  assert.deepEqual(c.list, [{ w: 45, n: 2 }, { w: 10, n: 1 }]);
  assert.equal(c.plateCount, 3);
  assert.equal(countLoaded({ bar: 45, counts: [] }).total, 45);
  assert.equal(countLoaded({ bar: 20, collar: 2.5, counts: [{ w: 1.25, n: 1 }] }).total, 27.5);
  assert.equal(countText(c, 'lb', 45), '245 lb: 45 x 2, 10 x 1 per side (45 lb bar)');
  assert.equal(countText(countLoaded({ bar: 45, counts: [] }), 'lb', 45), '45 lb: the empty bar');
});
test('countLoaded is the inverse of solve', () => {
  for (const target of [135, 185, 225, 300, 315]) {
    const r = solve({ target, bar: 45, plates: DEFAULT_PLATES.lb });
    assert.equal(countLoaded({ bar: 45, counts: r.list }).total, target);
  }
});
test('bar types: typical weights, unique per unit, Olympic and women first', () => {
  for (const u of ['lb', 'kg']) {
    const ws = BAR_TYPES[u].map((b) => b.w);
    assert.equal(new Set(ws).size, ws.length);
    assert.deepEqual(ws.slice(0, 2), BARS[u]);
  }
  const lb = Object.fromEntries(BAR_TYPES.lb.map((b) => [b.label, b.w]));
  assert.equal(lb['Technique bar'], 15);
  assert.equal(lb['EZ curl bar'], 25);
  assert.equal(lb['Trap (hex) bar'], 55);
  assert.equal(lb['Safety squat bar'], 65);
});
test('improveHint names a plate that gets closer, or exact', () => {
  const base = { bar: 45, plates: DEFAULT_PLATES.lb, all: PLATES.lb };
  assert.deepEqual(improveHint({ target: 227, ...base }), { plate: 1.25, total: 227.5, exact: false });
  assert.deepEqual(improveHint({ target: 227.5, ...base }), { plate: 1.25, total: 227.5, exact: true });
  assert.equal(improveHint({ target: 225, ...base }), null);
});
test('improveHint works with plate limits', () => {
  const h = improveHint({ target: 315, bar: 45, plates: [45, 25], limits: { 45: 2 }, all: PLATES.lb });
  assert.equal(h.plate, 1.25);
  assert.equal(h.exact, true);
  assert.equal(improveHint({ target: 315, bar: 45, plates: [45, 25, 10, 5], limits: { 45: 2 }, all: PLATES.lb }), null);
});
test('share query carries plate limits', () => {
  const q = toQuery({ target: 315, unit: 'lb', bar: 45, plates: [45, 25], limits: { 45: 2, 10: 3 } });
  assert.equal(q, 'w=315&u=lb&bar=45&p=45,25&l=45:2');
  assert.deepEqual(fromQuery(q).limits, { 45: 2 });
  assert.equal(fromQuery('?u=lb&p=45&l=45:x,99:2,45:-1').limits, undefined);
});
