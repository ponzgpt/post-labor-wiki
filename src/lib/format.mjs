// Number formats shared by the charts' build-time SVG and their browser tooltips.
const group = (v) => Math.round(v).toLocaleString('en-US');

/** A value as shown in end labels, tables and tooltips. */
export function fmt(unit, v) {
  if (unit === 'pct') return `${v.toFixed(1)}%`;
  if (unit === 'millions') return `${v.toFixed(1)}M`;
  if (unit === 'usd') return '$' + group(v);
  if (unit === 'hours') return group(v);
  return v.toFixed(0);
}

/** An axis tick: as short as the step allows. */
export function tick(unit, v) {
  const n = +v.toFixed(1);
  if (unit === 'pct') return `${n}%`;
  if (unit === 'millions') return `${n}M`;
  if (unit === 'usd') return '$' + group(v);
  if (unit === 'hours') return group(v);
  return String(n);
}
