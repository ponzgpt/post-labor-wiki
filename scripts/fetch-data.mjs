#!/usr/bin/env node
// Snapshot the chart data into public/data/ (served for download, read at build) and record when.
// Builds never hit the network: rerun this, review the diff, commit, deploy.
// Usage: npm run data            (every dataset)
//        npm run data -- pfd      (only files whose name contains "pfd")
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import manifest from '../src/data/manifest.json' with { type: 'json' };

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'public/data');
mkdirSync(out, { recursive: true });

// FRED rejects browser user agents and the OECD API errors without one, so we send a plain bot UA;
// the Alaska PFD site needs a browser one.
const UA = 'post-labor-wiki data snapshot (https://github.com/ponzgpt/post-labor-wiki)';
const FRED = (code) => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${code}`;
const OWID = (slug) => `https://ourworldindata.org/grapher/${slug}.csv?v=1&csvType=full&useColumnShortNames=true`;
const fred = (source, code) => ({ source, url: FRED(code) });

/** Keep only the header plus rows whose first column is one of `entities` (OWID grapher CSVs). */
const entities = (...names) => (text) => {
  const [head, ...rows] = text.trim().split('\n');
  const keep = new Set(names);
  return [head, ...rows.filter((r) => keep.has(r.split(',')[0]))].join('\n');
};

/** ILOSTAT bulk CSV → area,year,value for the given areas. */
const ilo = (...areas) => (text) => {
  const rows = text.replace(/^﻿/, '').trim().split('\n').slice(1).map((l) => l.replaceAll('"', '').split(','));
  const keep = rows.filter((r) => areas.includes(r[0])).map((r) => [r[0], r[3], r[4]]);
  keep.sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]);
  return ['ref_area,year,value', ...keep.map((r) => r.join(','))].join('\n');
};

/** OECD SDMX "csvfile" → area,year,value. (The API answers 500 to a fully specified key, so we filter here.) */
const oecd = (text) => {
  const [head, ...rows] = text.trim().split('\n').map((l) => l.split(','));
  const [a, t, v, w] = ['REF_AREA', 'TIME_PERIOD', 'OBS_VALUE', 'WORKER_STATUS'].map((k) => head.indexOf(k));
  // All workers (employees and self-employed), not employees only.
  const keep = rows.filter((r) => r[w] === '_T').map((r) => [r[a], r[t], r[v]]).sort((x, y) => x[0].localeCompare(y[0]) || x[1] - y[1]);
  return ['ref_area,year,value', ...keep.map((r) => r.join(','))].join('\n');
};

/** Alaska Department of Revenue's "Summary of Dividend Applications & Payments" HTML table → year,amount,paid. */
const pfdTable = (html) => {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
    .map(([, r]) => [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(([, c]) => c.replace(/<[^>]+>/g, '').trim()))
    .filter((c) => /^\d{4}$/.test(c[0]))
    .map((c) => [c[0], c[4].replace(/[$,]/g, ''), c[3].replace(/,/g, '')])
    .sort((x, y) => x[0] - y[0]);
  if (rows.length < 40) throw new Error(`PFD table: only ${rows.length} rows parsed`);
  return ['year,dividend_usd,applications_paid', ...rows.map((r) => r.join(','))].join('\n');
};

const DATASETS = {
  // US national accounts and labour statistics (BLS, BEA, OECD via FRED)
  'A4002E1A156NBEA.csv': fred('bea-compshare', 'A4002E1A156NBEA'),
  'W270RE1A156NBEA.csv': fred('bea-wageshare', 'W270RE1A156NBEA'),
  'PRS85006173.csv': fred('fred-laborshare', 'PRS85006173'),
  'OPHNFB.csv': fred('fred-productivity', 'OPHNFB'),
  'COMPRNFB.csv': fred('fred-realcomp', 'COMPRNFB'),
  'LNS11300060.csv': fred('fred-primeage-lfpr', 'LNS11300060'),
  'LNS12300060.csv': fred('fred-primeage-epop', 'LNS12300060'),
  'LRAC25MAUSM156S.csv': fred('oecd-lfpr-men', 'LRAC25MAUSM156S'),
  'LRAC25FEUSM156S.csv': fred('oecd-lfpr-women', 'LRAC25FEUSM156S'),
  'MANEMP.csv': fred('fred-manemp', 'MANEMP'),
  'OUTMS.csv': fred('fred-outms', 'OUTMS'),
  'W209RC1.csv': fred('bea-pi-components', 'W209RC1'),
  'PIROA.csv': fred('bea-pi-components', 'PIROA'),
  'RENTIN.csv': fred('bea-pi-components', 'RENTIN'),
  'PROPINC.csv': fred('bea-pi-components', 'PROPINC'),
  'PCTR.csv': fred('bea-pi-components', 'PCTR'),
  'CPIAUCSL.csv': fred('bls-cpi', 'CPIAUCSL'),
  // International
  'agriculture-employment-share.csv': {
    source: 'owid-agriculture',
    url: OWID('share-of-the-labor-force-employed-in-agriculture'),
    transform: entities('United Kingdom', 'France', 'United States', 'World'),
  },
  'working-hours-long-run.csv': {
    source: 'owid-hours',
    url: OWID('annual-working-hours-per-worker'),
    transform: entities('United Kingdom', 'United States', 'Germany'),
  },
  'ilo-labour-income-share.csv': {
    source: 'ilo-labour-share',
    url: 'https://rplumber.ilo.org/data/indicator/?id=LAP_2GDP_NOC_RT_A&ref_area=X01+X02+X05&format=.csv',
    transform: ilo('X01', 'X02', 'X05'),
  },
  'oecd-hours-worked.csv': {
    source: 'oecd-hours',
    url: 'https://sdmx.oecd.org/public/rest/data/OECD.ELS.SAE,DSD_HW@DF_AVG_ANN_HRS_WKD,1.0/OECD+USA+DEU+JPN............?startPeriod=1970&format=csvfile',
    transform: oecd,
  },
  'alaska-pfd.csv': {
    source: 'akdor-pfd',
    url: 'https://pfd.alaska.gov/Division-Info/summary-of-dividend-applications-payments',
    transform: pfdTable,
    browser: true,
  },
};

const only = process.argv[2];
const next = { ...manifest };
for (const [file, d] of Object.entries(DATASETS)) {
  if (only && !file.includes(only)) continue;
  const r = await fetch(d.url, { headers: { 'User-Agent': d.browser ? 'Mozilla/5.0' : UA }, signal: AbortSignal.timeout(90000) });
  const text = await r.text();
  if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
  const csv = (d.transform ? d.transform(text) : text).trim();
  if (!/^[\w ]+,/.test(csv) || csv.split('\n').length < 3) throw new Error(`${file}: not a usable CSV`);
  writeFileSync(join(out, file), csv + '\n');
  next[file] = { source: d.source, url: d.url, fetched: new Date().toISOString().slice(0, 10) };
  console.log(`✓ ${file} (${csv.split('\n').length - 1} rows)`);
}
for (const f of Object.keys(next)) if (!DATASETS[f]) delete next[f];
writeFileSync(join(root, 'src/data/manifest.json'), JSON.stringify(next, null, 2) + '\n');
