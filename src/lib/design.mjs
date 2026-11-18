// Token pairs that must stay readable, checked in both themes by npm run check (WCAG AA: 4.5:1 for text, 3:1 for marks).
export const TEXT_PAIRS = [
  ['--ink', '--bg'], ['--ink', '--surface'], ['--ink', '--surface-2'], ['--ink', '--surface-3'],
  ['--ink-2', '--bg'], ['--ink-2', '--surface'], ['--ink-2', '--surface-2'],
  ['--ink-3', '--bg'], ['--ink-3', '--surface'], ['--ink-3', '--surface-2'],
  ['--accent', '--bg'], ['--accent', '--surface'], ['--accent', '--surface-2'], ['--accent', '--accent-soft'],
  ['--accent-hover', '--surface'], ['--accent-ink', '--accent'], ['--ink', '--mark'],
  ['--axis', '--surface'], ['--axis', '--bg'],
  ...['empirical', 'analytical', 'forecast', 'normative'].flatMap((k) => [[`--${k}`, `--${k}-soft`], [`--${k}`, '--surface'], [`--${k}`, '--bg']]),
];
export const MARK_PAIRS = [['--s1', '--surface'], ['--s2', '--surface'], ['--s3', '--surface'], ['--s1', '--bg'], ['--s2', '--bg'], ['--s3', '--bg'], ['--line-strong', '--surface'], ['--data-2', '--surface']];
