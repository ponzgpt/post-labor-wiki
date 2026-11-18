#!/usr/bin/env node
// Offline check that keeps AGENTS.md's non-negotiables true. Runs before every build (npm run check).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { citations, proseWords, longQuotes, verified } from '../src/lib/rules.mjs';

const root = new URL('..', import.meta.url).pathname;
const KINDS = new Set(['classic', 'book', 'paper', 'working-paper', 'report', 'trial', 'data', 'commentary', 'fiction', 'shapiro']);
const errors = [];
const read = (p) => readFileSync(join(root, p), 'utf8');

// 1. The registry is well-formed.
const sources = JSON.parse(read('research/sources.json'));
const byId = new Map();
for (const s of sources) {
  const at = `source ${s.id ?? '(no id)'}`;
  if (!/^[a-z0-9-]+$/.test(s.id ?? '')) errors.push(`${at}: id must be lowercase kebab`);
  if (byId.has(s.id)) errors.push(`${at}: duplicate id`);
  byId.set(s.id, s);
  if (!KINDS.has(s.kind)) errors.push(`${at}: unknown kind "${s.kind}"`);
  if (!Array.isArray(s.authors) || !s.authors.length) errors.push(`${at}: authors missing`);
  if (!Number.isInteger(s.year)) errors.push(`${at}: year must be an integer`);
  if (!s.title) errors.push(`${at}: title missing`);
  if (!s.doi && !s.url) errors.push(`${at}: needs a doi or url`);
  if (s.doi && !/^10\.\d{4,9}\/\S+$/.test(s.doi)) errors.push(`${at}: malformed doi`);
  if (s.url && !s.url.startsWith('https://')) errors.push(`${at}: url must be https`);
  if (!Array.isArray(s.topics) || !s.topics.length) errors.push(`${at}: topics missing`);
  if (s.checked && !/^\d{4}-\d{2}-\d{2}$/.test(s.checked)) errors.push(`${at}: "checked" must be a YYYY-MM-DD date`);
}

// 2. Research notes cite known sources.
for (const f of readdirSync(join(root, 'research')).filter((f) => f.endsWith('.md'))) {
  for (const [, id] of read(`research/${f}`).matchAll(/\[@([a-z0-9-]+)\]/g)) {
    if (!byId.has(id)) errors.push(`research/${f}: cites unknown source [@${id}]`);
  }
}

// 3. Every citation on the site resolves, carries a locator and points at a verified source.
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const pages = walk(join(root, 'src/content/docs')).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const dataFiles = walk(join(root, 'src/data')).filter((f) => f.endsWith('.json') && !f.endsWith('manifest.json'));
const status = verified(read('research/verification.md'));
const cited = new Set();
for (const file of [...pages, ...dataFiles]) {
  const rel = relative(root, file);
  for (const { id, at } of citations(readFileSync(file, 'utf8'), file.endsWith('.json'))) {
    const s = byId.get(id);
    if (!s) { errors.push(`${rel}: cites unknown source "${id}"`); continue; }
    cited.add(id);
    if (!at && s.kind !== 'data') errors.push(`${rel}: citation of "${id}" needs a locator (at="…")`);
  }
}
for (const id of cited) {
  const s = byId.get(id), st = status.get(id);
  if (!st) errors.push(`source ${id}: not in research/verification.md; run npm run verify`);
  else if (st !== 'ok' && !s.checked) errors.push(`source ${id}: verify says "${st}"; fix the link or check it by hand and add "checked": "YYYY-MM-DD"`);
}

// Directory links ship on the site too: each must have been checked and not failed.
const report = read('research/verification.md');
for (const p of JSON.parse(read('src/data/people.json'))) {
  for (const { url } of p.links) {
    const row = report.match(new RegExp(`^\\| <${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}> \\| (ok|warn|fail) \\|`, 'm'));
    if (!row) errors.push(`people.json: ${url} not checked; run npm run verify`);
    else if (row[1] === 'fail') errors.push(`people.json: ${url} failed verification`);
  }
}

// 4. Pages: ≤600 words of prose, skeptics boxes on framework and policy pages, no long quotes.
const REFERENCE = new Set(['bibliography', 'credits', 'glossary', 'people', 'reading-list', 'timeline']);
for (const file of pages) {
  const rel = relative(join(root, 'src/content/docs'), file);
  const slug = rel.replace(/\.mdx?$/, '');
  const text = readFileSync(file, 'utf8');
  const words = proseWords(text);
  if (!REFERENCE.has(slug) && words > 600) errors.push(`${rel}: ${words} words of prose (limit 600)`);
  if (/^(frameworks|policy)\/(?!index)/.test(slug) && !text.includes('<Skeptics')) errors.push(`${rel}: framework and policy pages need a <Skeptics> box`);
  for (const q of longQuotes(text)) errors.push(`${rel}: quotation of ${q.split(/\s+/).length} words (limit 14): "${q.slice(0, 60)}…"`);
}

// 5. Charts read committed snapshots only.
const manifest = JSON.parse(read('src/data/manifest.json'));
for (const [file, m] of Object.entries(manifest)) {
  if (!existsSync(join(root, 'public/data', file))) errors.push(`manifest: ${file} is missing from public/data`);
  if (!byId.has(m.source)) errors.push(`manifest: ${file} names unknown source "${m.source}"`);
}
for (const file of pages) {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  for (const [, list] of text.matchAll(/files=\{\[([^\]]*)\]\}/g)) {
    for (const [, f] of list.matchAll(/'([^']+)'/g)) if (!manifest[f]) errors.push(`${rel}: chart file ${f} is not in the data manifest`);
  }
  for (const [, f] of text.matchAll(/\bfile="([^"]+)"/g)) if (!manifest[f]) errors.push(`${rel}: chart file ${f} is not in the data manifest`);
  if (/\{\s*x:\s*-?\d/.test(text)) errors.push(`${rel}: hand-typed chart points; read them from a snapshot in public/data`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`✓ ${sources.length} sources (${cited.size} cited, all verified, all located), ${pages.length} pages within the rules, ${Object.keys(manifest).length} snapshots`);
