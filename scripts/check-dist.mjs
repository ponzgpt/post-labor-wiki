#!/usr/bin/env node
// After the build: every internal link, image and anchor resolves; every moved URL redirects to a live page;
// every section index lists all its pages; the search index exists. Runs last in npm run check.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { SECTIONS, url } from '../src/lib/nav.mjs';

const dist = new URL('../dist', import.meta.url).pathname;
const redirects = JSON.parse(readFileSync(new URL('../src/data/redirects.json', import.meta.url), 'utf8'));
const errors = [];
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const html = walk(dist).filter((f) => f.endsWith('.html') && !f.includes('/pagefind/'));
const route = (file) => '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\.html$/, '');
const pages = new Map(html.map((f) => [route(f), readFileSync(f, 'utf8')]));
const ids = (doc) => new Set([...doc.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const idCache = new Map();
const idsOf = (r) => { if (!idCache.has(r)) idCache.set(r, ids(pages.get(r) ?? '')); return idCache.get(r); };
const isRedirect = (doc) => /<meta http-equiv="refresh"/i.test(doc);

function resolves(path) {
  if (pages.has(path)) return true;
  const file = join(dist, decodeURIComponent(path));
  return existsSync(file) && statSync(file).isFile();
}

let links = 0;
for (const [r, doc] of pages) {
  if (isRedirect(doc)) continue;
  for (const [, attr, raw] of doc.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:|\/\/)/.test(raw) || raw.startsWith('/pagefind/') || raw.includes('${')) continue;
    const [pathPart, hash] = raw.split('#');
    const path = pathPart === '' ? r : pathPart.startsWith('/') ? pathPart : new URL(pathPart, `https://x${r}`).pathname;
    links++;
    if (!resolves(path)) { errors.push(`${r}: broken ${attr} ${raw}`); continue; }
    if (hash && pages.has(path) && !idsOf(path).has(decodeURIComponent(hash))) errors.push(`${r}: missing anchor ${raw}`);
    if (pages.has(path) && isRedirect(pages.get(path))) errors.push(`${r}: links to moved URL ${raw}; link the new one`);
  }
}

for (const { from, to } of redirects) {
  const doc = pages.get(from);
  if (!doc || !isRedirect(doc) || !doc.includes(`url=${to}`)) errors.push(`redirect ${from}: no static fallback to ${to}`);
  if (!pages.has(to) || isRedirect(pages.get(to))) errors.push(`redirect ${from}: target ${to} is not a live page`);
}

for (const s of SECTIONS) {
  const doc = pages.get(url(s.id)) ?? '';
  const article = doc.split('<article class="page"')[1] ?? '';
  for (const p of s.pages.slice(1)) if (!article.includes(`href="${url(p)}"`)) errors.push(`section index ${url(s.id)} does not list ${url(p)}`);
}

if (!existsSync(join(dist, 'pagefind/pagefind.js'))) errors.push('dist/pagefind is missing: the build must run pagefind');
for (const f of ['favicon.svg', 'og.jpg', 'apple-touch-icon.png']) if (!existsSync(join(dist, f))) errors.push(`dist/${f} missing`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`✓ ${pages.size} built pages: ${links} internal links and anchors resolve, ${redirects.length} redirects land on live pages, ${SECTIONS.length} section indexes complete`);
