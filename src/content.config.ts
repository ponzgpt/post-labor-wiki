import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CLAIM_TYPES, PAGE_TYPES, FRAMINGS } from './lib/claims.mjs';

// One entry per wiki page. Section and order live in src/lib/nav.mjs (the IA's single source); see research/IA-v3.md.
export const collections = {
  docs: defineCollection({
    loader: glob({
      pattern: '**/*.mdx',
      base: './src/content/docs',
      generateId: ({ entry }) => entry.replace(/\.mdx$/, '').replace(/\/?index$/, ''),
    }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      navLabel: z.string().optional(),
      claim: z.enum(PAGE_TYPES),
      contains: z.array(z.enum(CLAIM_TYPES)).default([]),
      framing: z.enum(FRAMINGS),
      concepts: z.array(z.string()).default([]),
      dependsOn: z.array(z.string()).default([]),
      toc: z.boolean().default(true),
    }),
  }),
};
