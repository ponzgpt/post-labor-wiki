import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, earthy, themeBlocks } from './color.mjs';

test('WCAG contrast of black on white is 21', () => {
  assert.equal(Math.round(contrast('#000', '#fff')), 21);
  assert.ok(contrast('#767676', '#ffffff') >= 4.5);
});

test('the old sepia theme is flagged as earthy; cool and vivid colours are not', () => {
  for (const c of ['#c0582b', '#b08419', '#1c1814', '#faf6ee', '#9c8f7b', '#a4441b']) assert.ok(earthy(c), c);
  for (const c of ['#1d64d8', '#d9367a', '#0b1220', '#f6f8fb', '#808080', '#14873a', '#c0263f']) assert.ok(!earthy(c), c);
});

test('theme blocks are read from all three scopes', () => {
  const css = `:root { --a: #fff; }\n@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --a: #000; } }\n:root[data-theme="dark"] { --a: #000; }`;
  assert.deepEqual(themeBlocks(css), { light: { '--a': '#fff' }, darkMedia: { '--a': '#000' }, dark: { '--a': '#000' } });
});
