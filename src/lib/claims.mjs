// The four claim types (research/IA-v3.md §3), shared by badges, the legend, search filters and npm run check.
export const CLAIM_TYPES = ['empirical', 'analytical', 'forecast', 'normative'];
/** A page's primary type: one of the four, `mixed` (Start pages; every claim marked inline) or `reference` (no claims of its own). */
export const PAGE_TYPES = [...CLAIM_TYPES, 'mixed', 'reference'];
export const FRAMINGS = ['shapiro', 'independent', 'mixed'];

export const CLAIM = {
  empirical: { label: 'Empirical', short: 'Measured', meaning: 'Measured: official data, a randomised trial or a peer-reviewed estimate of something that happened.' },
  analytical: { label: 'Analytical', short: 'Model', meaning: 'A model, framework or interpretation, attributed to its author.' },
  forecast: { label: 'Forecast', short: 'Future', meaning: 'A claim about the future, however careful. Shown dashed.' },
  normative: { label: 'Normative', short: 'Value choice', meaning: 'A value choice: what someone argues we should do.' },
  mixed: { label: 'Mixed', short: 'Mixed', meaning: 'Summarises several claim types; each claim is marked where it appears.' },
  reference: { label: 'Reference', short: 'Reference', meaning: 'Lists, definitions and sources; makes no claims of its own.' },
};

export const FRAMING = {
  shapiro: { label: "Follows Shapiro's framing", meaning: "Describes David Shapiro's Post-Labor Economics in his terms, with attribution. Description, not endorsement." },
  independent: { label: 'Independent synthesis', meaning: 'Our own reading of primary data and peer-reviewed work; positions of Post-Labor Economics are marked and attributed.' },
  mixed: { label: 'PLE framing + independent evidence', meaning: "Uses Shapiro's framing as the organising question, beside independent evidence; each claim is marked." },
};
