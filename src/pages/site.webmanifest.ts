import type { APIRoute } from 'astro';
import site from '../site.config.ts';
import { url } from '../lib/url.ts';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({
    name: site.name,
    short_name: 'Plate Calc',
    description: 'Which plates to load on each side of the barbell.',
    start_url: url(),
    scope: url(),
    display: 'standalone',
    background_color: '#f7f6f2',
    theme_color: site.brand,
    icons: [
      { src: url('icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: url('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }), { headers: { 'Content-Type': 'application/manifest+json' } });
