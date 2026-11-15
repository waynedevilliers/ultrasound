# Remaining work

Status as of 2026-11-15. Plan v3 steps 1 to 13 are built in code. Launch is not yet possible; these items are kept for later.

## Blocking launch (needs owner, client or deployment access)
- Impressum and Datenschutz: operator details and retention for order data (TODO(client), see docs/legal-client-review.md).
- SITE_URL set on Vercel to the live domain (canonical links, sitemap, structured data).
- Sender domain verified with Resend; ORDER_FROM_EMAIL and ORDER_EMAIL set.
- Order flow tested end to end: upload, email, database (needs a deployment and credentials).
- Secrets set on the host: ORDER_LINK_SECRET, CRON_SECRET, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN, DATABASE_URL.
- Phone speed: LCP 3.1 s landing, 2.7 s order (target 2.5 s). Needs a decision on the phone layout.
- Live security headers checked with curl on the deployed site.
- Consent for health-related images before upload (legal advice).

## Code, not started
- Order rate limit across server instances, and a rate limit on the upload token route.
- 429 rate-limit response shows the generic message; a network error during the photo check shows "Upload missing".
- Split components/OrderForm.tsx (large) and remove repeated markup.
- Prettier: 65 files do not match the project config. Format in its own step (Prettier 3.9.10 is installed as a dev dependency).
- knip: unused files (components/ui/button.tsx, components/ui/tabs.tsx, lib/db.ts), unused exports and dependencies, dotenv used but not declared. Remove only with approval.
- Rename middleware.ts to proxy.ts (build deprecation warning).
- Visible text still in some components instead of messages/*.json (hero and facts box text, parts of the order page).
- Duplicate DECISIONS dates: some entries dated 2026-11-15 were written on 2026-11-14.
- Dead header copy keys (howItWorks, about, faq) for routes no longer in the menu.

## Open decisions
- "Kontakt" menu label lands on a section headed "Bereit für dein Kunstwerk?". Keep or change.
- Closing button stays primary (the same primary button may repeat when it leads to the order page).
- FAQ answers, shipping costs and delivery start wording: client confirmation (docs/faq-client-review.md).
- Canvas photos: PNG files of about 3 MB each (over the 500 KB rule). Convert before launch.
- Alt texts and captions for the canvas photos, the artist note and its photo: client (TODO(client)).

## Done since the last version of this list
- Field-level errors on the order form (Step 11) and the review fixes (PR #29, #30).
- Image folders by section; reference screenshots moved out of the project (Step 12, PR #31).
