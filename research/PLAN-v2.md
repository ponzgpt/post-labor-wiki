# Plan v2: rework and amplification (November 2026)

Goal: the best visual, rigorous, source-first introduction to post-labor economics on the web; faithful to David Shapiro where it describes his framework (attributed, linked, never copied), independent and evidence-led everywhere else. Supersedes the page list in `outline.md` (kept as the long-range map).

## 1. Audit of v1 (8 content pages)

| Page | Claims | Sources | Problems found | Fix |
|---|---|---|---|---|
| Home | Splash, "coming next" cards | none | No start path; Shapiro not credited as originator; no independence statement | Rebuilt: start path, credit band, live figures |
| Post-labor in five minutes | Idea, data, PLE answer, trials, doubts | Good, mostly abstracts | Pyramid tier names did not match *Labor Zero* plate 3; several cites without locators; Keynes/Leontief unlocated | Pyramid moved to economic agency with plate-3 names; every cite located |
| How we source | Tiers and labels | n/a | Did not describe the automated rules | Added "Checked by machine" |
| Evidence overview | Four tiles | FRED | US only | ILO world tile; new cards |
| Labour share | BLS, BEA charts; K&N | Good | US only; skeptics box missed the strongest counter-papers | ILO chart by income group; Gutiérrez & Piton, Autor et al. superstar firms |
| Productivity vs pay | Chart, three measurement issues | Good | Cited *Labor Zero* for a claim it does not locate; EPI uncited locator | Shapiro Six Steps part IV; EPI figure A |
| Participation | Chart | Good | Skeptics cite unlocated | Located |
| Farms and factories | Agriculture, manufacturing | Good | Thin as "historical analogues" | Rebuilt: Engels' pause, telephone operators, long-run hours |
| Automation and jobs | Studies table | Good | No AI-exposure literature beyond Eloundou; no 2025–26 evidence | Rebuilt: ILO index, Felten et al., Bick et al., Humlum & Vestergaard, Canaries, Autor et al. new work |
| Decoupling infographic | Plates 1–2 concept | — | Right panel reused pyramid tiers, not the plate's stock/flow idea | Redrawn: wage loop vs ownership stock/flow, illustrative 60/20/20 → 20/80 mix |

## 2. Information architecture (Starlight sidebar groups)

Start here (five minutes → why now → how we source) · The evidence (overview, labour share, productivity vs pay, who works, historical analogues, automation exposure) · Frameworks (compare, Post-Labor Economics, economic agency, power after labour) · Policy toolbox (compare, UBI and pilots, negative income tax, citizen dividends, ownership and data dividends, basic services, job guarantee) · Measures to watch · Open questions · Reference (timeline, glossary, people and organisations, reading list, bibliography, credits).

## 3. Content added

- Shapiro framework pages built from his public writing: Six Easy Steps (Jul 2025), Labor/Zero launch (Dec 2025), Democracy (Jan 2026), Technofeudalism (Jan 2026), Seven Frameworks (Mar 2026), the 10-minute video (Sep 2026) and the *Labor Zero* companion (plate names, CAR/PWR definitions; linked, paraphrased, never reproduced).
- Six policy pages, each with the strongest evidence for and against and a skeptics box.
- Dashboard of ten indicators; open-questions page; timeline (25 milestones, five eras ending "Now"); glossary (31 terms); directory (18 entries); reading list (20 works in four steps).

## 4. Data and visuals

New snapshots via `npm run data`: ILOSTAT labour income share (World, high and low income), OECD hours worked, OWID long-run hours, BEA personal income components, BLS prime-age employment rate and CPI, Alaska PFD payments table. New components: Timeline, Sparkline tiles, policy cards, generalised Pyramid (both pyramids), NIT diagram (illustrative, labelled), redrawn Decoupling. All SVGs carry title/desc; charts keep data tables and CSV downloads.

## 5. Quality gates added to `npm run check`

Every `<Cite>` (pages and data JSON) resolves and has a locator (data series excepted); every cited source is `ok` in `verification.md` or carries a dated `checked` field after a manual check; directory links verified; ≤600 words of prose per non-reference page; `<Skeptics>` on every framework and policy page; chart files exist in the manifest; no hand-typed chart points; no quotation of 15+ words. Rules live in `src/lib/rules.mjs` with unit tests.

## 6. Left for later

- Meaning after work section (Arendt, Graeber, Danaher; Shapiro's "life after labor" and meaning economy) and a fiction shelf.
- A full history-of-work section expanding the timeline cards into pages (Luddites, Keynes, Triple Revolution).
- Country pages for wealth funds beyond Alaska and Norway (Singapore's CPF and Temasek, which Shapiro cites).
- A household-level CAR estimate from microdata (Survey of Consumer Finances or CPS ASEC) instead of the national-accounts proxy.
- SEED (Stockton) and Cook County results, once primary evaluations with locators are confirmed.
- Robot installation data (IFR licence terms need checking before redistribution).
- A "prediction scorecard" meme page.
