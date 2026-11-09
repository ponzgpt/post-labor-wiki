// The one place that turns research/sources.json into citations; pages and the bibliography both use it.
import sources from '../../research/sources.json' with { type: 'json' };

export const byId = new Map(sources.map((s) => [s.id, s]));

const SUFFIX = /^(Jr\.?|Sr\.?|II|III)$/;
const surname = (name) => name.split(' ').filter((w) => !SUFFIX.test(w)).at(-1);

export function year(s) {
  return s.year < 0 ? `c. ${-s.year} BCE` : String(s.year);
}

/** "Keynes 1930", "Autor & Dorn 2013", "Egger et al. 2022", or the source's `short` name. */
function baseCite(s) {
  const a = s.authors;
  const who = s.short ?? (a.length > 2 ? `${surname(a[0])} et al.` : a.map(surname).join(' & '));
  return s.kind === 'data' ? who : `${who} ${year(s)}`; // data series are cited by name; their snapshot date is on the chart
}

/** Author-year cite, with a/b/c suffixes (in registry order) when two sources would read the same. */
export function shortCite(s, all = sources) {
  const twins = all.filter((x) => baseCite(x) === baseCite(s));
  const i = twins.findIndex((x) => x.id === s.id);
  return twins.length > 1 && i >= 0 ? `${baseCite(s)}${'abcdefghij'[i]}` : baseCite(s);
}

export function href(s) {
  return s.doi ? `https://doi.org/${s.doi}` : s.url;
}

export { sources };
