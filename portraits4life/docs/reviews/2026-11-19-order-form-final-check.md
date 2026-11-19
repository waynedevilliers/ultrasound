# Order form final check (F5), 2026-11-19

Checked on the production build of `feat/order-info-accordion` (PR 92).

## Screens
- Full form at 375x667 and 1440x900.
- Empty submit: the error summary shows at the top, and each missing field is marked (checked at 375x667).
- Recipient field opened ("An eine andere Person liefern" ticked), at both sizes.
- Screenshots were taken to the local scratchpad folder and are not committed.

## Text check (rendered order page, German and English)
- No dashes and no emoji.
- No formal address ("Sie", "Ihnen").
- "Bestellen" appears only as the menu item and page title.
- "JPG, PNG, WebP oder HEIC" is the accepted upload formats, not a product.
- No mention of a digital file or download.

## Open
- Legal wording of the consents and the request decision (TODO(client)).
- The two form error messages that still say "Bestellung" (see PR 91).

## Mobile view (mobile-view agent, `docs/reviews/2026-11-19-mobile-order.md`)
- Passes: no sideways scrolling, body text 16px or more, no overlaps in the sticky bar, heading and intro in the first screen.
- Needs fixes: tap targets under 44px (form fields at 41 to 42px, the "An eine andere Person liefern" label, footer language switch and legal links, breadcrumb, logo link, privacy link in the consent text).
- Needs a decision: the product list cuts off the price at 375px.
- Page height grew 25 to 30% from the added consent block and information section.
