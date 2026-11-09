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

export const fetched = (file) => manifest[file]?.fetched;
export const last = (points) => points.at(-1);
export const peak = (points) => points.reduce((m, p) => (p.v > m.v ? p : m));
