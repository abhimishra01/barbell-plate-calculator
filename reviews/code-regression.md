# Code review, lens: regression (Sherlock)

Verdict: answers are correct in every case I recomputed, and all template rules hold. 0 must-fix, 4 should-fix, 4 nice.

## What I checked
- `npm test`: 16 of 16 pass.
- Hand-checked 30+ cases against `solve()` and the live UI (static preview of `dist/`, port 4503, phone and desktop width). All match by hand:
  - lb: 95, 115, 135, 155, 185, 205, 225, 275, 315, 405.
  - kg: 60, 80, 100, 120, 140, 180, 200.
  - Warm-ups at 225 lb: 90 (10, 10, 2.5), 135 (45), 180 (45, 10, 10, 2.5), 225 (45, 45).
  - Closest and ties: 226 gives 225; 226.25 is a tie and goes lighter; 227 gives 227.5.
  - Special loads: 45.4, 47, only a 45 plate enabled, collars 1 and 2.5 lb, bar 0, bar 33.3, no plates, 4999, 1e6, NaN.
  - Unit switch: 225 lb to 102.5 kg and back to 225 lb.
  - Persistence: localStorage round trip.
- Every plate table in the article (10 lb rows, 7 kg rows) and the worked example match the solver output exactly.
- Template rules, all pass:
  - Canonical on every page.
  - `_headers` has the pages.dev and preview noindex rules.
  - About, Contact, Privacy and Terms are linked in the footer and in the home page links.
  - 404 exists and is noindex.
  - Sitemap lists the 5 pages and sitemap-index is referenced in robots.txt.
  - No `googletagmanager` or `googlesyndication` in the built HTML while `ga4` and `adsense` are empty.
  - `ads.txt` is a comment only when AdSense is off.
  - `dist/` is newer than every source file, so the build I tested is current.
- Known template leftovers (README, `new-tool.sh`, tracked screenshots, duplicate legal links, build-date "Last updated", British spelling "personalised"): not repeated here.

## Findings
| Severity | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| should | src/components/Tool.astro:320-322, 334-336 | Custom bar or collar field with empty or non-numeric text (`abc`, blank) is ignored. The old value (for example 33) keeps driving the result and warm-ups. Nothing on screen says so. | The user sees a blank field but gets answers for a hidden bar weight. This is a wrong answer in a lift setting. The "closest" status line also does not name the bar. | On invalid or empty input, show a clear "Enter a bar weight" state (reuse the `empty` path) or mark the field invalid. Name the bar in every status line. |
| should | src/components/Tool.astro:137 | The default collar weight is 2.5 in lb mode (and also 2.5 in kg mode). The FAQ and article say spring collars weigh about 1 lb and competition collars 2.5 kg. | A lb user who ticks "Count collars" gets 5 lb of collars in the total by default. That changes the plates and can make exact loads look impossible. The page contradicts its own text. | Default `collarW` to `{ lb: 1, kg: 2.5 }`. |
| should | src/components/Tool.astro:253-254 | When a load is not exact, only the opposite option appears. At 226 lb only "Go heavier 227.5" shows, and no "Go lighter" button. The article (Article.astro:70) promises "buttons for the next lighter and next heavier loads". The About page says the same. | The text promises something the tool does not do. | Reword both texts to "a one-tap button for the next closest load", or show both buttons. |
| should | src/components/Tool.astro:199-201 | When the plates are scaled to fit, `k` is applied to widths only, but the gaps (2 units each) stay fixed. Total drawn width is `k*sumW + n*gap`, which is more than `avail`. At about 15 or more plates per side, plates push into the collar space. At about 46 plates the 20 kg and 1.25 plates and the collar draw outside the 640 wide viewBox (confirmed by screenshot at 2267.5 kg). | The drawing no longer matches the list. The collar disappears. Only extreme loads are affected (over about 650 lb). | Scale the whole slot: `widths = widths.map(w => Math.max(5, (w + gap) * k - gap))`. |
| nice | src/components/Tool.astro:287-290 | Target above 4999 (for example 9999) is silently clamped to 4999 in the math. The input still shows 9999 until blur. | The status says "Cannot hit 4999 lb" while the field says 9999. | Write the clamped value back to the input as you type, or add `maxlength`. |
| nice | src/components/Tool.astro:309 | Switching units while the target field is empty (state 0) sets the target to the step (5 lb or 2.5 kg). | A blank field suddenly shows a value the user did not type. | Skip the conversion when `state.target` is 0. |
| nice | src/components/Tool.astro:72, Article.astro:16 | "Heavy plates go on first, next to the collar." In the drawing the heavy plates sit against the fixed shoulder, and the collar is at the outer end. | "Next to the collar" can be read as the outer collar. | Say "Heavy plates go on first, closest to the bar's shoulder, and the collar locks them on the outside." |
| nice | tests/plates.test.mjs:30, :50-60 | Test name says "61.25 per side" but the load is 41.25. Coverage is thin: no kg closest case, no collar plus closest case, no warm-up "closest" flag case, no tie in kg. | A wrong label hides what the test proves. The collar and kg-closest paths are exactly where the next regression will land. | Fix the name. Add 3 tests: kg closest, collar 1 lb with 225 (expects 224.5), warm-up at 226. |
| nice | .gitignore | The `.playwright-cli/` folder is untracked in git (a tool leftover). `reviews/` is too, which is fine if the fixer wants it. | Easy to commit by accident. | Add `.playwright-cli` to `.gitignore`. |
| nice | src/pages/404.astro | The 404 page has a canonical to `/404/`. It is also noindex, so no harm. | Template quirk only. | Skip the canonical when `noindex` is true. |
| nice | src/components/Tool.astro:75 | `<h3>Warm-up sets</h3>` comes right after the `<h1>` with no `<h2>` before it. | The heading outline skips a level. | Use an `<h2>` or a styled `<p>`. |

## Notes
- The solver is sound. It uses integer hundredths, a coin-change table for fewest plates, and the largest plate wins ties. A tie in distance goes to the lighter load, as the test says.
- Performance is fine: 4999 lb is a table of about 250k cells, 4 solves per keystroke, with no visible lag.
