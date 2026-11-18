// Reads the snapshots in public/data/ (see scripts/fetch-data.mjs) into {x, v} points for charts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import manifest from '../data/manifest.json' with { type: 'json' };

const dir = join(process.cwd(), 'public/data');
const rows = (file) => readFileSync(join(dir, file), 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));

/** Annual means over complete years only, so a partial year never looks like a trend.
 *  A monthly year may miss one month (BLS skipped October 2025 during the shutdown). */
export function annual(dated) {
  const by = new Map();
  for (const { date, v } of dated) {
    const y = +date.slice(0, 4);
    if (!by.has(y)) by.set(y, []);
    by.get(y).push(v);
  }
  const perYear = Math.max(...[...by.values()].map((a) => a.length));
  return [...by].filter(([, a]) => a.length >= Math.ceil(perYear * 0.9)).map(([x, a]) => ({ x, v: a.reduce((s, n) => s + n, 0) / a.length }));
}

/** A FRED series as annual points. FRED leaves missing values empty (older exports used "."). */
export const parseFred = (lines) => lines.filter(([, v]) => v && v !== '.').map(([date, v]) => ({ date, v: +v }));
export function fred(file) {
  return annual(parseFred(rows(file)));
}

/** One entity of an OWID grapher CSV (entity,code,year,value). */
export function owid(file, entity) {
  return rows(file).filter((r) => r[0] === entity).map((r) => ({ x: +r[2], v: +r[3] }));
}

/** Re-index a series so its value in year x0 is 100. */
export function rebase(points, x0) {
  const base = points.find((p) => p.x === x0);
  if (!base) throw new Error(`no value for ${x0}`);
  return points.filter((p) => p.x >= x0).map((p) => ({ x: p.x, v: (p.v / base.v) * 100 }));
}

/** A long-format area,year,value snapshot (ILOSTAT, OECD). `maxYear` drops projections. */
export function byArea(file, area, maxYear = Infinity) {
  return rows(file).filter((r) => r[0] === area && +r[1] <= maxYear).map((r) => ({ x: +r[1], v: +r[2] }));
}

/** ILO modelled estimates are published with projections for the edition year and the next;
 *  keep only years before the edition (`edition` comes from the ILO file name: Nov. 2025 → 2025). */
export const ILO_EDITION = 2025;
export const ilo = (area) => byArea('ilo-labour-income-share.csv', area, ILO_EDITION - 1);

/** Alaska Permanent Fund Dividend per person, nominal dollars, by dividend year. */
export const pfd = () => rows('alaska-pfd.csv').map((r) => ({ x: +r[0], v: +r[1] }));

/** Restate nominal points in dollars of year `base`, using annual CPI points. */
export function real(points, cpi, base) {
  const at = new Map(cpi.map((p) => [p.x, p.v]));
  if (!at.has(base)) throw new Error(`no CPI for ${base}`);
  return points.filter((p) => at.has(p.x)).map((p) => ({ x: p.x, v: (p.v * at.get(base)) / at.get(p.x) }));
}

/** Shares (in %) of each named part in their sum, for years where every part has a value. */
export function shares(parts) {
  const maps = Object.fromEntries(Object.entries(parts).map(([k, pts]) => [k, new Map(pts.map((p) => [p.x, p.v]))]));
  const keys = Object.keys(maps);
  const years = [...maps[keys[0]].keys()].filter((x) => keys.every((k) => maps[k].has(x))).sort((a, b) => a - b);
  const out = Object.fromEntries(keys.map((k) => [k, []]));
  for (const x of years) {
    const total = keys.reduce((s, k) => s + maps[k].get(x), 0);
    for (const k of keys) out[k].push({ x, v: (maps[k].get(x) / total) * 100 });
  }
  return out;
}

/** US household income by source, from BEA personal income (NIPA Table 2.1).
 *  Capital = receipts on assets (interest, dividends) + rental income; proprietors' income mixes labour and capital,
 *  so it is kept apart. These are national aggregates with imputed items, not Shapiro's household cash ledger. */
export function householdIncome() {
  const capital = sumByYear(fred('PIROA.csv'), fred('RENTIN.csv'));
  return shares({ wages: fred('W209RC1.csv'), transfers: fred('PCTR.csv'), capital, proprietors: fred('PROPINC.csv') });
}
export function sumByYear(...series) {
  const maps = series.map((s) => new Map(s.map((p) => [p.x, p.v])));
  return [...maps[0].keys()].filter((x) => maps.every((m) => m.has(x))).map((x) => ({ x, v: maps.reduce((s, m) => s + m.get(x), 0) }));
}

/** Change between the first and last points, in the series' own units. */
export const change = (points) => points.at(-1).v - points[0].v;

export const fetched = (file) => manifest[file]?.fetched;
export const last = (points) => points.at(-1);
export const peak = (points) => points.reduce((m, p) => (p.v > m.v ? p : m));
