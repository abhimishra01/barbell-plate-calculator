# Design and SEO review: barbell-plate-calculator

Reviewer: Miranda (independent). Date: 2026-10-20. Build: `npm run build` clean (6 pages). Served `dist/` on port 4506 (a preview from the builder already held 4501, so I used a static server on my own port). Viewed with playwright-cli at 1280 and 390, light and dark. Lighthouse run with Google Chrome headless.

## Scores (Lighthouse, local build)

| Run | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 99 | 98 | 100 | 100 |
| Desktop | 100 | 98 | 100 | 100 |

LCP 1.4 s mobile, 0.3 s desktop. TBT 0 ms. CLS 0.072 mobile, 0.05 desktop (caused by the tool's result area; see rows 2 and 3). Page weight 63 KiB. Accessibility loses points only for heading order (row 4).

**Verdict:** Clearly better than the competitors in the research (Planfit, FitnessVolt, app help pages): live answer as you type, drawn bar with colour-coded plates, plate toggles, closest-weight buttons, warm-up table, lb and kg, saved settings, dark mode, 63 KiB. Calculator maths checked by hand on 12 article table rows and the worked example: all correct. Two phone problems must be fixed before launch.

**Must-fix: 2.**

## Findings

| # | Severity | Area | Finding | Fix |
|---|---|---|---|---|
| 1 | Must | Phone, one-thumb use | At 390x844 the first screen shows the H1, intro text, the result and the bar picture. The target input sits about 1,150 px down the page, so the user must scroll past the result to type. While typing, the result is out of view. The result stack comes first (`order-first`) and the inputs follow. | On phones, put Units, Target and quick chips first, then the result and bar picture, then bar, plates and collars. Better: keep the result in a sticky strip under the header, or hide the intro paragraph below `sm`. Goal: input and result both visible without scrolling. |
| 2 | Must | Layout shift in use | The result box and warm-up table change height with the answer. Measured at 390: box 149 px at 225 lb, 217 px at 226 lb, 250 px at 1000 lb; the target input jumps 148 px (y 1147 to 1295) when the answer goes from exact to closest. Taps on the +/- buttons and chips move under the thumb. | Fix the result box height (room for two chip rows plus two status lines, `min-h` about 13rem on phones). Keep warm-up "(closest)" on its own line or remove it (row 7) so row heights stay equal. Solving row 1 by putting inputs first also removes the jump. |
| 3 | Should | Load CLS and no-JS | `#side-list`, `#result-status`, the bar SVG and the warm-up rows are empty in the HTML and filled by JS. This causes the load shift Lighthouse reports (0.072 on `figure`). With JS off, or before it runs, the tool shows nothing. No `<noscript>`. | Pre-render the default case (225 lb, 45 lb bar) in the markup. Add a `<noscript>` line and keep the Article tables as the fallback. |
| 4 | Should | Heading outline | H1 is followed by an H3 ("Warm-up sets"), then H2s in the article. Lighthouse flags heading order. | Make "Warm-up sets" an H2 (or a `<p>`). Keep one H1 and H2s below. |
| 5 | Should | Bar graphic | On phones the SVG scales to about 0.54, so plate labels are about 8 px and small plates (2.5, 1.25) are unreadable when 4 or more are loaded. At 225 lb the two plates fill only a quarter of the bar width. Plates look thin next to the long sleeve. | Draw the bar shorter or zoom the viewBox to the plates (scale to the loaded width). Raise label size to at least 11 px rendered. Show the small plates' labels above or below the plate. |
| 6 | Should | Touch targets | Quick-weight chips are 40 px high. Header nav links are 36 px high. Theme toggle is 40x40. Collar checkbox is 24x24 (its label row is 48 px, fine). Inline and footer legal links are 17 to 20 px high. The main controls (units, bar, plate pills, +/-) are 48 to 56 px and good. | Chips `min-height: 2.75rem`. Nav links `py-2.5` (44 px). Toggle `h-11 w-11`. Add padding to footer links. |
| 7 | Should | Warm-up table | When the target is not an exact load, every row shows "(closest)", even when the difference is 0.4 lb (226 lb: 90 lb "(closest)"). On phones the label wraps and rows become tall and noisy. | Round each warm-up to the nearest loadable weight silently. Show a note only when the change is more than one smallest step. One footnote under the table is enough. |
| 8 | Should | Accuracy | Collar default is 2.5 in both units. In lb mode that matches nothing: the article says spring collars weigh about 1 lb and competition collars 2.5 kg (5.5 lb). | Default 1 lb in lb mode and 2.5 kg in kg mode. Label the field with "spring collar about 1 lb". |
| 9 | Should | Article depth for "plate calculator" | About 900 words of article plus 8 FAQ. Good basics and correct tables, but thin on what the top results cover: a plate colour chart, how many plates fit on the sleeve, women's and training bar notes, kg-to-lb plate equivalents, loads for squat, bench, deadlift, and common targets (95, 135, 225, 315, 405). | Add 3 short sections: "Plate colors and weights" (table lb and kg), "Barbell weights by bar type" (table), "How many plates fit". Keep the writing plain. Later: one page per common weight (for example "how to load 225 lb on a barbell") linked from the home page. |
| 10 | Should | Internal links | Home page links only to About, Privacy, Terms and Contact (twice: under the tool and in the footer). The article does not link to the tool or to anything else. | Add in-article "Go back to the calculator" anchor links (`#tool`). Remove the duplicate legal-link row under the tool. |
| 11 | Low | Invalid input | Typing "abc" leaves the text in the box and shows "Enter a weight". No `aria-invalid`, no inline message on the field. | Strip non-numeric characters on input or set `aria-invalid="true"` and show the message beside the field. |
| 12 | Low | Structured data | All three JSON-LD blocks parse. The BreadcrumbList has one item (no value). FAQPage no longer earns rich results for most sites, but it is valid and harmless. WebApplication is fine (no fake ratings, good). | Drop the single-item BreadcrumbList. Keep WebApplication and FAQPage. |
| 13 | Low | Meta | Title "Plate Calculator: Barbell Plates Per Side (lb & kg)" is 51 characters and fits. Description is 125 characters, fine. `<meta name="keywords">` is ignored by Google. | Remove the keywords tag. Keep title and description. |
| 14 | Low | Plate colour legend | Colours follow competition plates (kg: red 25, blue 20, yellow 15, green 10, white 5). Most US iron plates are black, so a lifter may wonder what the colours mean. | Add one line under the bar picture: "Colors follow competition plates. Your plates may look different." |
| 15 | Low | Hero copy | The pill "Free, fast and private" above the H1 is generic. The intro repeats the page title. On desktop the H1 block pushes the tool down about 340 px. | Remove the pill or replace it with a proof line such as "Works offline after the first visit" only if true. Shorten the intro to one line. |
| 16 | Low | Plate toggle state | "On" is shown only by an orange border. "Off" is faded with strikethrough (not colour alone, good). The white 10 lb / 5 kg dot is low contrast on the light card. | Add a check mark inside the pill when on. |
| 17 | Low | Feature gap (nice to have) | No way to go the other way (enter the plates on the bar, get the total) and no copy or share of the result. | Later: "Add plates, get the total" mode and a Copy button. Not needed for launch. |

## What passes

- **Title, meta, canonical:** correct, absolute canonical on the real domain; OG and Twitter tags complete; `og.png` is 1200x630, clear and on brand (the bar drawing runs off the right edge, which is fine).
- **Sitemap and robots:** `sitemap-index.xml` points to `sitemap-0.xml` with 5 URLs (404 excluded); `robots.txt` allows all and names the sitemap; 404 has `noindex`; `_headers` sets noindex for `*.pages.dev` only.
- **Logo and favicon:** SVG favicon, 32 px PNG, 180 and 512 px icons, manifest. The barbell mark is simple and reads at 32 px.
- **Colour and type:** one orange brand colour, system font stack, strong H1, monospaced numerals in the input and table. Light and dark both look finished; no horizontal scroll at 390 (scrollWidth 390).
- **Accessibility:** skip link, labels on every input, live region for the result, `aria-label` on the SVG with the loaded plates, focus rings, radio and checkbox groups in fieldsets, table with caption and scoped headers, reduced-motion respected.
- **Empty and error states:** empty field, below-bar target, bar only, "cannot hit exactly" with one-tap lighter and heavier buttons, 10+ plates warning all work.
- **Writing:** plain US English, no em dashes, no vendor or AI mentions found in `src/`.

Note: running `npm run build` rewrote `dist/` (read-only rule exception from the brief). No source files were changed. Server on 4506 stopped.
