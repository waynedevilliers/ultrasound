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

## Order and security review (2026-11-15), for later
Full audit: docs/reviews/2026-11-15-audit.md. Parked until the visual work is done.
- CRITICAL: the Content-Security-Policy (connect-src 'self') blocks direct photo uploads to Vercel Blob, so orders with a photo cannot be sent. Test on a Vercel preview after the fix.
- An order is saved before the signing secret is checked; a missing ORDER_LINK_SECRET leaves an order with no email, and retries duplicate it.
- ORDER_FROM_EMAIL falls back to onboarding@resend.dev, so customer mail fails silently in production.
- Order emails are English only; German is the main audience.
- Unconfirmed promises: "innerhalb von 24 Stunden", "kostenlos erneut einreichen".
- Payment and delivery timing contradict each other (order info, form, pricing, FAQ).
- JSON-LD highPrice is 50, the page says "ab 30 €" (align with the product file).
- Gallery lightbox not keyboard accessible (div with onClick, no dialog role, no Escape).
- Success button: white on green-600, contrast 3.30:1 (below 4.5:1); owner colour decision.
- Order page copy uses "Sie"; order.info.* block is unused and can be deleted.
- Upload token route: bad JSON is an unhandled 500; no rate limit.
- Honeypot branch unreachable for filled values; "Website" label is English.
- Client components only for usePathname (Hero, FactsBox, PricingTiers, IntroSection, HowItWorks, ContactSection, Footer): should be Server Components with locale as a prop.
- Landing not statically generated (no generateStaticParams).
- next-intl is installed but copy is imported as JSON (lib/copy.ts); DECISIONS says next-intl.
- middleware.ts to proxy.ts rename (deprecation warning).
- README out of date (env names, Node version, branch names, removed endpoint).
- Dead code from knip (components/ui/button.tsx, ui/tabs.tsx, lib/db.ts, unused exports and dependencies).
- Test gaps: language switch, Gallery, PricingTiers.
- Duplicate contact email in five places; language switch in Header and Footer.
- Product JSON-LD lacks image and Offer url.
- Stale root docs (INSTRUCTIONS.md, PROJECT_STATUS.md, TEST_GUIDE.md); unused template SVGs in public/.
- Outdated packages: TypeScript, ESLint 9, Vitest 4, React, next-intl (majors need their own step).
