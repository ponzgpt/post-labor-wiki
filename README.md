# Post-Labor Wiki

A visual, source-first wiki on post-labor economics, post-work society and the history and frameworks around them: timelines, charts and memes over walls of text, and a citation behind every claim.

Live: https://post-labor-wiki.technoir.cloud

## Status
Live sections: **Start here** (five minutes, why now, how we source), **The evidence** (labour share in the US and worldwide, productivity vs pay, participation, historical analogues, automation exposure), **Frameworks** (David Shapiro's Post-Labor Economics, economic agency, power after labour, and a comparison with six other frameworks), the **policy toolbox** (six instruments with evidence for and against), **measures to watch**, **open questions**, and reference pages (timeline, glossary, people, reading list, bibliography, credits). What is next is in [`research/PLAN-v2.md`](research/PLAN-v2.md).

| File | What it is |
|---|---|
| [`research/sources.json`](research/sources.json) | The source registry: one entry per work, with a DOI or URL. The wiki and bibliography are generated from it. |
| [`research/verification.md`](research/verification.md) | Last link and DOI check (`npm run verify`). |
| [`research/PLAN-v2.md`](research/PLAN-v2.md) | The v2 audit, structure, quality gates and what is left. |
| [`research/outline.md`](research/outline.md) | The original long-range map: 8 sections, about 40 pages. |
| [`research/shapiro-ple.md`](research/shapiro-ple.md) | David Shapiro's Post-Labor Economics terms, mapped to where he defines them. |
| [`research/assets.md`](research/assets.md) | Images, charts and memes we can use, with licences. |

## Commands
- `npm run dev`: local site.
- `npm run data`: re-downloads the chart data (FRED, ILOSTAT, OECD, Our World in Data, Alaska Department of Revenue) into `public/data/`, with snapshot dates in `src/data/manifest.json`. `npm run data -- pfd` refreshes only matching files.
- `npm run check`: enforces the sourcing rules (registry, locators, verified links, word limits, skeptics boxes, snapshot-only charts, short quotes), runs the unit tests and builds the site. CI and the deploy run it.
- `./scripts/deploy.sh`: builds the committed HEAD on the VPS and rolls it out behind Traefik.
- `npm run verify`: checks every DOI on Crossref and every URL over HTTP, then rewrites `research/verification.md`.

## Sourcing rules
1. Every number on the site traces to primary data or a peer-reviewed paper, with a page or table locator.
2. Empirical claims, forecasts and normative proposals are labelled differently.
3. Each framework page has a "What skeptics say" box.
4. AI-generated research reports (including those in Shapiro's repo) are leads, never citations.

## How this was made

I'm a vibe coder. I decide what to build, write the spec and the rules it has to follow, and test the result until it
does what I said. AI coding agents write the code; I don't write code by hand. Commits under my name were made by an
agent working for me.

## Licence
Code: MIT. Writing and original graphics: CC BY 4.0. Third-party images keep their own licences, listed in the site credits.
