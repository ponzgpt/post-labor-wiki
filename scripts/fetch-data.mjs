#!/usr/bin/env node
// Snapshot the chart data into public/data/ (served for download, read at build) and record when.
// Builds never hit the network: rerun this, review the diff, commit, deploy.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'public/data');
mkdirSync(out, { recursive: true });

// file → [registry id, url, optional row filter]. FRED rejects browser user agents, so we send none.
const FRED = (code) => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${code}`;
const OWID = (slug) => `https://ourworldindata.org/grapher/${slug}.csv?v=1&csvType=full&useColumnShortNames=true`;
const ag = new Set(['United Kingdom', 'France', 'United States', 'World']);
const DATASETS = {
  'A4002E1A156NBEA.csv': ['bea-compshare', FRED('A4002E1A156NBEA')],
  'W270RE1A156NBEA.csv': ['bea-wageshare', FRED('W270RE1A156NBEA')],
  'PRS85006173.csv': ['fred-laborshare', FRED('PRS85006173')],
  'OPHNFB.csv': ['fred-productivity', FRED('OPHNFB')],
  'COMPRNFB.csv': ['fred-realcomp', FRED('COMPRNFB')],
  'LNS11300060.csv': ['fred-primeage-lfpr', FRED('LNS11300060')],
  'LRAC25MAUSM156S.csv': ['oecd-lfpr-men', FRED('LRAC25MAUSM156S')],
  'LRAC25FEUSM156S.csv': ['oecd-lfpr-women', FRED('LRAC25FEUSM156S')],
  'MANEMP.csv': ['fred-manemp', FRED('MANEMP')],
  'OUTMS.csv': ['fred-outms', FRED('OUTMS')],
  'agriculture-employment-share.csv': ['owid-agriculture', OWID('share-of-the-labor-force-employed-in-agriculture'), (row) => ag.has(row.split(',')[0])],
};

const manifest = {};
for (const [file, [source, url, keep]] of Object.entries(DATASETS)) {
  const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
  const text = await r.text();
  if (!r.ok || !/^[\w ]+,/.test(text)) throw new Error(`${file}: HTTP ${r.status}, not CSV`);
  const [head, ...rows] = text.trim().split('\n');
  writeFileSync(join(out, file), [head, ...(keep ? rows.filter(keep) : rows)].join('\n') + '\n');
  manifest[file] = { source, url, fetched: new Date().toISOString().slice(0, 10) };
  console.log(`✓ ${file} (${rows.length} rows)`);
}
writeFileSync(join(root, 'src/data/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
