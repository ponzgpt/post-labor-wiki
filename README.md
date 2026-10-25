# Post-Labor Wiki

A visual, source-first wiki on post-labor economics, post-work society and the history and frameworks around them: timelines, charts and memes over walls of text, and a citation behind every claim.

Live (from milestone 1): https://post-labor-wiki.technoir.cloud

## Status
Research phase. The site is not built yet; this repo holds the research it will be built from.

| File | What it is |
|---|---|
| [`research/sources.json`](research/sources.json) | The source registry: one entry per work, with a DOI or URL. The wiki and bibliography are generated from it. |
| [`research/verification.md`](research/verification.md) | Last link and DOI check (`npm run verify`). |
| [`research/outline.md`](research/outline.md) | Site map: 8 sections, about 40 pages, the sources behind each. |
| [`research/shapiro-ple.md`](research/shapiro-ple.md) | David Shapiro's Post-Labor Economics terms, mapped to where he defines them. |
| [`research/assets.md`](research/assets.md) | Images, charts and memes we can use, with licences. |

## Commands
- `npm run check`: validates the registry and that every `[@id]` citation resolves (offline; CI runs it).
- `npm run verify`: checks every DOI on Crossref and every URL over HTTP, then rewrites `research/verification.md`.

## Sourcing rules
1. Every number on the site traces to primary data or a peer-reviewed paper, with a page or table locator.
2. Empirical claims, forecasts and normative proposals are labelled differently.
3. Each framework page has a "What skeptics say" box.
4. AI-generated research reports (including those in Shapiro's repo) are leads, never citations.

## Licence
Code: MIT. Writing and original graphics: CC BY 4.0. Third-party images keep their own licences, listed in the site credits.
