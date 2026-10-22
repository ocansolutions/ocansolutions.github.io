import type { APIRoute } from 'astro';

// Built from `site` in astro.config.mjs, so the sitemap line follows the domain when it changes (phase 5).
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
