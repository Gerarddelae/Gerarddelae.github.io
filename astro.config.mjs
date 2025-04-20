import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { autoNewTabExternalLinks } from './src/autoNewTabExternalLinks';

import partytown from '@astrojs/partytown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
	site: 'https://Gerardelae.github.io',
	integrations: [mdx(), sitemap(), tailwind(), partytown()],
	markdown: {
		extendDefaultPlugins: true,
		rehypePlugins: [
			[
				autoNewTabExternalLinks,
				{
					domain: 'localhost:4321'
				}
			]
		],
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex]
	}
});
