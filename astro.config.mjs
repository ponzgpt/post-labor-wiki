import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://post-labor-wiki.technoir.cloud',
  integrations: [
    starlight({
      title: 'Post-Labor Wiki',
      description: 'A visual, source-first introduction to post-labor economics: the evidence, the frameworks, the policy toolbox and the open questions.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ponzgpt/post-labor-wiki' }],
      editLink: { baseUrl: 'https://github.com/ponzgpt/post-labor-wiki/edit/main/' },
      customCss: ['@fontsource-variable/fraunces', './src/styles/theme.css'],
      sidebar: [
        { label: 'Start here', items: [{ autogenerate: { directory: 'start-here' } }] },
        { label: 'The evidence', items: [{ autogenerate: { directory: 'evidence' } }] },
        { label: 'Frameworks', items: [{ autogenerate: { directory: 'frameworks' } }] },
        { label: 'Policy toolbox', items: [{ autogenerate: { directory: 'policy' } }] },
        { label: 'Measures to watch', link: '/measures/' },
        { label: 'Open questions', link: '/open-questions/' },
        { label: 'Reference', items: ['timeline', 'glossary', 'people', 'reading-list', 'bibliography', 'credits'] },
      ],
    }),
  ],
});
