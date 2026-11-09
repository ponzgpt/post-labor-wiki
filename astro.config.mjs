import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://post-labor-wiki.technoir.cloud',
  integrations: [
    starlight({
      title: 'Post-Labor Wiki',
      description: 'A visual, source-first wiki on post-labor economics, post-work society and the history behind them.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ponzgpt/post-labor-wiki' }],
      editLink: { baseUrl: 'https://github.com/ponzgpt/post-labor-wiki/edit/main/' },
      customCss: ['@fontsource-variable/fraunces', './src/styles/theme.css'],
      sidebar: [
        { label: 'Start here', items: [{ autogenerate: { directory: 'start-here' } }] },
        { label: 'Reference', items: ['bibliography', 'credits'] },
      ],
    }),
  ],
});
