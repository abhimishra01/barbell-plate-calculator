# Mock-customer test: barbell plate calculator

Tester: Shuri. Date: 2026-10-20. Build: `npm run build`, then the built `dist` served on port 4507 (see the note at the end). Each persona used the live page with playwright-cli: typed real values, clicked real controls, read the results. I checked several answers by hand. All of them were correct.

## The five personas

### 1. Jake, 19, college student, iPhone 15 (390 x 844). Beginner
Task: first bench session, "I want 135, what goes on the bar?"
Story: Jake lands from Google. The page already shows an answer for 225, so he knows what the tool does at once. He needs 135. The input is below the results and the picture, so he scrolls down about 800 px and taps the 135 chip. The answer is now above the screen. He scrolls back up and reads "45 x 1". Total time: about 25 seconds, half of it scrolling. He then reads the warm-up table. It says "55 lb (closest)" for the first set and "107.5 lb (closest)" for the third. He does not know what "closest" means. He cannot load 1.25 lb, because his gym has no such plate.
- Click this on Google over the others? Yes, if the page opens fast and shows a bar picture. Other sites look old.
- Done in 30 seconds? Barely.
- Confused by: "(closest)", "Count collars", the 1.25 lb plate, and the bar-only warm-up that is missing.
- Bookmark if: the weight box is at the top and the answer stays in view.
- Trust? Yes. 135 = one 45 matches what he knows.
- Come back? Yes, he lifts three days a week.

### 2. Maria, 34, nurse, intermediate lifter, iPhone (390 x 844). Women's bar
Task: 155 lb deadlift on a 35 lb bar. Her gym has no 35 lb plates and no 2.5 lb plates.
Story: She taps the 35 lb bar, then turns off 35 lb and 2.5 lb. The off plates show a strike-through, so she sees the change at once. The answer, 45 + 10 + 5 per side, is right. She reloads the page and all her settings are still there, including the 155. That wins her over. Then she looks at the warm-ups. The 40% set is "10 + 1.25 x 3". She does not own three 1.25 lb plates, and nobody does. She wants round loads she can really make.
- Click on Google? Yes. The 35 lb bar preset is the reason.
- Under 30 seconds? Yes, about 20 seconds, because settings stick.
- Confused by: 1.25 lb plates that are on by default, and stacked tiny plates in warm-ups.
- Bookmark if: warm-ups use round numbers she could really load, and the page opens with her settings (it does).
- Trust? Yes.
- Come back? Yes, every gym day.

### 3. Dave, 45, powerlifter and meet lifter, laptop 1280 x 800. Expert
Task: log a 182.5 kg squat with competition collars before he writes his training sheet.
Story: Dave switches to kg and types 182.5. The answer is 3 x 25, 5 and 1.25 per side, with the IPF colors. Correct. He switches on collars (2.5 kg) and the answer changes to 3 x 25, 2.5, 1.25. This is correct and exactly what he wanted. On the 1280 screen he sees inputs, plates and the bar side by side with no scrolling. This is the best layout of the five. He then wants more: a ramp that he sets (50/70/85/90%), fractional plates (0.25 and 0.5 kg) for small jumps, and a copy button to paste the loads into his notes. None of these exist.
- Click on Google? Yes. The collars option and the kg colors show it is made for lifters.
- Under 30 seconds? Yes, about 12 seconds.
- Confused by: nothing. He is annoyed that the warm-up ramp is fixed at 40/60/80.
- Bookmark if: he can set his own percentages and copy the result as text.
- Trust? Yes. The collar math is right.
- Come back? Yes, if the ramp is editable. Otherwise he uses his spreadsheet.

### 4. Priya, 28, Olympic weightlifting club member, Android phone (360 x 780). Kg, 15 kg bar
Task: 62.5 kg snatch work set on a 15 kg bar.
Story: She taps kg, then the 15 kg bar, and types 62.5. The answer is 20 + 2.5 + 1.25 per side. Correct. She then turns off 1.25 kg to see what happens (her club has few fractional plates). The page says "Cannot hit 62.5 kg exactly. Closest load is 60 kg" and offers "Go heavier: 65 kg" as a button. She likes this. She has no horizontal scroll at 360 px. The chips (60 to 180) are too heavy for her. She wants 30 to 100. The first warm-up set should be the empty bar, and she thinks in 50/70/90%.
- Click on Google? Yes. kg and the 15 kg bar are on the first screen.
- Under 30 seconds? Yes, about 20 seconds.
- Confused by: result scrolls off screen when she changes the weight (same as Jake).
- Bookmark if: chips fit her range, and the warm-up includes the bar.
- Trust? Yes.
- Come back? Yes.

### 5. Tom, 62, retired, home gym, iPad (768 x 1024). Mixed old plates
Task: his plates are 45, 25, 10 and 5 lb only. He wants 227 lb, then an EZ curl bar at 20 lb.
Story: He turns off 35, 2.5 and 1.25. For 227 the page says "Cannot hit 227 lb exactly. Closest load is 225 lb" with a "Go heavier: 235 lb" button. He finds this clear and useful. He sets Custom bar to 20 and types 60. Result: 10 x 2. Correct. On the iPad the layout is the phone layout: the answer is at the top and all the controls are below the fold, although the screen has space for two columns. The pale 10 lb plate is hard to see on the pale background. He does not know what a "collar" setting is for (he calls them clips).
- Click on Google? Yes. It looks clean, the type is big.
- Under 30 seconds? Yes after the first set-up. The first set-up took about 40 seconds.
- Confused by: "Count collars", and why the iPad shows one column.
- Bookmark if: the page remembers his plates (it does) and the iPad uses the width.
- Trust? Yes. He checked 185 = 45 + 25 per side.
- Come back? Yes.

## Ranked change list

| # | Priority | Change | Asked by |
|---|----------|--------|----------|
| 1 | Must | Phone and tablet: keep the answer in view while the user changes weight. Put the weight box and chips above the result, or add a small sticky bar with the plates per side. Today the controls sit about 800 px below the result, and the answer scrolls out of view after every tap. | 4 of 5 (Jake, Maria, Priya, Tom) |
| 2 | Must | Make the warm-up sets practical: first set is the empty bar, round to loads a person can really make (5 lb or 2.5 kg steps), never stack tiny plates (no "1.25 x 3"), and explain or drop "(closest)". | 4 of 5 (Jake, Maria, Priya, Dave) |
| 3 | Must | Turn the 1.25 lb plate off by default in lb mode (US gyms rarely have it). Keep it as one tap to switch on. | 3 of 5 (Jake, Maria, Tom) |
| 4 | Should | Let the user edit the warm-up percentages (for example 50/70/85/90) and show a bar-only row. | 2 of 5 (Dave, Priya) |
| 5 | Should | Add "Copy" for the result and warm-up as plain text, to paste into notes or a chat. | 3 of 5 (Dave, Maria, Priya) |
| 6 | Should | Use two columns from about 700 px wide, so tablets show the controls and the answer together. | 2 of 5 (Tom, Dave in spirit) |
| 7 | Should | Chips should fit the bar and unit: show 30 to 100 kg for a 15 kg bar, 55 to 135 lb for a 35 lb bar. | 2 of 5 (Priya, Maria) |
| 8 | Should | Show the other unit next to the total ("182.5 kg = 402 lb"). | 2 of 5 (Dave, Priya) |
| 9 | Nice | Rename or explain "Count collars" ("clips or clamps"). | 2 of 5 (Jake, Tom) |
| 10 | Nice | Fractional plates (0.25, 0.5 kg; 0.25, 0.5, 0.75 lb) as an option for meet lifters. | 1 of 5 (Dave) |
| 11 | Nice | A weight of 0 or below shows "Type a target weight". Say "Enter a weight above 0" instead. | 1 of 5 (Tom) |
| 12 | Nice | Sticky header covers the top of the focused weight box after a scroll. Add scroll margin. The 10 lb plate (white) needs a darker edge on the bar picture in light mode. | 2 of 5 (Maria, Tom) |

## What already works (keep it)
- Correct math in every case I tried (lb, kg, 35 lb and 15 kg bars, custom bar, collars, missing plates).
- Closest-load message with one-tap "Go lighter" and "Go heavier" buttons.
- Settings and the last weight are saved between visits.
- Tap targets are 48 px or more on plates and bars, 56 px on the weight box and the plus and minus buttons. Only the quick-weight chips are 40 px high.
- No horizontal scroll at 360 px. Dark mode is clean.
- Sanity checks: a target under the bar and a 1000 lb target both give sensible messages.

## Test notes
- Port 4507: astro preview 7 runs one background server per project folder, and another agent's server for this site already held port 4501 (pid 2449). I did not touch it. I served the fresh `dist` from this build on 4507 with a plain static server and stopped it at the end.
- The playwright-cli browser session was closed twice by other agents working at the same time. I reopened it and repeated the step.
