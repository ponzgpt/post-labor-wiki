import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shortCite, year } from './sources.mjs';

test('short citations', () => {
  assert.equal(shortCite({ authors: ['John Maynard Keynes'], year: 1930 }), 'Keynes 1930');
  assert.equal(shortCite({ authors: ['Damon Jones', 'Ioana Marinescu'], year: 2022 }), 'Jones & Marinescu 2022');
  assert.equal(shortCite({ authors: ['A B', 'C D', 'E F'], year: 2022 }), 'B et al. 2022');
  assert.equal(shortCite({ authors: ['Martin Luther King Jr.'], year: 1967 }), 'King 1967');
  assert.equal(shortCite({ authors: ['Kela'], short: 'Kela', year: 2020 }), 'Kela 2020');
  assert.equal(year({ year: -350 }), 'c. 350 BCE');
});

test('same author and year get a/b suffixes', () => {
  const a = { id: 'a', authors: ['David Shapiro'], year: 2025 };
  const b = { id: 'b', authors: ['David Shapiro'], year: 2025 };
  assert.equal(shortCite(a, [a, b]), 'Shapiro 2025a');
  assert.equal(shortCite(b, [a, b]), 'Shapiro 2025b');
});
