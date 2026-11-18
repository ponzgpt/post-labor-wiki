import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citations, proseWords, longQuotes, verified } from './rules.mjs';

test('citations are read from pages and data files, with their locators', () => {
  assert.deepEqual(citations('a <Cite id="x" at="p. 3" /> b <Cite id="y" />'), [{ id: 'x', at: 'p. 3' }, { id: 'y', at: undefined }]);
  assert.deepEqual(citations('[{"cite":"z","at":"abstract","items":[{"cite":"w"}]}]', true), [{ id: 'z', at: 'abstract' }, { id: 'w', at: undefined }]);
});

test('prose words skip frontmatter, imports, exports, expressions and tags', () => {
  const page = `---\ntitle: T\n---\n\nimport X from 'x';\nexport const a = (p) => { return p; };\n\n<LineChart series={[{ label: 'A' }]} unit="pct">\n  Two words\n</LineChart>\n\nThree more {a(1)} [words](/x/).`;
  assert.equal(proseWords(page), 5);
});

test('quotes of 15 or more words are flagged, shorter ones are not', () => {
  const long = '"' + Array(15).fill('word').join(' ') + '"';
  assert.equal(longQuotes(`He said "a fifteen-hour week" and ${long}.`).length, 1);
  assert.equal(longQuotes('He said "a fifteen-hour week".').length, 0);
});

test('verification statuses are parsed from the report table', () => {
  assert.deepEqual([...verified('| id | status | detail |\n|---|---|---|\n| a-1 | ok | HTTP 200 |\n| b | warn | HTTP 403 |\n')], [['a-1', 'ok'], ['b', 'warn']]);
});

import { frontmatter, markedKinds } from './rules.mjs';

test('frontmatter reads flat fields and lists', () => {
  const fm = frontmatter("---\ntitle: 'A: b'\nclaim: empirical\ncontains: [analytical, forecast]\nconcepts: []\n---\nbody");
  assert.deepEqual(fm, { title: 'A: b', claim: 'empirical', contains: ['analytical', 'forecast'], concepts: [] });
});

test('marked kinds come from badges and figures, never from illustrations', () => {
  const page = '<Tag kind="forecast" /> x <LineChart\n title="t"\n unit="pct"\n>c</LineChart> <Pyramid id="p" /> <NitDiagram /> <Tag kind="illustrative" />';
  assert.deepEqual([...markedKinds(page)].sort(), ['empirical', 'forecast', 'normative']);
});
