# Fix summary: barbell-plate-calculator (Okoye, 2026-10-20)

## Fixed
- Phone layout: Units, target and chips now come first, then the result and bar picture, then bar, plates and collars. Hero pill and the intro paragraph are hidden on phones. Tablet gets two columns from 768 px (was 1024). Result is sticky on desktop.
- Layout shift: result box, status, alt buttons and note have reserved heights; the target input no longer moves when the answer changes. Added a noscript note. (Default answer is still filled by JS, not pre-rendered.)
- Warm-ups: first row is the empty bar; 40/60/80 rounded to 5 lb or 2.5 kg before choosing plates; "(closest)" removed; one footnote when a set was rounded. 1.25 lb plate is off by default in lb mode.
- Collar default is 1 lb (lb) and 2.5 kg (kg), with a hint. "Count collars (clips)".
- Unit switch: round trip returns to the original number (anchor); empty target stays empty.
- Custom bar and collar fields: invalid text shows "Enter the bar weight" or "Enter the collar weight", blur puts the used value back, aria-invalid set. Target above 4999 is written back as 4999.
- Saved state is validated with Number.isFinite and ranges; storage key bumped to v2.
- Status text names the bar and lists the plates ("Load 45 x 2 on each side"). Removed the useless aria-hidden.
- Bar drawing: scales whole slots so plates never run past the sleeve or hide the collar (checked at 1000 lb with collars); viewBox shrinks to the loaded width so plates draw about 40 percent larger on phones.
- Copy: heaviest plates go against the bar shoulder (was "next to the collar"); one-tap button wording; "only the plate sizes you turn on"; "does not send what you type" instead of "sends nothing"; micro-plate FAQ; 2.5 lb step text; Privacy cookie wording.
- SEO and content: h3 to h2, BreadcrumbList and meta keywords removed, plate color tables, "how many plates fit", links back to the calculator, canonical skipped on the 404.
- Touch targets: chips, nav links and theme toggle are 44 px.
- Code: thousands-comma parsing, dead branches and describe-only export cleaned, toUnits renamed toHundredths, show() and nudge() helpers, named drawing constants, collarPx vs collar weight naming, unused import removed, test title fixed.
- Tests: 16 to 27 (brute-force solver check, 35 lb and 15 kg bars, kg closest, 1 lb collars, 4999, warm-up rounding, unit round trip, parseNumber).
- Template list: README rewritten; US spelling (color, personalized); fixed "Last updated" date on Privacy and Terms; no absolute paths in scripts; new-tool.sh removed; screenshots/ and .playwright-cli/ ignored and untracked; duplicate legal link block removed from home; deploy runs npm test first; Privacy no longer claims a cookie banner; Tailwind limited to src.
- GitHub Pages: astro.config reads PAGES_BASE and PAGES_SITE; all links, icons, og:image, robots and sitemap use the base; manifest is now generated (src/pages/site.webmanifest.ts); canonical always the real domain; .github/workflows/pages.yml added (checkout@v4, setup-node@v4 node 22, npm ci, npm test, build, upload-pages-artifact@v3, deploy-pages@v4). Verified locally under /barbell-plate-calculator/: home, about, privacy, terms, contact, 404, icons, manifest, sitemap and the tool all work; no link outside the base. dist-pages deleted.

## Rejected or not done
- Cap at 1500 lb: kept 4999, now written back to the field (owner can pick a lower cap).
- Editable warm-up percentages, Copy button, both-unit display, fractional plates, chip range per bar, add-plates-get-total mode: new features, not in the single-purpose spec. Listed below.
- Plate-pill check mark and the pale-10 lb contrast: nice, left as is (the dot has a border and the pill has a strike-through when off).
- Moving colors and diameters next to PLATES: left in Tool.astro (one drawing-only table, low value).
- Pre-rendering the default answer into the HTML: skipped; CLS handled with reserved heights.
- wrangler to npx, brute-force table caching (8 ms at the cap), style consolidation: not worth it.
- Real owner name in Terms: owner decision.

## Status
- npm test: 27 of 27 pass. npm run build: clean. CSS 22,928 B before, 23,377 B after (source(none) plus @source "../" applied; the new article tables account for the growth). Client JS 11 KB.
- Lighthouse: could not rerun (lighthouse failed to start here). Reviewer scores before: mobile 99/98/100/100. CLS and heading-order issues are fixed in code, so rerun before launch.
- Screenshots at 1280 and 390, light and dark, checked in screenshots/ (ignored by git).

## Left for the owner
- Put a real owner or business name in site.config.ts (`owner`).
- Rerun Lighthouse after the first deploy.
- The GitHub Pages build is not noindex. Its canonical points to platecalculatoronline.com, which is not live yet.

## Phase 2 SEO pages
1. How to load 135 lb on a barbell
2. How to load 185 lb on a barbell
3. How to load 225 lb on a barbell
4. How to load 275 lb on a barbell
5. How to load 315 lb on a barbell
6. How to load 405 lb on a barbell
7. How to load 95 lb on a barbell
8. How to load 100 kg on a barbell
9. How to load 60 kg on a barbell
10. How to load 140 kg on a barbell
11. Barbell weight: how much does a barbell weigh
12. Plate colors and weights (lb and kg chart)
13. Women's barbell (35 lb and 15 kg) plate loading
14. Warm-up sets for 225 lb bench press
15. Warm-up sets for 315 lb squat
16. Warm-up sets for 405 lb deadlift
17. kg to lb plate conversion chart
18. How many plates fit on an Olympic bar
19. Plate loading with 45 lb, 25 lb, 10 lb and 5 lb only
20. Powerlifting meet plate loading (competition collars)

## Gap fix (2026-10-20)
Done:
- Copy result and Copy link (share link ?w=&u=&bar=&p=&c=, read on load, validated). Links work on the home and load pages.
- Two nearest-load cards (under and over, with plates) plus a hint such as "Turn on the 1.25 lb plate to reach 227.5 lb exactly".
- Plate set presets (lb: Commercial gym default, Home set, All plates; kg: Competition default, Gym, Home set). The lb default no longer includes 35 lb plates. Saved settings key bumped to v3.
- 10 pre-rendered load pages (95, 135, 185, 225, 275, 315, 405 lb; 60, 100, 140 kg), each with its own intro, who lifts it, a tip, a computed table of other bars, plate sets and collars, a static warm-up table, FAQ, HowTo, FAQPage and Breadcrumb schema, and links to sibling loads. Linked from the home page. In the sitemap.
- Total shown in both units (225 lb = 102.1 kg). Editable warm-up percents and Copy warm-up. HowTo schema on the home page. Article text updated for the new default set.
- Tests: 32 of 32 pass (5 new). Build: 16 pages. Lighthouse (home, mobile): 100/100/100/100, CLS 0; load pages 100 performance, SEO 100, best practices 100, accessibility checked after fix on home only (100). Screenshots at 1280 and 390, light and dark, in screenshots/gap-*.png.
Skipped:
- Reverse mode (count a loaded bar): a second mode adds a lot of UI; later.
- Extra bar types (EZ, trap, safety, no bar): Custom bar covers them.
- Plate quantity limits, sticky mini result bar, printable card, gym-color plate option: lower value, later.
- More load pages beyond 10 (brief cap).
