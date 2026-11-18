import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annual, rebase, parseFred, real, shares, sumByYear } from './data.mjs';

test('annual drops incomplete years and averages the rest', () => {
  const q = (y, ...vs) => vs.map((v, i) => ({ date: `${y}-${String(i * 3 + 1).padStart(2, '0')}-01`, v }));
  const pts = annual([...q(2024, 1, 2, 3, 4), ...q(2025, 10, 10)]);
  assert.deepEqual(pts, [{ x: 2024, v: 2.5 }]);
});

test('rebase sets the base year to 100 and drops earlier years', () => {
  assert.deepEqual(rebase([{ x: 1, v: 5 }, { x: 2, v: 10 }, { x: 3, v: 15 }], 2), [{ x: 2, v: 100 }, { x: 3, v: 150 }]);
});

test('missing FRED values are skipped, not read as zero; one missing month keeps the year', () => {
  const months = Array.from({ length: 12 }, (_, i) => [`2025-${String(i + 1).padStart(2, '0')}-01`, i === 9 ? '' : '80']);
  assert.deepEqual(annual(parseFred(months)), [{ x: 2025, v: 80 }]);
});

test('real restates nominal values in base-year prices and skips years without CPI', () => {
  const cpi = [{ x: 2000, v: 50 }, { x: 2020, v: 100 }];
  assert.deepEqual(real([{ x: 2000, v: 10 }, { x: 2010, v: 7 }, { x: 2020, v: 10 }], cpi, 2020), [{ x: 2000, v: 20 }, { x: 2020, v: 10 }]);
});

test('shares sum to 100 and only use years every part covers', () => {
  const out = shares({ a: [{ x: 1, v: 3 }, { x: 2, v: 1 }], b: [{ x: 2, v: 3 }] });
  assert.deepEqual(out, { a: [{ x: 2, v: 25 }], b: [{ x: 2, v: 75 }] });
  assert.deepEqual(sumByYear([{ x: 1, v: 1 }, { x: 2, v: 2 }], [{ x: 2, v: 5 }]), [{ x: 2, v: 7 }]);
});
