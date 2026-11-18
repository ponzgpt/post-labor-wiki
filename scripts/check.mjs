#!/usr/bin/env node
// Offline check that keeps AGENTS.md's non-negotiables true. Runs before every build (npm run check).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { citations, proseWords, longQuotes, verified, frontmatter, markedKinds } from '../src/lib/rules.mjs';
import { SECTIONS, ORDER } from '../src/lib/nav.mjs';
import { CLAIM_TYPES, PAGE_TYPES, FRAMINGS } from '../src/lib/claims.mjs';
import { contrast, earthy, themeBlocks } from '../src/lib/color.mjs';
import { TEXT_PAIRS, MARK_PAIRS } from '../src/lib/design.mjs';

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
const pageId = (file) => relative(join(root, 'src/content/docs'), file).replace(/\.mdx?$/, '').replace(/\/?index$/, '');
const isReference = (slug) => slug.startsWith('reference/') || slug === 'start/timeline';
for (const file of pages) {
  const rel = relative(join(root, 'src/content/docs'), file);
  const slug = pageId(file);
  const text = readFileSync(file, 'utf8');
  const words = proseWords(text);
  if (!isReference(slug) && words > 600) errors.push(`${rel}: ${words} words of prose (limit 600)`);
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

// 6. Every page declares its claim type and framing, and marks exactly the other types it contains (research/IA-v3.md §3).
const glossary = JSON.parse(read('src/data/glossary.json'));
const termIds = new Set(glossary.map((t) => t.id));
const ids = new Set(pages.map(pageId));
for (const file of pages) {
  const rel = relative(root, file), id = pageId(file);
  const text = readFileSync(file, 'utf8');
  const fm = frontmatter(text);
  if (!PAGE_TYPES.includes(fm.claim)) { errors.push(`${rel}: frontmatter needs claim: ${PAGE_TYPES.join(' | ')}`); continue; }
  if (!FRAMINGS.includes(fm.framing)) errors.push(`${rel}: frontmatter needs framing: ${FRAMINGS.join(' | ')}`);
  const contains = fm.contains ?? [];
  for (const k of contains) if (!CLAIM_TYPES.includes(k)) errors.push(`${rel}: contains unknown claim type "${k}"`);
  if (fm.claim === 'mixed' && contains.length < 2) errors.push(`${rel}: a mixed page must list the types it contains`);
  if (fm.claim !== 'reference') {
    const used = markedKinds(text);
    for (const k of used) if (k !== fm.claim && !contains.includes(k)) errors.push(`${rel}: marks a ${k} claim but does not declare it (contains: […])`);
    for (const k of contains) if (!used.has(k)) errors.push(`${rel}: declares ${k} claims but marks none inline`);
  }
  for (const c of fm.concepts ?? []) if (!termIds.has(c)) errors.push(`${rel}: concept "${c}" is not in glossary.json`);
  for (const d of fm.dependsOn ?? []) if (!ids.has(d)) errors.push(`${rel}: dependsOn "${d}" is not a page`);
  for (const [, t] of text.matchAll(/<Term id="([^"]+)"/g)) if (!termIds.has(t)) errors.push(`${rel}: <Term id="${t}"> is not in glossary.json`);
  if (!ORDER.includes(id)) errors.push(`${rel}: not in the section map (src/lib/nav.mjs)`);
}
for (const id of ORDER) if (!ids.has(id)) errors.push(`nav.mjs: "${id}" has no page`);
if (new Set(ORDER).size !== ORDER.length) errors.push('nav.mjs: a page is listed twice');
for (const s of SECTIONS) if (s.pages[0] !== s.id) errors.push(`nav.mjs: section ${s.id} must start with its index page`);
if (new Set(glossary.map((t) => t.id)).size !== glossary.length) errors.push('glossary.json: duplicate term id');

// 7. Redirects: every moved URL is in redirects.json, nginx.conf and research/IA-v3.md, and never shadows a live page.
const redirects = JSON.parse(read('src/data/redirects.json'));
const nginx = read('nginx.conf'), ia = read('research/IA-v3.md');
for (const { from, to } of redirects) {
  if (!nginx.includes(`"${from}" "${to}"`) && !nginx.includes(`${from} ${to};`)) errors.push(`nginx.conf: missing 301 ${from} → ${to}`);
  if (!ia.includes(`\`${from}\` → \`${to}\``)) errors.push(`research/IA-v3.md: redirects list is missing ${from} → ${to}`);
  if (ids.has(from.replace(/^\/|\/$/g, ''))) errors.push(`redirect ${from} shadows a live page`);
  if (!ids.has(to.replace(/^\/|\/$/g, ''))) errors.push(`redirect ${from} → ${to}: target is not a page`);
}

// 8. Design: readable token pairs in both themes, identical dark scopes, no brown/ochre/beige, brand files present.
const themes = themeBlocks(read('src/styles/tokens.css'));
if (JSON.stringify(themes.dark) !== JSON.stringify(themes.darkMedia)) errors.push('tokens.css: the two dark scopes differ');
for (const [name, t] of Object.entries(themes)) {
  if (!Object.keys(t).length) errors.push(`tokens.css: ${name} block not found`);
  for (const [fg, bg] of TEXT_PAIRS) {
    if (!t[fg] || !t[bg]) { errors.push(`tokens.css (${name}): ${fg} or ${bg} missing`); continue; }
    const c = contrast(t[fg], t[bg]);
    if (c < 4.5) errors.push(`tokens.css (${name}): ${fg} on ${bg} is ${c.toFixed(2)}:1, needs 4.5:1`);
  }
  for (const [fg, bg] of MARK_PAIRS) {
    const c = contrast(t[fg], t[bg]);
    if (c < 3) errors.push(`tokens.css (${name}): ${fg} on ${bg} is ${c.toFixed(2)}:1, needs 3:1`);
  }
  for (const [k, v] of Object.entries(t)) if (earthy(v)) errors.push(`tokens.css (${name}): ${k} ${v} is in the brown/ochre range`);
}
for (const f of ['favicon.svg', 'icon-32.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og.jpg']) {
  if (!existsSync(join(root, 'public', f))) errors.push(`public/${f} is missing; run npm run brand`);
}
const fav = read('public/favicon.svg');
if (!/prefers-color-scheme:\s*dark/.test(fav)) errors.push('public/favicon.svg needs a dark variant (prefers-color-scheme)');
for (const [, hex] of fav.matchAll(/(#[0-9a-fA-F]{6})/g)) if (earthy(hex)) errors.push(`public/favicon.svg: ${hex} is in the brown/ochre range`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`✓ ${sources.length} sources (${cited.size} cited, all verified, all located), ${pages.length} pages within the rules and typed, ${redirects.length} redirects, ${TEXT_PAIRS.length * 3} contrast pairs, ${Object.keys(manifest).length} snapshots`);
