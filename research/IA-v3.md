# Information architecture v3 (November 2026)

Supersedes the sidebar in `PLAN-v2.md` §2. Written before the v3 rebuild; the build follows it, and `npm run check` enforces the parts a machine can check.

## 1. Audit of the v2 taxonomy

v2 had twelve entry points: start-here, evidence, frameworks, policy, measures, open-questions, timeline, glossary, people, reading list, bibliography, credits.

| Problem | Where | Effect on a reader |
|---|---|---|
| **Order followed the author's research, not the reader's questions.** "Measures to watch" sat between policy and open questions; the timeline, the one page that answers "how did we get here", was filed under Reference. | Sidebar | A newcomer cannot tell which page answers "what is happening" versus "what should we do". |
| **Overlapping sections.** The evidence overview and the measures dashboard showed the same five series (labour share, productivity vs pay, participation, manufacturing, world labour share) as two sets of tiles with different framings. | `/evidence/`, `/measures/` | Two "front doors" to the same data; neither said which one is canonical. |
| **Claim types were a footnote.** Three labels (evidence, forecast, proposal) existed as inline pills, but pages did not declare a type, "proposal" mixed two different things (Shapiro's *model* of what is happening and his *value choices* about what to build), and the "Why it matters for post-labor" paragraphs on evidence pages carried no label at all. | All claim pages | A measured fact and an author's interpretation sat side by side, unmarked. |
| **No stated purpose per section.** Section index pages listed links but never said what the section is for or what it does not do. | Indexes | Readers could not tell that "Frameworks" describes ideas and "Policy" weighs instruments. |
| **Weak cross-linking.** Glossary terms linked out to pages but pages did not link back to terms; no page said what it builds on or what builds on it; people and sources did not show where they are used. | Glossary, people, bibliography | The wiki read as a stack of essays, not a web of connected claims. |
| **Unclear attribution boundary.** The home page credited Shapiro, but individual pages did not say whether they follow his framing or are independent syntheses. | All pages | An expert could not tell which pages speak for PLE and which judge it. |
| **Slug drift.** `/evidence/farms-and-factories/` was titled "Historical analogues"; `/start-here/how-we-source/` was the only place the claim labels were explained. | URLs | Links named one thing and showed another. |

## 2. Organising principle

**One reader question per section, asked in the order a newcomer asks them; every page answers one question and declares what kind of claim it makes.**

The five questions, in order, and what each section exists to do:

| # | Section (URL) | Reader question | This section exists to… | Primary claim type |
|---|---|---|---|---|
| 1 | Start here (`/start/`) | What is this, and why now? | …give a newcomer the whole argument in five minutes, the history of the idea, and the rules for reading every other page. | Mixed, every claim marked |
| 2 | The evidence (`/evidence/`) | What is actually happening? | …test the post-labor premise against measured data only: official series and peer-reviewed studies, with the strongest counter-reading on each page. It opens on the indicators dashboard. | Empirical |
| 3 | Frameworks (`/frameworks/`) | What are the ideas for what follows? | …describe, in their proponents' terms and with attribution, the models that explain what is happening and what it means. Description, not endorsement. | Analytical |
| 4 | Policy options (`/policy/`) | What could we do about it? | …weigh each instrument with the best evidence for and against it, keeping the value choice (what we *should* do) apart from what trials *measured*. | Normative |
| 5 | Open questions (`/open-questions/`) | What is still unknown? | …set out where serious people disagree, the best evidence on each side, and what observation would settle it. | Forecast |
| – | Reference (`/reference/`) | Where do I look something up? | …hold the shared vocabulary, people, sources and credits that every other page links into. | Reference (no claims of its own) |

Why this order: it is the order of a careful argument (definition → facts → explanations → choices → uncertainty), so facts are met before interpretations and interpretations before prescriptions. A reader can stop after any section and still hold correctly labelled knowledge.

## 3. Epistemology as structure

Every content page declares a `claim` type in its frontmatter; the page header shows it as a badge, and `npm run check` fails a page that has none.

| Type | Means | Example on this wiki | Badge |
|---|---|---|---|
| **Empirical** | Measured: official data, a randomised trial, a peer-reviewed estimate of something that happened | Alaska's dividend did not reduce employment | Green, bar-chart icon, solid border |
| **Analytical** | A model, framework or interpretation, always attributed to its author | Shapiro's Great Decoupling; Acemoglu and Restrepo's displacement and reinstatement | Violet, network icon, solid border |
| **Forecast** | A claim about the future, however careful | AI adds at most 0.66% to TFP over ten years | Magenta, arrow icon, **dashed** border |
| **Normative** | A value choice: what someone argues we *should* do | Pay every citizen an automation dividend | Crimson, balance icon, double border |

Rules:

1. Colour is never the only signal: every badge carries its word and its icon; forecasts are also dashed, in badges and in chart lines.
2. A page has one primary type. If it contains claims of other types, it lists them in `contains`, and each such claim carries an inline badge. `npm run check` fails if a page uses an inline badge type it did not declare, or declares one it never marks.
3. `mixed` is allowed only on Start pages that summarise the whole field, and they must mark every claim inline.
4. Charts carry the same badge in their frame. Illustrations of a framework (the Decoupling, the pyramids, the NIT diagram) are marked "Illustrative" as well as with their type, so they are never read as data.
5. A short "How to read this" legend appears on the home page, in the footer of every page and in full at `/start/how-to-read/`.

## 4. Cross-linking

- **Concepts.** Each glossary entry has a stable id (`/reference/glossary/#labour-share`). Pages list the concepts they rely on in frontmatter (`concepts`); the glossary shows, under each term, the pages that use it; the `<Term>` component links a term in running text to its card and shows the definition on hover or focus.
- **Dependencies.** Pages list what they build on (`dependsOn`). Each page ends with a "Connections" panel: *Builds on*, *Built on by* (computed in reverse) and *Key concepts*. `npm run check` fails on a dependency or concept that does not exist.
- **Sources and people.** The bibliography shows, under each source, the pages that cite it; the people directory shows where each person's work is cited. Both are computed from the `<Cite>` calls, so they cannot drift.

## 5. Attribution: what follows Shapiro and what is independent

Every page declares `framing`, shown in its header.

| Framing | Pages | What it means |
|---|---|---|
| **Follows Shapiro (attributed)** | Frameworks: Post-Labor Economics, Economic agency, Power after labour; the Decoupling and pyramid illustrations | Describes his framework in his structure and terms, cites his public writing, links (never copies) the *Labor Zero* companion, which is © all rights reserved. Each page still carries a steelmanned skeptics box. |
| **Independent** | The evidence, Policy options, Open questions, Frameworks compared, Reference | Our own synthesis of primary data and peer-reviewed work. Where PLE has a position it appears in a marked, attributed paragraph ("Where post-labor thinkers stand"); the evidence decides the page's verdict, including evidence against PLE. |
| **Mixed** | Start here | Introduces PLE as the organising frame (attributed) beside independent evidence; each claim is marked. |

The choice of five reader questions is ours, not Shapiro's. His own syllabus has six steps (automation, labour's decline, power, measurement, interventions, life after labour); the wiki maps to it but does not adopt it as structure, so that evidence comes before any framework, his included.

## 6. Page map (old → new)

| v2 URL | v3 URL | Change |
|---|---|---|
| `/` | `/` | Rebuilt landing: statement, question path, hero chart, legend, credit band |
| `/start-here/post-labor-in-five-minutes/` | `/start/five-minutes/` | Moved |
| `/start-here/why-now/` | `/start/why-now/` | Moved |
| `/timeline/` | `/start/timeline/` | Moved: it answers "how did we get here", a start question |
| `/start-here/how-we-source/` | `/start/how-to-read/` | Moved and renamed: now also the full claim-type legend |
| (none) | `/start/` | New section index |
| `/evidence/` + `/measures/` | `/evidence/` | **Merged**: the dashboard becomes the evidence front page; duplicate tiles removed |
| `/evidence/farms-and-factories/` | `/evidence/historical-analogues/` | Slug now matches title |
| other `/evidence/…`, `/frameworks/…`, `/policy/…`, `/open-questions/` | unchanged | Claim types, framing and connections added |
| `/glossary/`, `/people/`, `/reading-list/`, `/bibliography/`, `/credits/` | `/reference/…` | Moved under one Reference section with a new index |

## 7. Redirects

Every moved URL answers with a 301 in `nginx.conf` (generated from `src/data/redirects.json`, which also feeds Astro's static fallback pages). `npm run check` verifies that each entry below is in both files and that each target exists after the build.

redirects:
- `/start-here/post-labor-in-five-minutes/` → `/start/five-minutes/`
- `/start-here/why-now/` → `/start/why-now/`
- `/start-here/how-we-source/` → `/start/how-to-read/`
- `/start-here/` → `/start/`
- `/timeline/` → `/start/timeline/`
- `/measures/` → `/evidence/`
- `/evidence/farms-and-factories/` → `/evidence/historical-analogues/`
- `/glossary/` → `/reference/glossary/`
- `/people/` → `/reference/people/`
- `/reading-list/` → `/reference/reading-list/`
- `/bibliography/` → `/reference/bibliography/`
- `/credits/` → `/reference/credits/`

## 8. Front end: why plain Astro instead of Starlight

Starlight is a documentation theme: its sidebar, page frame, search UI and asides encode a docs product's information architecture, and restyling it fights its own CSS and component overrides. The v3 structure needs things Starlight does not model: a question-led section nav with stated purposes, a claim-type badge and framing chip in every page header, dependency panels, claim-type search filters and a bespoke landing page. A plain Astro layout gives that in a few small components with no theme to override, and fewer bytes shipped.

Kept: Astro, the MDX content collection (same files, same frontmatter title/description), every MDX component (`Cite`, `Skeptics`, charts, pyramids, cards), the data pipeline and Pagefind (now run directly after `astro build`, with a `type` and `section` filter on every page). Replaced: Starlight's layout, sidebar, `Aside`/`LinkCard`/`CardGrid` (small local equivalents) and its CSS.

## 9. Visual system (summary)

- Cool ink-blue neutrals; one accent (signal blue) for links and actions; one data accent (magenta) for the second series and highlights. No brown, ochre, mustard or beige: `npm run check` computes the hue of every colour token and fails on the 15–70° range unless the colour is near-grey.
- Tokens for everything in `src/styles/tokens.css`, three-state theme contract (light default; dark under `prefers-color-scheme` guarded by `:root:not([data-theme="light"])`; `:root[data-theme="dark"]`). Text pairs ≥ 4.5:1, checked by script.
- Chart palette validated for colour-vision deficiency (light `#1d64d8 #d9367a #14873a` on white; dark `#3987e5 #d55181 #0ca30c` on `#0f1828`); identity is never colour-alone (legend, direct end labels, table).
- Type: Source Serif 4 (headings, ledes, figures) and Public Sans (text and interface), self-hosted from `@fontsource-variable`; measure about 68ch.
