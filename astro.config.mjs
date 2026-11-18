import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import redirects from './src/data/redirects.json' with { type: 'json' };

// Moved pages answer with a 301 in nginx.conf; these static fallbacks cover any other host (and local previews).
export default defineConfig({
  site: 'https://post-labor-wiki.technoir.cloud',
  trailingSlash: 'always',
  integrations: [mdx()],
  redirects: Object.fromEntries(redirects.map((r) => [r.from.replace(/\/$/, ''), r.to])),
});
