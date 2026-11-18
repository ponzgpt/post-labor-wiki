// Pure helpers behind scripts/check.mjs, kept here so they have unit tests.

/** Every citation in a page (`<Cite id="…" at="…" />`) or a data file (objects with `cite` and `at`). */
export function citations(text, isJson = false) {
  if (isJson) {
    const out = [];
    const visit = (v) => {
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object') {
        if (typeof v.cite === 'string') out.push({ id: v.cite, at: v.at });
        Object.values(v).forEach(visit);
      }
    };
    visit(JSON.parse(text));
    return out;
  }
  return [...text.replace(/`[^`\n]*`/g, '').matchAll(/<Cite\b([^>]*?)\/?>/g)].map(([, attrs]) => ({
    id: attrs.match(/\bid="([^"]*)"/)?.[1],
    at: attrs.match(/\bat="([^"]*)"/)?.[1],
  }));
}

/** Remove balanced {…} expressions (JSX props, computed numbers). */
function stripBraces(s) {
  let out = '', depth = 0;
  for (const ch of s) {
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) out += ch;
  }
  return out;
}

/** The visible prose of an MDX page: no frontmatter, imports, exports, code, expressions, tags or link targets. */
export function prose(mdx) {
  let s = mdx.replace(/^---\n[\s\S]*?\n---\n/, '');
  s = s.replace(/^(import|export) .*$/gm, '');
  s = s.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  s = stripBraces(s);
  s = s.replace(/<[^>]*>/g, ' ');
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  return s;
}

export const proseWords = (mdx) => (prose(mdx).match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%$£€–-]*/gu) ?? []).length;

/** Quotations of 15 words or more in a page's prose. */
export function longQuotes(mdx) {
  const p = prose(mdx);
  const quoted = [...p.matchAll(/"([^"\n]+)"/g), ...p.matchAll(/“([^”]+)”/g)].map((m) => m[1].trim());
  return quoted.filter((q) => q.split(/\s+/).length >= 15);
}

/** id → status from the table npm run verify writes to research/verification.md. */
export function verified(md) {
  const map = new Map();
  for (const [, id, st] of md.matchAll(/^\| ([a-z0-9-]+) \| (ok|warn|fail) \|/gm)) map.set(id, st);
  return map;
}

/** Top-level `key: value` frontmatter fields; `[a, b]` lists become arrays. Enough for this wiki's flat frontmatter. */
export function frontmatter(mdx) {
  const block = mdx.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  const out = {};
  for (const [, k, v] of block.matchAll(/^([A-Za-z]\w*):[ \t]*(.*)$/gm)) {
    const val = v.trim();
    out[k] = /^\[.*\]$/.test(val) ? val.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean) : val.replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

/** Claim types a page marks inline: `<Tag kind>` badges plus the types its figures declare
 *  (line charts and dashboard tiles are measured data unless marked otherwise; the pyramids are value choices; the decoupling is Shapiro's model). */
export function markedKinds(mdx) {
  const kinds = new Set([...mdx.matchAll(/<Tag\b[^>]*\bkind="([a-z]+)"/g)].map((m) => m[1]));
  for (const [, attrs] of mdx.matchAll(/<LineChart\b([\s\S]*?)>/g)) kinds.add(attrs.match(/\bkind="([a-z]+)"/)?.[1] ?? 'empirical');
  if (/<Sparkline\b/.test(mdx)) kinds.add('empirical');
  for (const [, attrs] of mdx.matchAll(/<Pyramid\b([\s\S]*?)>/g)) kinds.add(attrs.match(/\bkind="([a-z]+)"/)?.[1] ?? 'normative');
  if (/<Decoupling\b/.test(mdx)) kinds.add('analytical');
  kinds.delete('illustrative');
  return kinds;
}
