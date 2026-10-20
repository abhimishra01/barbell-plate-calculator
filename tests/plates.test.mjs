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
