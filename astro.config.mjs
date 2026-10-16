// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site is served from the root of ocansolutions.github.io, so there is no `base`.
// When the real domain goes live (phase 5), only `site` changes (e.g. 'https://www.ocansolutions.com').
export default defineConfig({
  site: 'https://ocansolutions.github.io',
  output: 'static',
  integrations: [sitemap()],
});
