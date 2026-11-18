// The information architecture (research/IA-v3.md §2): five reader questions in order, then Reference.
// Single source for the section nav, breadcrumbs, previous/next, section indexes and npm run check.
export const SECTIONS = [
  {
    id: 'start', n: 1, label: 'Start here', question: 'What is this, and why now?',
    purpose: 'The whole argument in five minutes, the history of the idea, and the rules for reading every other page.',
    pages: ['start', 'start/five-minutes', 'start/why-now', 'start/timeline', 'start/how-to-read'],
  },
  {
    id: 'evidence', n: 2, label: 'The evidence', question: 'What is actually happening?',
    purpose: 'The post-labor premise tested against measured data only, each page ending with the strongest counter-reading.',
    pages: ['evidence', 'evidence/labour-share', 'evidence/productivity-and-pay', 'evidence/participation', 'evidence/automation-and-jobs', 'evidence/historical-analogues'],
  },
  {
    id: 'frameworks', n: 3, label: 'Frameworks', question: 'What are the ideas for what follows?',
    purpose: "The models that explain what is happening, described in their proponents' terms and attributed. Description, not endorsement.",
    pages: ['frameworks', 'frameworks/post-labor-economics', 'frameworks/economic-agency', 'frameworks/power'],
  },
  {
    id: 'policy', n: 4, label: 'Policy options', question: 'What could we do about it?',
    purpose: 'Each instrument with the best evidence for and against it; what we should do kept apart from what trials measured.',
    pages: ['policy', 'policy/basic-income', 'policy/negative-income-tax', 'policy/citizen-dividends', 'policy/ownership', 'policy/basic-services', 'policy/job-guarantee'],
  },
  {
    id: 'open-questions', n: 5, label: 'Open questions', question: 'What is still unknown?',
    purpose: 'Where serious people disagree, the best evidence on each side, and what would settle it.',
    pages: ['open-questions'],
  },
  {
    id: 'reference', n: null, label: 'Reference', question: 'Where do I look something up?',
    purpose: 'The shared vocabulary, people, sources and credits that every other page links into.',
    pages: ['reference', 'reference/glossary', 'reference/people', 'reference/reading-list', 'reference/bibliography', 'reference/credits'],
  },
];

export const ORDER = SECTIONS.flatMap((s) => s.pages);
export const url = (id) => (id ? `/${id}/` : '/');
export const sectionOf = (id) => SECTIONS.find((s) => s.pages.includes(id));
export function neighbours(id) {
  const i = ORDER.indexOf(id);
  return { prev: i > 0 ? ORDER[i - 1] : undefined, next: i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : undefined };
}
