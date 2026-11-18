// Build-time cross-links (research/IA-v3.md §4), all computed from the collection so they cannot drift:
// who depends on a page, which pages use a concept, which pages cite a source.
import { getCollection } from 'astro:content';
import { ORDER, url } from './nav.mjs';
import { citations } from './rules.mjs';

let cache;
export async function site() {
  if (cache) return cache;
  const entries = await getCollection('docs');
  const byId = new Map(entries.map((e) => [e.id, e]));
  const dependents = new Map();
  const conceptUsers = new Map();
  const citedOn = new Map();
  for (const e of entries) {
    for (const d of e.data.dependsOn) dependents.set(d, [...(dependents.get(d) ?? []), e.id]);
    for (const c of e.data.concepts) conceptUsers.set(c, [...(conceptUsers.get(c) ?? []), e.id]);
    for (const { id } of citations(e.body ?? '')) {
      const list = citedOn.get(id) ?? [];
      if (!list.includes(e.id)) citedOn.set(id, [...list, e.id]);
    }
  }
  const sortByOrder = (ids) => [...ids].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  for (const m of [dependents, conceptUsers, citedOn]) for (const [k, v] of m) m.set(k, sortByOrder(v));
  const link = (id) => ({ id, href: url(id), title: byId.get(id)?.data.navLabel ?? byId.get(id)?.data.title ?? id, claim: byId.get(id)?.data.claim });
  cache = { entries, byId, dependents, conceptUsers, citedOn, link };
  return cache;
}
