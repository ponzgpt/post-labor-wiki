#!/usr/bin/env node
// Offline check: the source registry is well-formed and every [@id] citation resolves.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const KINDS = new Set(['classic', 'book', 'paper', 'working-paper', 'report', 'trial', 'data', 'commentary', 'fiction', 'shapiro']);
const errors = [];

const sources = JSON.parse(readFileSync(join(root, 'research/sources.json'), 'utf8'));
const ids = new Set();
for (const s of sources) {
  const at = `source ${s.id ?? '(no id)'}`;
  if (!/^[a-z0-9-]+$/.test(s.id ?? '')) errors.push(`${at}: id must be lowercase kebab`);
  if (ids.has(s.id)) errors.push(`${at}: duplicate id`);
  ids.add(s.id);
  if (!KINDS.has(s.kind)) errors.push(`${at}: unknown kind "${s.kind}"`);
  if (!Array.isArray(s.authors) || !s.authors.length) errors.push(`${at}: authors missing`);
  if (!Number.isInteger(s.year)) errors.push(`${at}: year must be an integer`);
  if (!s.title) errors.push(`${at}: title missing`);
  if (!s.doi && !s.url) errors.push(`${at}: needs a doi or url`);
  if (s.doi && !/^10\.\d{4,9}\/\S+$/.test(s.doi)) errors.push(`${at}: malformed doi`);
  if (s.url && !s.url.startsWith('https://')) errors.push(`${at}: url must be https`);
  if (!Array.isArray(s.topics) || !s.topics.length) errors.push(`${at}: topics missing`);
}

// ponytail: scans research/*.md only; extend to src/content once the site exists.
const dir = join(root, 'research');
for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  for (const [, id] of readFileSync(join(dir, f), 'utf8').matchAll(/\[@([a-z0-9-]+)\]/g)) {
    if (!ids.has(id)) errors.push(`${f}: cites unknown source [@${id}]`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`✓ ${sources.length} sources, all citations resolve`);
