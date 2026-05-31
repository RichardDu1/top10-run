// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://top10.run',
  integrations: [
    sitemap({ lastmod: new Date('2026-06-01') }),
    mdx(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt', 'zh', 'zh-TW', 'de', 'fr', 'it'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
