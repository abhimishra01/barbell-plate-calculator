# Barbell plate calculator

Free browser tool for platecalculatoronline.com. Enter a target weight and see which plates to load on each side of the barbell. Works in lb and kg, with bar presets (45 lb, 35 lb, 20 kg, 15 kg, custom), plate toggles, an optional collar weight, a drawn bar, the closest load when the exact one is impossible, and a warm-up table (empty bar, 40, 60, 80 percent, work set). Settings are saved in the browser. There is no backend.

Built with Astro (static) and Tailwind 4.

## Where things live

- `src/lib/plates.js`: all plate math (pure functions, no DOM). Fewest-plates solver, closest load, warm-ups, unit conversion, number parsing.
- `tests/plates.test.mjs`: tests for that logic, including a brute-force check of the solver.
- `src/components/Tool.astro`: the calculator UI and the bar drawing.
- `src/components/Article.astro`, `src/data/faq.ts`: page text and FAQ (the FAQ also becomes FAQPage JSON-LD).
- `src/site.config.ts`: name, domain, email, brand color, analytics and ads IDs (empty = off).
- `src/lib/url.ts`: link helper that works at the site root and under a sub-path.

## Commands

- `npm run dev`: work on the site.
- `npm test`: run the logic tests.
- `npm run build`: build `dist/`.
- `npm run deploy`: test, build, then upload to Cloudflare Pages (you must run `npx wrangler login` once first).

## GitHub Pages

The workflow `.github/workflows/pages.yml` builds on every push to `main` and publishes to https://abhimishra01.github.io/barbell-plate-calculator/. It sets `PAGES_BASE` and `PAGES_SITE`. Locally: `PAGES_BASE=/barbell-plate-calculator/ npx astro build --outDir dist-pages`. Canonical links always point to the real domain.

## Notes

- Plate counts are not limited: the solver assumes you have as many plates of each size as you need.
- `public/_headers` keeps the `*.pages.dev` address out of Google (Cloudflare Pages only).
