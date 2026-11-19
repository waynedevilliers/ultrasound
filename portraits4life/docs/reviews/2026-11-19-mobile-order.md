# Mobile check: German order page (/de/order), 2026-11-19

Base URL: http://localhost:3000. Scope: /de/order at 375x667 and 320x568. The script also measured /de, /en and /en/order; those numbers are in `docs/reviews/mobile/result.json`.

**Verdict: Needs fixes**

## Checks

| # | Check | 375px | 320px |
|---|-------|-------|-------|
| 1 | No sideways scrolling | Pass | Pass |
| 2 | First screen: h1, supporting line, order button, part of image | h1 and supporting line pass; order button and image n/a (form page, no hero) | Same as 375 |
| 3 | Exactly one primary order button in first screen | n/a (0 on form page; submit is at the bottom of the form) | n/a |
| 4 | Tap targets 44x44 and 8px apart | Fail (see C1 to C4) | Fail |
| 5 | Body text 16px or more | Pass (0 elements under 16px) | Pass |
| 6 | Nothing overlaps in the sticky bar | Pass | Pass |
| 7 | Page height vs last report (growth above 15%) | Fail: +25% (2758 to 3443 px) | Fail: +30% (2830 to 3683 px) |
| 11 | Form: visible labels, easy upload tap area, errors | Pass for labels and upload (label box 279x156). Errors not re-tested here | Same |
| 13 | Nothing cut off or squeezed | Fail: product select hides the price (I1) | Fail: same select, narrower |

Checks 8 to 10 and 12 are about the menu, FAQ, format cards and before and after pairs; they were not part of this request.

## Findings

### Critical
- **C1. Text inputs and selects are 41 to 42px high.** Page: /de/order. Element: `components/OrderForm.tsx`, shared field class (name, email, child name, weeks, street, PLZ, Ort, product select, country select). Fix: height 44px (`h-11`) on the shared class. This was already flagged in the 2026-11-16 report and is still open.
- **C2. Consent and recipient checkboxes are small.** Element: `#deliverToOther` label is 279x24 px (one line of text). The 20x20 box is the only visual target on that row. Fix: `min-h-11` and vertical padding on the label, so the whole row is 44px high. The three consent labels are taller (72 to 168 px) and already pass.
- **C3. Footer and language switch are small.** Page: every page, seen on /de/order. Elements: DE | EN buttons 20x24 px; Impressum and Datenschutzerklärung links 24px; email link 21px; footer logo link 32px. Fix: 44px minimum height and a padded hit area on each; keep the visual size.
- **C4. Header and breadcrumb links are small.** Elements: "Startseite" breadcrumb link 24px high; sticky-bar logo link 28px high (375px) and 24px (320px). Fix: 44px hit area through padding, no change to the look.

### Important
- **I1. Product select cuts off the price.** Element: `select#format`. The closed select shows "Leinwanddruck 30 × 30 cm, 89" at 375px; the price is cut off. At 320px the select is 224px wide, so it truncates sooner (320px screenshot not inspected visually), and the price is the point of the field. Fix: shorter option labels on phones (for example "30 × 30 cm, 89 €" with the format name as a group or a line above), or show the chosen price as text under the select.
- **I2. Page height grew more than 15%.** /de/order: 3443 px (375) and 3683 px (320), against 2758 and 2830 in the 2026-11-16 report. /en/order: 3395 and 3539 px, against 2694 and 2782 (about +26%). Landing pages grew by under 2%. The growth is most likely the consent block and the info accordions, but this was not measured per section. The owner should confirm this growth is intended.
- **I3. Consent link is 21px high.** Element: "Datenschutzerklärung" link inside the consent label. The label is the tap area, so this is minor, but the link itself is under 44px. Fix: padding on the link.

### Nice to have
- **N1.** The PLZ field is 69px wide at 320px. It fits five digits, but it looks tight beside the Ort field. Consider a 2-column grid of 40/60 instead of 50/50 at 320px.
- **N2.** The honeypot input (`name="website"`) is off-screen at left -9940px and aria-hidden. The script counts it as a small target; this is a false positive, not a finding.

## Verified in this run
- First screen at 375x667 and 320x568: h1 and supporting line visible, no horizontal overflow.
- Upload area: the full dashed box (279x156 at 375px, 224x156 at 320px) is the tap target; the file input is visually hidden and focusable.
- Info section ("Gut zu wissen"): two accordion triggers with 17px between them (the 1px gap in the 2026-11-16 report is fixed); text 16px or larger.
- The 2026-11-16 finding "14px text on the order page" is fixed in this run (0 elements under 16px).

## Screenshots (375x667, in `docs/reviews/mobile/`)
- `order-de-375-1-form-top.png`: form top with the product select and upload box
- `order-de-375-2-shipping.png`: shipping address, PLZ and Ort on one row, country select, checkboxes
- `order-de-375-3-upload.png`: upload area and optional fields
- `order-de-375-4-info.png`: "Gut zu wissen" section and footer
- `order-de-375-5-bottom.png`: page bottom

Screenshots at 320px were taken as well (`order-de-320-*.png`). The script also overwrote the landing screenshots and `result.json` in that folder.

No project code was changed.
