# post-labor-wiki
Visual, source-first wiki on post-labor economics and post-work society. Live: https://post-labor-wiki.technoir.cloud

## Commands
- Check (before every commit and deploy): `npm run check`
- Verify sources online (before publishing new pages): `npm run verify`
- Dev: not scaffolded yet (milestone 1: Astro + Starlight)
- Deploy: `./scripts/deploy.sh` (milestone 1)

## Non-negotiables
1. `research/sources.json` is the single source registry; pages cite `[@id]` and never hand-write a bibliography entry. Its audience includes David Shapiro, so it must hold up to an expert.
2. Every number needs a primary or peer-reviewed source with a locator. Shapiro's `/Research` PDFs are AI-generated: use them as leads, never as citations.
3. Label forecasts and "illustrative" charts as such; keep empirical, forecast and normative claims visibly apart.
4. Each framework page carries a steelmanned "What skeptics say" box.
5. Images: public domain, CC0, CC BY or ours, each with a credits entry. Shapiro's `docs/laborzero/` material is © all rights reserved: link it, never copy it.
6. Summaries are our own wording; quote under 15 words per source.
7. Visual first: each page leads with a chart, timeline, card or meme; ≤600 words of prose.
